import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Box, Typography, Chip, Avatar } from '@mui/material';
import { Person } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { User } from '../types';

interface UserNodeData {
  label: string;
  username: string;
  age: number;
  hobbies: string[];
  popularityScore: number;
}

interface UserNodeProps extends NodeProps {
  data: UserNodeData;
  isConnecting?: boolean;
}

const UserNode: React.FC<UserNodeProps> = memo(({ data, selected, isConnecting }) => {
  const isHighScore = data.popularityScore > 5;
  
  const nodeVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.05 },
    selected: { scale: 1.1 },
  };

  const getNodeColor = () => {
    if (isConnecting) {
      return '#ff9800'; // Orange when connecting
    }
    if (selected) {
      return isHighScore ? '#4caf50' : '#2196f3';
    }
    return isHighScore ? '#66bb6a' : '#42a5f5';
  };

  const getNodeSize = () => {
    const baseSize = 200;
    const scoreMultiplier = Math.min(data.popularityScore / 10, 2);
    return baseSize + (scoreMultiplier * 50);
  };

  return (
    <motion.div
      variants={nodeVariants}
      initial="initial"
      whileHover="hover"
      animate={selected ? "selected" : "initial"}
      transition={{ duration: 0.2 }}
      style={{ width: '100%', height: '100%' }}
    >
      <Box
        sx={{
          width: getNodeSize(),
          minHeight: 120,
          backgroundColor: getNodeColor(),
          borderRadius: 2,
          padding: 2,
          boxShadow: selected ? '0 0 20px rgba(255, 152, 0, 0.8)' : '0 4px 8px rgba(0,0,0,0.2)',
          border: selected ? '4px solid #ff9800' : '2px solid rgba(255,255,255,0.3)',
          color: 'white',
          position: 'relative',
          cursor: selected ? 'grabbing' : 'grab',
          transition: 'all 0.3s ease',
          touchAction: 'none',
          '&:hover': {
            boxShadow: '0 6px 12px rgba(0,0,0,0.3)',
          },
        }}
      >
        {/* Popularity Score Badge */}
        <Box
          sx={{
            position: 'absolute',
            top: -12,
            right: -12,
            backgroundColor: isHighScore ? '#ff9800' : '#9e9e9e',
            color: 'white',
            borderRadius: '50%',
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.85rem',
            fontWeight: 'bold',
            boxShadow: '0 4px 8px rgba(0,0,0,0.4)',
            border: '3px solid white',
          }}
        >
          {data.popularityScore.toFixed(1)}
        </Box>

        {/* User Avatar */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: 1,
          }}
        >
          <Avatar
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              marginRight: 1,
            }}
          >
            <Person />
          </Avatar>
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 'bold',
                fontSize: '1rem',
                lineHeight: 1.2,
              }}
            >
              {data.username}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                opacity: 0.9,
                fontSize: '0.75rem',
              }}
            >
              Age: {data.age}
            </Typography>
          </Box>
        </Box>

        {/* Hobbies */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 0.5,
            marginTop: 1,
          }}
        >
          {data.hobbies.slice(0, 3).map((hobby, index) => (
            <Chip
              key={index}
              label={hobby}
              size="small"
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontSize: '0.65rem',
                height: 20,
                '& .MuiChip-label': {
                  padding: '0 6px',
                },
              }}
            />
          ))}
          {data.hobbies.length > 3 && (
            <Chip
              label={`+${data.hobbies.length - 3}`}
              size="small"
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                color: 'white',
                fontSize: '0.65rem',
                height: 20,
                '& .MuiChip-label': {
                  padding: '0 6px',
                },
              }}
            />
          )}
        </Box>

        {/* Node Type Indicator */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 4,
            left: 4,
            fontSize: '0.6rem',
            opacity: 0.8,
            fontWeight: 'bold',
          }}
        >
          {isHighScore ? 'HIGH SCORE' : 'LOW SCORE'}
        </Box>

        {/* Connection Handles - More visible and accessible */}
        <Handle
          type="target"
          position={Position.Top}
          style={{
            background: '#fff',
            width: 20,
            height: 20,
            border: '4px solid #1976d2',
            boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
            zIndex: 10,
          }}
          isConnectable={true}
        />
        <Handle
          type="source"
          position={Position.Bottom}
          style={{
            background: '#fff',
            width: 20,
            height: 20,
            border: '4px solid #1976d2',
            boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
            zIndex: 10,
          }}
          isConnectable={true}
        />
        <Handle
          type="target"
          position={Position.Left}
          style={{
            background: '#fff',
            width: 20,
            height: 20,
            border: '4px solid #1976d2',
            boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
            zIndex: 10,
          }}
          isConnectable={true}
        />
        <Handle
          type="source"
          position={Position.Right}
          style={{
            background: '#fff',
            width: 20,
            height: 20,
            border: '4px solid #1976d2',
            boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
            zIndex: 10,
          }}
          isConnectable={true}
        />
      </Box>
    </motion.div>
  );
});

UserNode.displayName = 'UserNode';

export default UserNode;