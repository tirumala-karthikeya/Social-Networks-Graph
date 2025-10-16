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
  EdgeTypes,
  BaseEdge,
  EdgeProps,
  getSmoothStepPath,
} from 'reactflow';
import { Box, Paper, Typography, IconButton, Tooltip } from '@mui/material';
import { ZoomIn, ZoomOut, FitScreen, Refresh } from '@mui/icons-material';
import { motion } from 'framer-motion';
import UserNode from './UserNode';
import { GraphData, User } from '../types';
import { useApp } from '../contexts/AppContext';

// Custom edge component for better selection and double-click handling
const CustomEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  selected,
  data,
}) => {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const [isHovered, setIsHovered] = React.useState(false);

  // Handle double-click on edge
  const handleDoubleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    console.log('Edge double-clicked:', id);
    
    // Trigger edge deletion
    if (data?.onEdgeDelete && data.source && data.target) {
      data.onEdgeDelete(data.source, data.target);
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const isInteractive = isHovered || selected;
  const strokeColor = selected ? '#ff6b6b' : (isHovered ? '#ff9800' : '#1976d2');
  const strokeWidth = selected ? 6 : (isHovered ? 5 : 4);

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          ...style,
          strokeWidth: strokeWidth,
          stroke: strokeColor,
          strokeDasharray: selected ? '5,5' : 'none',
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out',
        }}
      />
      {/* Invisible clickable area for edge interaction */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        style={{ cursor: 'pointer' }}
        onClick={handleDoubleClick}
        onDoubleClick={handleDoubleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
    </>
  );
};

// Custom node types
const nodeTypes: NodeTypes = {
  HighScoreNode: UserNode,
  LowScoreNode: UserNode,
};

// Custom edge types
const edgeTypes: EdgeTypes = {
  custom: CustomEdge,
};

interface GraphVisualizationProps {
  graphData: GraphData;
  onNodeClick?: (node: Node) => void;
  onNodeDrop?: (nodeId: string, hobby: string) => void;
  onNodeConnect?: (sourceId: string, targetId: string) => void;
  onEdgeDelete?: (sourceId: string, targetId: string) => void;
}

const GraphVisualization: React.FC<GraphVisualizationProps> = ({
  graphData,
  onNodeClick,
  onNodeDrop,
  onNodeConnect,
  onEdgeDelete,
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
    
    // Update edges with onEdgeDelete callback
    const edgesWithCallbacks = graphData.edges.map(edge => ({
      ...edge,
      type: 'custom',
      data: {
        source: edge.source,
        target: edge.target,
        onEdgeDelete: onEdgeDelete,
      },
    }));
    setEdges(edgesWithCallbacks);
    
    // Only fit view on initial load, not on every data change
    // This prevents ResizeObserver loops during edge operations
    if (reactFlowInstance && nodes.length === 0) {
      const timeoutId = setTimeout(() => {
        if (reactFlowInstance) {
          reactFlowInstance.fitView({ padding: 0.1 });
        }
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [graphData, setNodes, setEdges, reactFlowInstance, onEdgeDelete, nodes.length]);

  // Enhanced ResizeObserver error handling for this component
  React.useEffect(() => {
    const handleResizeObserverError = (e: ErrorEvent) => {
      if (e.message && e.message.includes('ResizeObserver loop completed with undelivered notifications')) {
        e.stopImmediatePropagation();
        e.preventDefault();
        return false;
      }
    };

    window.addEventListener('error', handleResizeObserverError, true);
    
    return () => {
      window.removeEventListener('error', handleResizeObserverError, true);
    };
  }, []);

  // Handle keyboard events for edge deletion
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        // Get selected edges
        const selectedEdges = edges.filter(edge => edge.selected);
        if (selectedEdges.length > 0) {
          console.log('Deleting selected edges via keyboard:', selectedEdges);
          selectedEdges.forEach(edge => {
            if (edge.source && edge.target) {
              onEdgeDelete?.(edge.source, edge.target);
            }
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [edges, onEdgeDelete]);

  // Handle node connection
  const onConnect = useCallback(
    (connection: Connection) => {
      console.log('Connection created:', connection);
      if (connection.source && connection.target && connection.source !== connection.target) {
        const newEdge = {
          ...connection,
          animated: true,
          type: 'custom',
          data: {
            source: connection.source,
            target: connection.target,
            onEdgeDelete: onEdgeDelete,
          },
        };
        setEdges((eds) => addEdge(newEdge, eds));
        console.log('Creating friendship between:', connection.source, 'and', connection.target);
        onNodeConnect?.(connection.source, connection.target);
        
        // Prevent automatic fitView after edge creation to avoid ResizeObserver issues
        // The user can manually fit view if needed using the controls
      }
    },
    [onNodeConnect, setEdges, onEdgeDelete]
  );

  // Handle node click
  const handleNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      console.log('Node clicked:', node.id);
      onNodeClick?.(node);
    },
    [onNodeClick]
  );

  // Handle edge deletion
  const handleEdgeDelete = useCallback(
    (deletedEdges: Edge[]) => {
      console.log('Edge deletion triggered, deleted edges:', deletedEdges);
      deletedEdges.forEach(edge => {
        if (edge.source && edge.target) {
          console.log('Deleting edge:', edge.source, '->', edge.target);
          onEdgeDelete?.(edge.source, edge.target);
        }
      });
      
      // Prevent automatic fitView after edge deletion to avoid ResizeObserver issues
      // The user can manually fit view if needed using the controls
    },
    [onEdgeDelete]
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
    const DETECTION_RANGE = 2000; 

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
          onEdgesDelete={handleEdgeDelete}
          onInit={setReactFlowInstance}
          onDrop={onNodeDropOnNode}
          onDragOver={onNodeDragOver}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView={false}
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
              strokeWidth: 4, 
              stroke: '#1976d2',
            },
            type: 'custom',
            animated: false,
            deletable: true,
          }}
          connectionLineStyle={{ 
            strokeWidth: 3, 
            stroke: '#1976d2',
          }}
          style={{
            backgroundColor: '#f5f5f5',
          }}
          proOptions={{
            hideAttribution: true,
          }}
          minZoom={0.1}
          maxZoom={2}
          onlyRenderVisibleElements={true}
          nodesFocusable={false}
          edgesFocusable={true}
          panOnScroll={true}
          zoomOnScroll={true}
          zoomOnPinch={true}
          preventScrolling={false}
          elevateNodesOnSelect={false}
          elevateEdgesOnSelect={false}
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
          {/* <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            💡 Double-click on a connection line OR click it (turns red) and press Delete to unlink friends
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            🔗 Drag from node handles to create new connections
          </Typography> */}
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