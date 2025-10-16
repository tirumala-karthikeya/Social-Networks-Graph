import { User, IUserDocument } from '../models/User';
import { IUserInput, IUserUpdate, IGraphData } from '../types';
import { ApiResponse } from '../utils/response';

export class UserService {
  // Get all users
  static async getAllUsers(): Promise<IUserDocument[]> {
    try {
      const users = await User.find({})
        .select('-__v')
        .sort({ createdAt: -1 });
      return users;
    } catch (error) {
      throw new Error(`Failed to fetch users: ${error}`);
    }
  }

  // Get user by ID
  static async getUserById(id: string): Promise<IUserDocument | null> {
    try {
      const user = await User.findOne({ id }).select('-__v');
      return user;
    } catch (error) {
      throw new Error(`Failed to fetch user: ${error}`);
    }
  }

  // Create new user
  static async createUser(userData: IUserInput): Promise<IUserDocument> {
    try {
      // Check if username already exists
      const existingUser = await User.findOne({ username: userData.username });
      if (existingUser) {
        throw new Error('Username already exists');
      }

      const user = new User(userData);
      await user.save();
      
      // Calculate initial popularity score
      await user.calculatePopularityScore();
      
      return user;
    } catch (error) {
      if (error instanceof Error && error.message === 'Username already exists') {
        throw error;
      }
      throw new Error(`Failed to create user: ${error}`);
    }
  }

  // Update user
  static async updateUser(id: string, updateData: IUserUpdate): Promise<IUserDocument | null> {
    try {
      const user = await User.findOne({ id });
      if (!user) {
        return null;
      }

      // Check if username is being updated and if it already exists
      if (updateData.username && updateData.username !== user.username) {
        const existingUser = await User.findOne({ 
          username: updateData.username,
          id: { $ne: id }
        });
        if (existingUser) {
          throw new Error('Username already exists');
        }
      }

      // Update user data
      Object.assign(user, updateData);
      await user.save();

      // Recalculate popularity score if hobbies were updated
      if (updateData.hobbies) {
        await user.calculatePopularityScore();
      }

      return user;
    } catch (error) {
      if (error instanceof Error && error.message === 'Username already exists') {
        throw error;
      }
      throw new Error(`Failed to update user: ${error}`);
    }
  }

  // Delete user
  static async deleteUser(id: string): Promise<boolean> {
    try {
      const user = await User.findOne({ id });
      if (!user) {
        return false;
      }

      // Check if user can be deleted (no friends)
      const canDelete = await User.canDeleteUser(id);
      if (!canDelete) {
        throw new Error('Cannot delete user with existing friendships. Please remove all friendships first.');
      }

      await User.deleteOne({ id });
      return true;
    } catch (error) {
      if (error instanceof Error && error.message.includes('Cannot delete user')) {
        throw error;
      }
      throw new Error(`Failed to delete user: ${error}`);
    }
  }

  // Add friendship
  static async addFriendship(userId: string, friendId: string): Promise<void> {
    try {
      const user = await User.findOne({ id: userId });
      if (!user) {
        throw new Error('User not found');
      }

      if (userId === friendId) {
        throw new Error('User cannot be friends with themselves');
      }

      await user.addFriend(friendId);
    } catch (error) {
      if (error instanceof Error && (
        error.message === 'User not found' ||
        error.message === 'Friend not found' ||
        error.message === 'Users are already friends' ||
        error.message === 'User cannot be friends with themselves'
      )) {
        throw error;
      }
      throw new Error(`Failed to add friendship: ${error}`);
    }
  }

  // Remove friendship
  static async removeFriendship(userId: string, friendId: string): Promise<void> {
    try {
      const user = await User.findOne({ id: userId });
      if (!user) {
        throw new Error('User not found');
      }

      await user.removeFriend(friendId);
    } catch (error) {
      if (error instanceof Error && (
        error.message === 'User not found' ||
        error.message === 'Friend not found' ||
        error.message === 'Users are not friends'
      )) {
        throw error;
      }
      throw new Error(`Failed to remove friendship: ${error}`);
    }
  }

  // Get graph data
  static async getGraphData(): Promise<IGraphData> {
    try {
      const graphData = await User.getGraphData();
      return graphData;
    } catch (error) {
      throw new Error(`Failed to fetch graph data: ${error}`);
    }
  }

  // Get user statistics
  static async getUserStats(): Promise<{
    totalUsers: number;
    totalFriendships: number;
    averagePopularityScore: number;
    topUsers: IUserDocument[];
  }> {
    try {
      const totalUsers = await User.countDocuments();
      
      const users = await User.find({}).select('friends popularityScore');
      const totalFriendships = users.reduce((sum: number, user: any) => sum + user.friends.length, 0) / 2; // Divide by 2 for bidirectional
      
      const averagePopularityScore = users.length > 0 
        ? users.reduce((sum: number, user: any) => sum + user.popularityScore, 0) / users.length 
        : 0;

      const topUsers = await User.find({})
        .select('-__v')
        .sort({ popularityScore: -1 })
        .limit(5);

      return {
        totalUsers,
        totalFriendships,
        averagePopularityScore: Math.round(averagePopularityScore * 100) / 100,
        topUsers
      };
    } catch (error) {
      throw new Error(`Failed to fetch user statistics: ${error}`);
    }
  }

  // Search users
  static async searchUsers(query: string): Promise<IUserDocument[]> {
    try {
      const users = await User.find({
        $or: [
          { username: { $regex: query, $options: 'i' } },
          { hobbies: { $in: [new RegExp(query, 'i')] } }
        ]
      }).select('-__v').limit(20);

      return users;
    } catch (error) {
      throw new Error(`Failed to search users: ${error}`);
    }
  }

  // Get all unique hobbies
  static async getAllHobbies(): Promise<string[]> {
    try {
      const users = await User.find({}).select('hobbies');
      const allHobbies = users.flatMap((user: any) => user.hobbies);
      const uniqueHobbies = [...new Set(allHobbies)].sort();
      return uniqueHobbies as string[];
    } catch (error) {
      throw new Error(`Failed to fetch hobbies: ${error}`);
    }
  }

  // Remove hobby from user
  static async removeHobby(userId: string, hobby: string): Promise<IUserDocument | null> {
    try {
      const user = await User.findOne({ id: userId });
      if (!user) {
        return null;
      }

      // Check if user has this hobby
      if (!user.hobbies.includes(hobby)) {
        throw new Error('Hobby not found');
      }

      // Remove hobby from user
      user.hobbies = user.hobbies.filter((h: string) => h !== hobby);
      await user.save();

      // Recalculate popularity score
      await user.calculatePopularityScore();

      return user;
    } catch (error) {
      if (error instanceof Error && error.message === 'Hobby not found') {
        throw error;
      }
      throw new Error(`Failed to remove hobby: ${error}`);
    }
  }
}