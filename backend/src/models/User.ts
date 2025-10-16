import mongoose, { Document, Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { IUser } from '../types';

export interface IUserDocument extends Document {
  id: string;
  username: string;
  age: number;
  hobbies: string[];
  friends: string[];
  createdAt: Date;
  popularityScore: number;
  calculatePopularityScore(): Promise<number>;
  addFriend(friendId: string): Promise<void>;
  removeFriend(friendId: string): Promise<void>;
  updateHobbies(newHobbies: string[]): Promise<void>;
}

export interface IUserModel extends mongoose.Model<IUserDocument> {
  getGraphData(): Promise<{ nodes: any[]; edges: any[] }>;
  canDeleteUser(userId: string): Promise<boolean>;
}

const UserSchema = new Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true,
    required: true,
    index: true
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    trim: true,
    minlength: [2, 'Username must be at least 2 characters long'],
    maxlength: [50, 'Username cannot exceed 50 characters']
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [13, 'Age must be at least 13'],
    max: [120, 'Age cannot exceed 120']
  },
  hobbies: [{
    type: String,
    trim: true,
    minlength: [1, 'Hobby cannot be empty'],
    maxlength: [100, 'Hobby cannot exceed 100 characters']
  }],
  friends: [{
    type: String,
    ref: 'User',
    validate: {
      validator: function(v: string) {
        return v !== this.id;
      },
      message: 'User cannot be friends with themselves'
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  popularityScore: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
UserSchema.index({ username: 1 });
UserSchema.index({ popularityScore: -1 });
UserSchema.index({ createdAt: -1 });

// Virtual for friend count
UserSchema.virtual('friendCount').get(function() {
  return this.friends.length;
});

// Method to calculate popularity score
UserSchema.methods.calculatePopularityScore = async function(): Promise<number> {
  const friendsCount = this.friends.length;
  
  if (friendsCount === 0) {
    return 0;
  }

  // Get all friends' hobbies
  const friends = await (this.constructor as any).find({ 
    id: { $in: this.friends } 
  }).select('hobbies');

  // Calculate shared hobbies score
  let sharedHobbiesScore = 0;
  const userHobbies = new Set(this.hobbies);

  friends.forEach((friend: any) => {
    const friendHobbies = new Set(friend.hobbies);
    const sharedHobbies = [...userHobbies].filter(hobby => friendHobbies.has(hobby));
    sharedHobbiesScore += sharedHobbies.length * 0.5;
  });

  const totalScore = friendsCount + sharedHobbiesScore;
  
  // Update the popularity score
  this.popularityScore = Math.round(totalScore * 100) / 100;
  await this.save();
  
  return this.popularityScore;
};

// Method to add a friend
UserSchema.methods.addFriend = async function(friendId: string): Promise<void> {
  if (this.friends.includes(friendId)) {
    throw new Error('Users are already friends');
  }
  
  if (friendId === this.id) {
    throw new Error('User cannot be friends with themselves');
  }

  // Check if the friend exists
  const friend = await (this.constructor as any).findOne({ id: friendId });
  if (!friend) {
    throw new Error('Friend not found');
  }

  // Add bidirectional friendship
  this.friends.push(friendId);
  friend.friends.push(this.id);

  await Promise.all([
    this.save(),
    friend.save()
  ]);

  // Recalculate popularity scores for both users
  await Promise.all([
    this.calculatePopularityScore(),
    friend.calculatePopularityScore()
  ]);
};

// Method to remove a friend
UserSchema.methods.removeFriend = async function(friendId: string): Promise<void> {
  if (!this.friends.includes(friendId)) {
    throw new Error('Users are not friends');
  }

  // Find the friend
  const friend = await (this.constructor as any).findOne({ id: friendId });
  if (!friend) {
    throw new Error('Friend not found');
  }

  // Remove bidirectional friendship
  this.friends = this.friends.filter((id: string) => id !== friendId);
  friend.friends = friend.friends.filter((id: string) => id !== this.id);

  await Promise.all([
    this.save(),
    friend.save()
  ]);

  // Recalculate popularity scores for both users
  await Promise.all([
    this.calculatePopularityScore(),
    friend.calculatePopularityScore()
  ]);
};

// Method to update hobbies
UserSchema.methods.updateHobbies = async function(newHobbies: string[]): Promise<void> {
  this.hobbies = newHobbies;
  await this.save();
  
  // Recalculate popularity score after hobby update
  await this.calculatePopularityScore();
};

// Pre-save middleware to ensure unique hobbies
UserSchema.pre('save', function(next) {
  if (this.hobbies) {
    this.hobbies = [...new Set(this.hobbies.filter(hobby => hobby.trim() !== ''))];
  }
  next();
});

// Static method to get graph data
UserSchema.statics.getGraphData = async function() {
  const users = await this.find({}).select('id username age hobbies friends popularityScore');
  
  const nodes = users.map((user: IUserDocument, index: number) => {
    // Create a more organized layout
    const angle = (index * 2 * Math.PI) / users.length;
    const radius = 200;
    const centerX = 400;
    const centerY = 300;
    
    return {
      id: user.id,
      data: {
        label: `${user.username} (${user.age})`,
        username: user.username,
        age: user.age,
        hobbies: user.hobbies,
        popularityScore: user.popularityScore
      },
      position: {
        x: centerX + radius * Math.cos(angle) + (Math.random() - 0.5) * 100,
        y: centerY + radius * Math.sin(angle) + (Math.random() - 0.5) * 100
      },
      type: user.popularityScore > 5 ? 'HighScoreNode' : 'LowScoreNode'
    };
  });

  const edges: any[] = [];
  const processedPairs = new Set<string>();

  users.forEach((user: IUserDocument) => {
    user.friends.forEach(friendId => {
      const pairKey = [user.id, friendId].sort().join('-');
      if (!processedPairs.has(pairKey)) {
        edges.push({
          id: `edge-${user.id}-${friendId}`,
          source: user.id,
          target: friendId,
          type: 'smoothstep'
        });
        processedPairs.add(pairKey);
      }
    });
  });

  return { nodes, edges };
};

// Static method to check if user can be deleted
UserSchema.statics.canDeleteUser = async function(userId: string): Promise<boolean> {
  const user = await this.findOne({ id: userId });
  if (!user) {
    return false;
  }
  
  // Check if user has any friends
  return user.friends.length === 0;
};

export const User = mongoose.model('User', UserSchema) as any;