import { Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { ApiResponse } from '../utils/response';
import { IUserInput, IUserUpdate } from '../types';

export class UserController {
  // GET /api/users
  static async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await UserService.getAllUsers();
      ApiResponse.success(res, users, 'Users fetched successfully');
    } catch (error) {
      ApiResponse.error(res, 'Failed to fetch users', 500, error);
    }
  }

  // GET /api/users/:id
  static async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await UserService.getUserById(id);
      
      if (!user) {
        ApiResponse.notFound(res, 'User');
        return;
      }

      ApiResponse.success(res, user, 'User fetched successfully');
    } catch (error) {
      ApiResponse.error(res, 'Failed to fetch user', 500, error);
    }
  }

  // POST /api/users
  static async createUser(req: Request, res: Response): Promise<void> {
    try {
      const userData: IUserInput = req.body;
      const user = await UserService.createUser(userData);
      ApiResponse.success(res, user, 'User created successfully', 201);
    } catch (error) {
      if (error instanceof Error && error.message === 'Username already exists') {
        ApiResponse.conflict(res, error.message);
        return;
      }
      ApiResponse.error(res, 'Failed to create user', 500, error);
    }
  }

  // PUT /api/users/:id
  static async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: IUserUpdate = req.body;
      
      const user = await UserService.updateUser(id, updateData);
      
      if (!user) {
        ApiResponse.notFound(res, 'User');
        return;
      }

      ApiResponse.success(res, user, 'User updated successfully');
    } catch (error) {
      if (error instanceof Error && error.message === 'Username already exists') {
        ApiResponse.conflict(res, error.message);
        return;
      }
      ApiResponse.error(res, 'Failed to update user', 500, error);
    }
  }

  // DELETE /api/users/:id
  static async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await UserService.deleteUser(id);
      
      if (!deleted) {
        ApiResponse.notFound(res, 'User');
        return;
      }

      ApiResponse.success(res, null, 'User deleted successfully');
    } catch (error) {
      if (error instanceof Error && error.message.includes('Cannot delete user')) {
        ApiResponse.conflict(res, error.message);
        return;
      }
      ApiResponse.error(res, 'Failed to delete user', 500, error);
    }
  }

  // POST /api/users/:id/link
  static async addFriendship(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { friendId } = req.body;
      
      if (!friendId) {
        ApiResponse.error(res, 'Friend ID is required', 400);
        return;
      }

      await UserService.addFriendship(id, friendId);
      ApiResponse.success(res, null, 'Friendship created successfully');
    } catch (error) {
      if (error instanceof Error && (
        error.message === 'User not found' ||
        error.message === 'Friend not found' ||
        error.message === 'Users are already friends' ||
        error.message === 'User cannot be friends with themselves'
      )) {
        ApiResponse.conflict(res, error.message);
        return;
      }
      ApiResponse.error(res, 'Failed to create friendship', 500, error);
    }
  }

  // DELETE /api/users/:id/unlink
  static async removeFriendship(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { friendId } = req.body;
      
      if (!friendId) {
        ApiResponse.error(res, 'Friend ID is required', 400);
        return;
      }

      await UserService.removeFriendship(id, friendId);
      ApiResponse.success(res, null, 'Friendship removed successfully');
    } catch (error) {
      if (error instanceof Error && (
        error.message === 'User not found' ||
        error.message === 'Friend not found' ||
        error.message === 'Users are not friends'
      )) {
        ApiResponse.conflict(res, error.message);
        return;
      }
      ApiResponse.error(res, 'Failed to remove friendship', 500, error);
    }
  }

  // GET /api/graph
  static async getGraphData(req: Request, res: Response): Promise<void> {
    try {
      const graphData = await UserService.getGraphData();
      ApiResponse.success(res, graphData, 'Graph data fetched successfully');
    } catch (error) {
      ApiResponse.error(res, 'Failed to fetch graph data', 500, error);
    }
  }

  // GET /api/users/stats
  static async getUserStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await UserService.getUserStats();
      ApiResponse.success(res, stats, 'User statistics fetched successfully');
    } catch (error) {
      ApiResponse.error(res, 'Failed to fetch user statistics', 500, error);
    }
  }

  // GET /api/users/search
  static async searchUsers(req: Request, res: Response): Promise<void> {
    try {
      const { q } = req.query;
      
      if (!q || typeof q !== 'string') {
        ApiResponse.error(res, 'Search query is required', 400);
        return;
      }

      const users = await UserService.searchUsers(q);
      ApiResponse.success(res, users, 'Search results fetched successfully');
    } catch (error) {
      ApiResponse.error(res, 'Failed to search users', 500, error);
    }
  }

  // GET /api/hobbies
  static async getAllHobbies(req: Request, res: Response): Promise<void> {
    try {
      const hobbies = await UserService.getAllHobbies();
      ApiResponse.success(res, hobbies, 'Hobbies fetched successfully');
    } catch (error) {
      ApiResponse.error(res, 'Failed to fetch hobbies', 500, error);
    }
  }

  // DELETE /api/users/:id/hobbies/:hobby
  static async removeHobby(req: Request, res: Response): Promise<void> {
    try {
      const { id, hobby } = req.params;
      
      if (!hobby) {
        ApiResponse.error(res, 'Hobby is required', 400);
        return;
      }

      const user = await UserService.removeHobby(id, hobby);
      
      if (!user) {
        ApiResponse.notFound(res, 'User');
        return;
      }

      ApiResponse.success(res, user, 'Hobby removed successfully');
    } catch (error) {
      if (error instanceof Error && error.message === 'Hobby not found') {
        ApiResponse.conflict(res, error.message);
        return;
      }
      ApiResponse.error(res, 'Failed to remove hobby', 500, error);
    }
  }
}