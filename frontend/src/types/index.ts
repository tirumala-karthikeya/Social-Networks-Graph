export interface User {
  id: string;
  username: string;
  age: number;
  hobbies: string[];
  friends: string[];
  createdAt: string;
  popularityScore: number;
}

export interface UserInput {
  username: string;
  age: number;
  hobbies: string[];
}

export interface UserUpdate {
  username?: string;
  age?: number;
  hobbies?: string[];
}

export interface Relationship {
  userId: string;
  friendId: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface GraphNode {
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

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface UserStats {
  totalUsers: number;
  totalFriendships: number;
  averagePopularityScore: number;
  topUsers: User[];
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export interface DragItem {
  type: 'hobby' | 'user';
  data: string | User;
}

export interface GraphState {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedNode: string | null;
  draggedNode: string | null;
  draggedHobby: string | null;
}

export interface AppState {
  users: User[];
  hobbies: string[];
  graphData: GraphData;
  loading: boolean;
  error: string | null;
  selectedUser: User | null;
  searchQuery: string;
  filterHobbies: string[];
}

export interface UndoRedoState {
  past: AppState[];
  present: AppState;
  future: AppState[];
}