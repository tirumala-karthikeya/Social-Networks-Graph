import React, { useCallback, useRef, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  ReactFlowProvider,
  ReactFlowInstance,
  NodeTypes,
} from 'reactflow';
import { Box, Paper, Typography, IconButton, Tooltip } from '@mui/material';
import { ZoomIn, ZoomOut, FitScreen, Refresh } from '@mui/icons-material';
import { motion } from 'framer-motion';
import UserNode from './UserNode';
import { GraphData, User } from '../types';
import { useApp } from '../contexts/AppContext';

// Custom node types
const nodeTypes: NodeTypes = {
  HighScoreNode: UserNode,
  LowScoreNode: UserNode,
};

interface GraphVisualizationProps {
  graphData: GraphData;
  onNodeClick?: (node: Node) => void;
  onNodeDrop?: (nodeId: string, hobby: string) => void;
  onNodeConnect?: (sourceId: string, targetId: string) => void;
}

const GraphVisualization: React.FC<GraphVisualizationProps> = ({
  graphData,
  onNodeClick,
  onNodeDrop,
  onNodeConnect,
}) => {
  const { state, refreshData } = useApp();
  const [nodes, setNodes, onNodesChange] = useNodesState(graphData.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(graphData.edges);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [draggedHobby, setDraggedHobby] = useState<string | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Update nodes and edges when graphData changes
  React.useEffect(() => {
    // Make sure nodes are draggable and properly configured
    const draggableNodes = graphData.nodes.map(node => ({
      ...node,
      draggable: true,
      selectable: true,
      connectable: true,
    }));
    console.log('Setting nodes:', draggableNodes.length, 'nodes with dragging enabled');
    setNodes(draggableNodes);
    setEdges(graphData.edges);
  }, [graphData, setNodes, setEdges]);

  // Handle node connection
  const onConnect = useCallback(
    (connection: Connection) => {
      console.log('Connection created:', connection);
      if (connection.source && connection.target && connection.source !== connection.target) {
        setEdges((eds) => addEdge({ ...connection, animated: true }, eds));
        console.log('Creating friendship between:', connection.source, 'and', connection.target);
        onNodeConnect?.(connection.source, connection.target);
      }
    },
    [onNodeConnect, setEdges]
  );

  // Handle node click
  const handleNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      console.log('Node clicked:', node.id);
      onNodeClick?.(node);
    },
    [onNodeClick]
  );

  // Handle drag over (for hobby assignment)
  const onNodeDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle drop (for hobby assignment) - Find closest node
  const onNodeDropOnNode = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const hobby = event.dataTransfer.getData('hobby');
    
    if (!hobby || !reactFlowInstance) {
      console.log('No hobby data or reactFlowInstance');
      return;
    }

    console.log('Dropped hobby:', hobby);
    
    // Get drop position
    const position = reactFlowInstance.screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    // Find closest node - INCREASED RANGE
    let closestNode: Node | null = null;
    let minDistance = Infinity;
    const DETECTION_RANGE = 1000; 

    console.log('Drop position:', position);
    console.log('Available nodes:', nodes.length);

    nodes.forEach(node => {
      const nodeCenterX = node.position.x + (node.width || 100) / 2;
      const nodeCenterY = node.position.y + (node.height || 100) / 2;
      const distance = Math.sqrt(
        Math.pow(nodeCenterX - position.x, 2) + 
        Math.pow(nodeCenterY - position.y, 2)
      );
      
      console.log(`Distance to node ${node.id}:`, distance, 'at position:', node.position);
      
      if (distance < DETECTION_RANGE && distance < minDistance) {
        minDistance = distance;
        closestNode = node;
      }
    });

    if (closestNode) {
      console.log(`Dropping hobby "${hobby}" on node: ${(closestNode as Node).id}`);
      onNodeDrop?.((closestNode as Node).id, hobby);
    } else {
      console.log(`No node found within ${DETECTION_RANGE}px drop range. Closest was ${minDistance}px away.`);
    }
    
    setDraggedHobby(null);
  }, [onNodeDrop, reactFlowInstance, nodes]);


  // Zoom controls
  const handleZoomIn = () => {
    reactFlowInstance?.zoomIn();
  };

  const handleZoomOut = () => {
    reactFlowInstance?.zoomOut();
  };

  const handleFitView = () => {
    reactFlowInstance?.fitView();
  };

  const handleRefresh = () => {
    refreshData();
  };

  return (
    <Box
      ref={reactFlowWrapper}
      sx={{
        width: '100%',
        height: '100%',
        position: 'relative',
        backgroundColor: '#f5f5f5',
      }}
    >
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={handleNodeClick}
          onInit={setReactFlowInstance}
          onDrop={onNodeDropOnNode}
          onDragOver={onNodeDragOver}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
          nodesDraggable={true}
          nodesConnectable={true}
          elementsSelectable={true}
          connectOnClick={true}
          panOnDrag={true}
          selectNodesOnDrag={false}
          multiSelectionKeyCode="ctrl"
          deleteKeyCode="delete"
          defaultEdgeOptions={{
            style: { 
              strokeWidth: 3, 
              stroke: '#1976d2',
            },
            type: 'smoothstep',
            animated: true,
          }}
          connectionLineStyle={{ 
            strokeWidth: 3, 
            stroke: '#1976d2',
          }}
          style={{
            backgroundColor: '#f5f5f5',
          }}
        >
          <Background color="#aaa" gap={16} />
          <Controls />
        </ReactFlow>

        {/* Custom Controls */}
        <Paper
          elevation={3}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            padding: 1,
            backgroundColor: 'white',
            borderRadius: 1,
          }}
        >
          <Tooltip title="Zoom In (Scroll Up)">
            <IconButton onClick={handleZoomIn} size="small">
              <ZoomIn />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Zoom Out (Scroll Down)">
            <IconButton onClick={handleZoomOut} size="small">
              <ZoomOut />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Fit View (Auto-zoom to fit all nodes)">
            <IconButton onClick={handleFitView} size="small">
              <FitScreen />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Refresh Data">
            <IconButton onClick={handleRefresh} size="small">
              <Refresh />
            </IconButton>
          </Tooltip>
        </Paper>

        {/* Graph Statistics */}
        <Paper
          elevation={3}
          sx={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            padding: 2,
            backgroundColor: 'white',
            minWidth: 200,
            borderRadius: 1,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Graph Statistics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Nodes: {nodes.length}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Edges: {edges.length}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            High Score: {nodes.filter(n => n.type === 'HighScoreNode').length}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Low Score: {nodes.filter(n => n.type === 'LowScoreNode').length}
          </Typography>
        </Paper>

        {/* Drag Overlay */}
        {draggedHobby && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(33, 150, 243, 0.1)',
              border: '2px dashed #2196f3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              pointerEvents: 'none',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: '#2196f3',
                fontWeight: 'bold',
                textAlign: 'center',
              }}
            >
              Drop "{draggedHobby}" on a user node
            </Typography>
          </motion.div>
        )}
      </ReactFlowProvider>
    </Box>
  );
};

export default GraphVisualization;