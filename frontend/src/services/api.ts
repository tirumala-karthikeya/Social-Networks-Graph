import axios, { AxiosResponse } from 'axios';
import { User, UserInput, UserUpdate, GraphData, UserStats, ApiResponse } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const userApi = {
  // Get all users
  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get<ApiResponse<User[]>>('/users');
    return response.data.data || [];
  },

  // Get user by ID
  getUserById: async (id: string): Promise<User> => {
    const response = await api.get<ApiResponse<User>>(`/users/${id}`);
    if (!response.data.data) {
      throw new Error('User not found');
    }
    return response.data.data;
  },

  // Create new user
  createUser: async (userData: UserInput): Promise<User> => {
    const response = await api.post<ApiResponse<User>>('/users', userData);
    if (!response.data.data) {
      throw new Error('Failed to create user');
    }
    return response.data.data;
  },

  // Update user
  updateUser: async (id: string, updateData: UserUpdate): Promise<User> => {
    const response = await api.put<ApiResponse<User>>(`/users/${id}`, updateData);
    if (!response.data.data) {
      throw new Error('Failed to update user');
    }
    return response.data.data;
  },

  // Delete user
  deleteUser: async (id: string): Promise<void> => {
    await api.delete<ApiResponse>(`/users/${id}`);
  },

  // Add friendship
  addFriendship: async (userId: string, friendId: string): Promise<void> => {
    await api.post<ApiResponse>(`/users/${userId}/link`, { friendId });
  },

  // Remove friendship
  removeFriendship: async (userId: string, friendId: string): Promise<void> => {
    await api.delete<ApiResponse>(`/users/${userId}/unlink`, { data: { friendId } });
  },

  // Search users
  searchUsers: async (query: string): Promise<User[]> => {
    const response = await api.get<ApiResponse<User[]>>(`/users/search?q=${encodeURIComponent(query)}`);
    return response.data.data || [];
  },

  // Get user statistics
  getUserStats: async (): Promise<UserStats> => {
    const response = await api.get<ApiResponse<UserStats>>('/users/stats');
    if (!response.data.data) {
      throw new Error('Failed to fetch user statistics');
    }
    return response.data.data;
  },
};

export const graphApi = {
  // Get graph data
  getGraphData: async (): Promise<GraphData> => {
    const response = await api.get<ApiResponse<GraphData>>('/graph');
    if (!response.data.data) {
      throw new Error('Failed to fetch graph data');
    }
    return response.data.data;
  },
};

export const hobbyApi = {
  // Get all hobbies
  getAllHobbies: async (): Promise<string[]> => {
    const response = await api.get<ApiResponse<string[]>>('/hobbies');
    return response.data.data || [];
  },

  // Remove hobby from user
  removeHobbyFromUser: async (userId: string, hobby: string): Promise<User> => {
    const response = await api.delete<ApiResponse<User>>(`/users/${userId}/hobbies/${encodeURIComponent(hobby)}`);
    if (!response.data.data) {
      throw new Error('Failed to remove hobby');
    }
    return response.data.data;
  },
};

export const healthApi = {
  // Health check
  checkHealth: async (): Promise<{ success: boolean; message: string }> => {
    const response = await api.get<ApiResponse>('/health');
    return {
      success: response.data.success,
      message: response.data.message || 'API is healthy'
    };
  },
};

export default api;