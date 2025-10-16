export interface IUser {
  _id?: string;
  id: string;
  username: string;
  age: number;
  hobbies: string[];
  friends: string[];
  createdAt: Date;
  popularityScore: number;
}

export interface IUserInput {
  username: string;
  age: number;
  hobbies: string[];
}

export interface IUserUpdate {
  username?: string;
  age?: number;
  hobbies?: string[];
}

export interface IRelationship {
  userId: string;
  friendId: string;
}

export interface IGraphData {
  nodes: IGraphNode[];
  edges: IGraphEdge[];
}

export interface IGraphNode {
  id: string;
  data: {
    label: string;
    username: string;
    age: number;
    hobbies: string[];
    popularityScore: number;
  };
  position: {
    x: number;
    y: number;
  };
  type?: 'HighScoreNode' | 'LowScoreNode';
}

export interface IGraphEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
}

export interface IApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface IValidationError {
  field: string;
  message: string;
}

export interface IPopularityCalculation {
  friendsCount: number;
  sharedHobbiesScore: number;
  totalScore: number;
}