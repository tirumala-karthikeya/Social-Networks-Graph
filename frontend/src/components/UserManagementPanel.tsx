import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Person,
  Close,
  Save,
  Cancel,
  Warning,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { User, UserInput, UserUpdate } from '../types';
import { useApp } from '../contexts/AppContext';

interface UserManagementPanelProps {
  selectedUser: User | null;
  onUserSelect: (user: User | null) => void;
}

interface UserFormData {
  username: string;
  age: number;
  hobbies: string[];
}

const UserManagementPanel: React.FC<UserManagementPanelProps> = ({
  selectedUser,
  onUserSelect,
}) => {
  const { state, createUser, updateUser, deleteUser } = useApp();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newHobby, setNewHobby] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UserFormData>({
    defaultValues: {
      username: '',
      age: 18,
      hobbies: [],
    },
  });

  const watchedHobbies = watch('hobbies');

  // Handle create user
  const handleCreateUser = async (data: UserFormData) => {
    setLoading(true);
    try {
      await createUser(data);
      setIsCreateDialogOpen(false);
      reset();
    } catch (error) {
      console.error('Failed to create user:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle update user
  const handleUpdateUser = async (data: UserFormData) => {
    if (!selectedUser) return;
    
    setLoading(true);
    try {
      await updateUser(selectedUser.id, data);
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Failed to update user:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete user
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    setLoading(true);
    try {
      await deleteUser(selectedUser.id);
      setIsDeleteDialogOpen(false);
      onUserSelect(null);
    } catch (error) {
      console.error('Failed to delete user:', error);
    } finally {
      setLoading(false);
    }
  };

  // Open edit dialog
  const openEditDialog = () => {
    if (selectedUser) {
      setValue('username', selectedUser.username);
      setValue('age', selectedUser.age);
      setValue('hobbies', selectedUser.hobbies);
      setIsEditDialogOpen(true);
    }
  };

  // Add hobby to form
  const addHobbyToForm = () => {
    if (newHobby.trim() && !watchedHobbies.includes(newHobby.trim())) {
      setValue('hobbies', [...watchedHobbies, newHobby.trim()]);
      setNewHobby('');
    }
  };

  // Remove hobby from form
  const removeHobbyFromForm = (hobbyToRemove: string) => {
    setValue('hobbies', watchedHobbies.filter(hobby => hobby !== hobbyToRemove));
  };

  // Add existing hobby
  const addExistingHobby = (hobby: string) => {
    if (!watchedHobbies.includes(hobby)) {
      setValue('hobbies', [...watchedHobbies, hobby]);
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        width: 350,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'white',
      }}
    >
      {/* Header */}
      <Box sx={{ padding: 2, borderBottom: '1px solid #e0e0e0' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">User Management</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setIsCreateDialogOpen(true)}
            size="small"
          >
            Add User
          </Button>
        </Box>
      </Box>

      {/* User List */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <Box sx={{ height: '100%', overflow: 'auto', padding: 1 }}>
          <AnimatePresence>
            {state.users.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Paper
                  elevation={selectedUser?.id === user.id ? 3 : 1}
                  sx={{
                    marginBottom: 1,
                    padding: 1,
                    cursor: 'pointer',
                    backgroundColor: selectedUser?.id === user.id ? '#e3f2fd' : 'white',
                    border: selectedUser?.id === user.id ? '2px solid #2196f3' : '1px solid #e0e0e0',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                    },
                  }}
                  onClick={() => onUserSelect(user)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 32, height: 32 }}>
                      <Person fontSize="small" />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight="medium">
                        {user.username}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Age: {user.age} • Score: {user.popularityScore.toFixed(1)}
                      </Typography>
                    </Box>
                    <Chip
                      label={user.friends.length}
                      size="small"
                      color="primary"
                      sx={{ minWidth: 24, height: 20 }}
                    />
                  </Box>
                </Paper>
              </motion.div>
            ))}
          </AnimatePresence>
        </Box>
      </Box>

      {/* Selected User Actions */}
      {selectedUser && (
        <Box sx={{ padding: 2, borderTop: '1px solid #e0e0e0' }}>
          <Typography variant="subtitle2" gutterBottom>
            Selected: {selectedUser.username}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={openEditDialog}
              size="small"
              fullWidth
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Delete />}
              onClick={() => setIsDeleteDialogOpen(true)}
              size="small"
              fullWidth
            >
              Delete
            </Button>
          </Box>
        </Box>
      )}

      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit(handleCreateUser)}>
          <DialogTitle>Create New User</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, paddingTop: 1 }}>
              <Controller
                name="username"
                control={control}
                rules={{ required: 'Username is required', minLength: { value: 2, message: 'Username must be at least 2 characters' } }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Username"
                    error={!!errors.username}
                    helperText={errors.username?.message}
                    fullWidth
                  />
                )}
              />

              <Controller
                name="age"
                control={control}
                rules={{ required: 'Age is required', min: { value: 13, message: 'Age must be at least 13' } }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Age"
                    type="number"
                    error={!!errors.age}
                    helperText={errors.age?.message}
                    fullWidth
                  />
                )}
              />

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Hobbies
                </Typography>
                
                {/* Add new hobby */}
                <Box sx={{ display: 'flex', gap: 1, marginBottom: 1 }}>
                  <TextField
                    size="small"
                    placeholder="Add hobby..."
                    value={newHobby}
                    onChange={(e) => setNewHobby(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHobbyToForm())}
                    fullWidth
                  />
                  <Button size="small" onClick={addHobbyToForm} disabled={!newHobby.trim()}>
                    Add
                  </Button>
                </Box>

                {/* Existing hobbies */}
                <Box sx={{ marginBottom: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Or select from existing:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, marginTop: 0.5 }}>
                    {state.hobbies.slice(0, 10).map((hobby) => (
                      <Chip
                        key={hobby}
                        label={hobby}
                        size="small"
                        onClick={() => addExistingHobby(hobby)}
                        disabled={watchedHobbies.includes(hobby)}
                      />
                    ))}
                  </Box>
                </Box>

                {/* Selected hobbies */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {watchedHobbies.map((hobby) => (
                    <Chip
                      key={hobby}
                      label={hobby}
                      onDelete={() => removeHobbyFromForm(hobby)}
                      color="primary"
                      size="small"
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={20} /> : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit(handleUpdateUser)}>
          <DialogTitle>Edit User</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, paddingTop: 1 }}>
              <Controller
                name="username"
                control={control}
                rules={{ required: 'Username is required', minLength: { value: 2, message: 'Username must be at least 2 characters' } }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Username"
                    error={!!errors.username}
                    helperText={errors.username?.message}
                    fullWidth
                  />
                )}
              />

              <Controller
                name="age"
                control={control}
                rules={{ required: 'Age is required', min: { value: 13, message: 'Age must be at least 13' } }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Age"
                    type="number"
                    error={!!errors.age}
                    helperText={errors.age?.message}
                    fullWidth
                  />
                )}
              />

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Hobbies
                </Typography>
                
                {/* Add new hobby */}
                <Box sx={{ display: 'flex', gap: 1, marginBottom: 1 }}>
                  <TextField
                    size="small"
                    placeholder="Add hobby..."
                    value={newHobby}
                    onChange={(e) => setNewHobby(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHobbyToForm())}
                    fullWidth
                  />
                  <Button size="small" onClick={addHobbyToForm} disabled={!newHobby.trim()}>
                    Add
                  </Button>
                </Box>

                {/* Selected hobbies */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {watchedHobbies.map((hobby) => (
                    <Chip
                      key={hobby}
                      label={hobby}
                      onDelete={() => removeHobbyFromForm(hobby)}
                      color="primary"
                      size="small"
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={20} /> : 'Update'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ marginBottom: 2 }}>
            <Typography variant="body2">
              Are you sure you want to delete <strong>{selectedUser?.username}</strong>?
            </Typography>
            {selectedUser && selectedUser.friends.length > 0 && (
              <Typography variant="body2" sx={{ marginTop: 1 }}>
                This user has {selectedUser.friends.length} friends. You must remove all friendships before deleting.
              </Typography>
            )}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteUser}
            color="error"
            variant="contained"
            disabled={loading || (selectedUser?.friends.length || 0) > 0}
          >
            {loading ? <CircularProgress size={20} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default UserManagementPanel;