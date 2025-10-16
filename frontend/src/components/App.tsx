import React, { useState, useCallback } from 'react';
import { Box, AppBar, Toolbar, Typography, IconButton, Tooltip } from '@mui/material';
import { Undo, Redo, Refresh, Info, Save } from '@mui/icons-material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import GraphVisualization from './GraphVisualization';
import HobbySidebar from './HobbySidebar';
import UserManagementPanel from './UserManagementPanel';
import LoadingSpinner from './LoadingSpinner';
import { useApp } from '../contexts/AppContext';
import { User } from '../types';

const App: React.FC = () => {
  const { state, undo, redo, saveState, refreshData, updateUser, addFriendship, addHobby } = useApp();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Handle node click
  const handleNodeClick = useCallback((node: any) => {
    const user = state.users.find(u => u.id === node.id);
    setSelectedUser(user || null);
  }, [state.users]);

  // Handle hobby drop on node
  const handleHobbyDrop = useCallback(async (nodeId: string, hobby: string) => {
    console.log('handleHobbyDrop called with:', nodeId, hobby);
    const user = state.users.find(u => u.id === nodeId);
    console.log('Found user:', user);
    if (user && !user.hobbies.includes(hobby)) {
      try {
        console.log('Adding hobby to user...');
        await updateUser(nodeId, {
          hobbies: [...user.hobbies, hobby]
        });
        console.log('Hobby added, refreshing data...');
        // Refresh data to update the graph and hobby statistics
        await refreshData();
        console.log('Data refreshed');
      } catch (error) {
        console.error('Failed to add hobby:', error);
      }
    } else {
      console.log('User not found or hobby already exists');
    }
  }, [state.users, updateUser, refreshData]);

  // Handle node connection (friendship)
  const handleNodeConnect = useCallback(async (sourceId: string, targetId: string) => {
    console.log('handleNodeConnect called with:', sourceId, targetId);
    try {
      console.log('Creating friendship...');
      await addFriendship(sourceId, targetId);
      console.log('Friendship created successfully');
      // Refresh data to update the graph with new edges
      await refreshData();
      console.log('Data refreshed after friendship creation');
    } catch (error) {
      console.error('Failed to create friendship:', error);
    }
  }, [addFriendship, refreshData]);

  // Handle add new hobby
  const handleAddHobby = useCallback((hobby: string) => {
    addHobby(hobby);
  }, [addHobby]);

  // Handle undo/redo
  const handleUndo = useCallback(() => {
    undo();
  }, [undo]);

  const handleRedo = useCallback(() => {
    redo();
  }, [redo]);

  // Handle save state
  const handleSaveState = useCallback(() => {
    saveState();
  }, [saveState]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    refreshData();
  }, [refreshData]);

  if (state.loading && state.users.length === 0) {
    return <LoadingSpinner message="Loading Cybernauts..." fullScreen />;
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* App Bar */}
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            🚀 Cybernauts - Social Network Graph
          </Typography>
          
          <Tooltip title="Undo">
            <IconButton color="inherit" onClick={handleUndo}>
              <Undo />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Redo">
            <IconButton color="inherit" onClick={handleRedo}>
              <Redo />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Save State">
            <IconButton color="inherit" onClick={handleSaveState}>
              <Save />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Refresh Data">
            <IconButton color="inherit" onClick={handleRefresh}>
              <Refresh />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="About">
            <IconButton color="inherit">
              <Info />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left Sidebar - Hobbies */}
        <HobbySidebar
          onHobbyDrag={handleAddHobby}
          onAddHobby={handleAddHobby}
        />

        {/* Center - Graph Visualization */}
        <Box sx={{ flex: 1, position: 'relative' }}>
          <GraphVisualization
            graphData={state.graphData}
            onNodeClick={handleNodeClick}
            onNodeDrop={handleHobbyDrop}
            onNodeConnect={handleNodeConnect}
          />
        </Box>

        {/* Right Sidebar - User Management */}
        <UserManagementPanel
          selectedUser={selectedUser}
          onUserSelect={setSelectedUser}
        />
      </Box>

      {/* Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      {/* Error Display */}
      {state.error && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 16,
            left: 16,
            right: 16,
            backgroundColor: 'error.main',
            color: 'white',
            padding: 2,
            borderRadius: 1,
            zIndex: 9999,
          }}
        >
          <Typography variant="body2">
            Error: {state.error}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default App;