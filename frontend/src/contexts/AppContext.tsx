import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppState, User, UserInput, UserUpdate, GraphData, UndoRedoState } from '../types';
import { userApi, graphApi, hobbyApi } from '../services/api';
import { toast } from 'react-toastify';

// Action types
type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_USERS'; payload: User[] }
  | { type: 'SET_HOBBIES'; payload: string[] }
  | { type: 'ADD_HOBBY'; payload: string }
  | { type: 'SET_GRAPH_DATA'; payload: GraphData }
  | { type: 'SET_SELECTED_USER'; payload: User | null }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_FILTER_HOBBIES'; payload: string[] }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'DELETE_USER'; payload: string }
  | { type: 'ADD_FRIENDSHIP'; payload: { userId: string; friendId: string } }
  | { type: 'REMOVE_FRIENDSHIP'; payload: { userId: string; friendId: string } }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'SAVE_STATE' };

// Initial state
const initialState: AppState = {
  users: [],
  hobbies: [],
  graphData: { nodes: [], edges: [] },
  loading: false,
  error: null,
  selectedUser: null,
  searchQuery: '',
  filterHobbies: [],
};

// Undo/Redo state
const undoRedoInitialState: UndoRedoState = {
  past: [],
  present: initialState,
  future: [],
};

// Reducer
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_USERS':
      return { ...state, users: action.payload };
    
    case 'SET_HOBBIES':
      return { ...state, hobbies: action.payload };
    
    case 'ADD_HOBBY':
      return {
        ...state,
        hobbies: state.hobbies.includes(action.payload) 
          ? state.hobbies 
          : [...state.hobbies, action.payload]
      };
    
    case 'SET_GRAPH_DATA':
      return { ...state, graphData: action.payload };
    
    case 'SET_SELECTED_USER':
      return { ...state, selectedUser: action.payload };
    
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    
    case 'SET_FILTER_HOBBIES':
      return { ...state, filterHobbies: action.payload };
    
    case 'ADD_USER':
      return { ...state, users: [...state.users, action.payload] };
    
    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(user =>
          user.id === action.payload.id ? action.payload : user
        ),
        selectedUser: state.selectedUser?.id === action.payload.id ? action.payload : state.selectedUser,
      };
    
    case 'DELETE_USER':
      return {
        ...state,
        users: state.users.filter(user => user.id !== action.payload),
        selectedUser: state.selectedUser?.id === action.payload ? null : state.selectedUser,
      };
    
    case 'ADD_FRIENDSHIP':
      return {
        ...state,
        users: state.users.map(user => {
          if (user.id === action.payload.userId) {
            return { ...user, friends: [...user.friends, action.payload.friendId] };
          }
          if (user.id === action.payload.friendId) {
            return { ...user, friends: [...user.friends, action.payload.userId] };
          }
          return user;
        }),
      };
    
    case 'REMOVE_FRIENDSHIP':
      return {
        ...state,
        users: state.users.map(user => {
          if (user.id === action.payload.userId) {
            return { ...user, friends: user.friends.filter(id => id !== action.payload.friendId) };
          }
          if (user.id === action.payload.friendId) {
            return { ...user, friends: user.friends.filter(id => id !== action.payload.userId) };
          }
          return user;
        }),
      };
    
    default:
      return state;
  }
};

// Undo/Redo reducer
const undoRedoReducer = (state: UndoRedoState, action: AppAction): UndoRedoState => {
  switch (action.type) {
    case 'SAVE_STATE':
      return {
        past: [...state.past, state.present],
        present: state.present,
        future: [],
      };
    
    case 'UNDO':
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      const newPast = state.past.slice(0, state.past.length - 1);
      return {
        past: newPast,
        present: previous,
        future: [state.present, ...state.future],
      };
    
    case 'REDO':
      if (state.future.length === 0) return state;
      const next = state.future[0];
      const newFuture = state.future.slice(1);
      return {
        past: [...state.past, state.present],
        present: next,
        future: newFuture,
      };
    
    default:
      return {
        ...state,
        present: appReducer(state.present, action),
      };
  }
};

// Context type
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  undoRedoState: UndoRedoState;
  undoRedoDispatch: React.Dispatch<AppAction>;
  
  // Actions
  createUser: (userData: UserInput) => Promise<void>;
  updateUser: (id: string, updateData: UserUpdate) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  addFriendship: (userId: string, friendId: string) => Promise<void>;
  removeFriendship: (userId: string, friendId: string) => Promise<void>;
  addHobby: (hobby: string) => void;
  refreshData: () => Promise<void>;
  saveState: () => void;
  undo: () => void;
  redo: () => void;
}

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [undoRedoState, undoRedoDispatch] = useReducer(undoRedoReducer, undoRedoInitialState);

  // Load initial data
  useEffect(() => {
    refreshData();
  }, []);

  // Actions
  const createUser = async (userData: UserInput): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const newUser = await userApi.createUser(userData);
      dispatch({ type: 'ADD_USER', payload: newUser });
      toast.success('User created successfully!');
      await refreshData(); // Refresh to get updated graph data
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create user';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateUser = async (id: string, updateData: UserUpdate): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const updatedUser = await userApi.updateUser(id, updateData);
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
      toast.success('User updated successfully!');
      await refreshData(); // Refresh to get updated graph data
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update user';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteUser = async (id: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await userApi.deleteUser(id);
      dispatch({ type: 'DELETE_USER', payload: id });
      toast.success('User deleted successfully!');
      await refreshData(); // Refresh to get updated graph data
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete user';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const addFriendship = async (userId: string, friendId: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await userApi.addFriendship(userId, friendId);
      dispatch({ type: 'ADD_FRIENDSHIP', payload: { userId, friendId } });
      toast.success('Friendship created successfully!');
      await refreshData(); // Refresh to get updated graph data
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create friendship';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const removeFriendship = async (userId: string, friendId: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await userApi.removeFriendship(userId, friendId);
      dispatch({ type: 'REMOVE_FRIENDSHIP', payload: { userId, friendId } });
      toast.success('Friendship removed successfully!');
      await refreshData(); // Refresh to get updated graph data
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to remove friendship';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const addHobby = (hobby: string): void => {
    if (hobby.trim() && !state.hobbies.includes(hobby.trim())) {
      dispatch({ type: 'ADD_HOBBY', payload: hobby.trim() });
      toast.success(`Hobby "${hobby.trim()}" added successfully!`);
    } else if (state.hobbies.includes(hobby.trim())) {
      toast.warning(`Hobby "${hobby.trim()}" already exists!`);
    }
  };

  const refreshData = async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const [users, hobbies, graphData] = await Promise.all([
        userApi.getAllUsers(),
        hobbyApi.getAllHobbies(),
        graphApi.getGraphData(),
      ]);

      dispatch({ type: 'SET_USERS', payload: users });
      dispatch({ type: 'SET_HOBBIES', payload: hobbies });
      dispatch({ type: 'SET_GRAPH_DATA', payload: graphData });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to load data';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const saveState = (): void => {
    undoRedoDispatch({ type: 'SAVE_STATE' });
  };

  const undo = (): void => {
    undoRedoDispatch({ type: 'UNDO' });
  };

  const redo = (): void => {
    undoRedoDispatch({ type: 'REDO' });
  };

  const contextValue: AppContextType = {
    state,
    dispatch,
    undoRedoState,
    undoRedoDispatch,
    createUser,
    updateUser,
    deleteUser,
    addFriendship,
    removeFriendship,
    addHobby,
    refreshData,
    saveState,
    undo,
    redo,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};