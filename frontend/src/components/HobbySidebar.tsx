import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Chip,
  List,
  ListItem,
  ListItemText,
  InputAdornment,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Search,
  Add,
  DragIndicator,
  FilterList,
  Clear,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../contexts/AppContext';

interface HobbySidebarProps {
  onHobbyDrag?: (hobby: string) => void;
  onAddHobby?: (hobby: string) => void;
}

const HobbySidebar: React.FC<HobbySidebarProps> = ({
  onHobbyDrag,
  onAddHobby,
}) => {
  const { state, dispatch } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [newHobby, setNewHobby] = useState('');
  const [draggedHobby, setDraggedHobby] = useState<string | null>(null);

  // Filter hobbies based on search query
  const filteredHobbies = useMemo(() => {
    if (!searchQuery.trim()) return state.hobbies;
    
    return state.hobbies.filter(hobby =>
      hobby.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [state.hobbies, searchQuery]);

  // Get hobby usage statistics
  const hobbyStats = useMemo(() => {
    const stats: { [key: string]: number } = {};
    
    state.users.forEach(user => {
      user.hobbies.forEach(hobby => {
        stats[hobby] = (stats[hobby] || 0) + 1;
      });
    });
    
    return stats;
  }, [state.users]);

  // Handle hobby drag start
  const handleDragStart = (event: React.DragEvent, hobby: string) => {
    console.log('Starting drag for hobby:', hobby);
    event.dataTransfer.setData('hobby', hobby);
    event.dataTransfer.effectAllowed = 'move';
    setDraggedHobby(hobby);
  };

  // Handle hobby drag end
  const handleDragEnd = () => {
    setDraggedHobby(null);
  };

  // Handle add new hobby
  const handleAddHobby = () => {
    if (newHobby.trim() && !state.hobbies.includes(newHobby.trim())) {
      onAddHobby?.(newHobby.trim());
      setNewHobby('');
    }
  };

  // Handle key press for adding hobby
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleAddHobby();
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <Paper
      elevation={3}
      sx={{
        width: 300,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'white',
      }}
    >
      {/* Header */}
      <Box sx={{ padding: 2, borderBottom: '1px solid #e0e0e0' }}>
        <Typography variant="h6" gutterBottom>
          Hobbies
        </Typography>
        
        {/* Search */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search hobbies..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={clearSearch}>
                  <Clear fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* Add New Hobby */}
        <Box sx={{ display: 'flex', gap: 1, marginTop: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Add new hobby..."
            value={newHobby}
            onChange={(e) => setNewHobby(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <Tooltip title="Add Hobby">
            <IconButton
              size="small"
              onClick={handleAddHobby}
              disabled={!newHobby.trim() || state.hobbies.includes(newHobby.trim())}
            >
              <Add />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Hobbies List */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <Box sx={{ padding: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterList fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary">
            {filteredHobbies.length} hobbies
          </Typography>
        </Box>

        <Box sx={{ height: 'calc(100% - 40px)', overflow: 'auto', padding: 1 }}>
          <AnimatePresence>
            {filteredHobbies.map((hobby, index) => (
              <motion.div
                key={hobby}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Paper
                  elevation={draggedHobby === hobby ? 4 : 1}
                  sx={{
                    marginBottom: 1,
                    padding: 1,
                    cursor: 'grab',
                    backgroundColor: draggedHobby === hobby ? '#e3f2fd' : 'white',
                    border: draggedHobby === hobby ? '2px solid #2196f3' : '1px solid #e0e0e0',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                      transform: 'translateY(-1px)',
                    },
                  }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, hobby)}
                  onDragEnd={handleDragEnd}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DragIndicator fontSize="small" color="action" />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight="medium">
                        {hobby}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Used by {hobbyStats[hobby] || 0} users
                      </Typography>
                    </Box>
                    <Chip
                      label={hobbyStats[hobby] || 0}
                      size="small"
                      color={hobbyStats[hobby] > 2 ? 'primary' : 'default'}
                      sx={{ minWidth: 24, height: 20 }}
                    />
                  </Box>
                </Paper>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredHobbies.length === 0 && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: 200,
                color: 'text.secondary',
              }}
            >
              <Typography variant="body2" textAlign="center">
                {searchQuery ? 'No hobbies found matching your search' : 'No hobbies available'}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Footer */}
      <Box sx={{ padding: 2, borderTop: '1px solid #e0e0e0' }}>
        <Typography variant="caption" color="text.secondary" display="block">
          💡 Drag hobbies onto user nodes to assign them
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          📊 Numbers show how many users have each hobby
        </Typography>
      </Box>
    </Paper>
  );
};

export default HobbySidebar;