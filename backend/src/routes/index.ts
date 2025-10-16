import { Router } from 'express';
import userRoutes from './userRoutes';
import docsRoutes from './docs';
import { UserController } from '../controllers/UserController';

const router = Router();

/**
 * @swagger
 * /graph:
 *   get:
 *     summary: Get graph data for visualization
 *     tags: [Graph]
 *     responses:
 *       200:
 *         description: Graph data with nodes and edges
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/GraphData'
 */
router.get('/graph', UserController.getGraphData);

/**
 * @swagger
 * /hobbies:
 *   get:
 *     summary: Get all unique hobbies
 *     tags: [Hobbies]
 *     responses:
 *       200:
 *         description: List of all unique hobbies
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["coding", "gaming", "music", "sports"]
 */
router.get('/hobbies', UserController.getAllHobbies);

// API routes
router.use('/users', userRoutes);
router.use('/docs', docsRoutes);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [System]
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Cybernauts API is running
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 */
router.get('/health', (req, res) => {
  const mongoose = require('mongoose');
  const dbStatus = mongoose.connection.readyState as number;
  const dbStates: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  res.status(200).json({
    success: true,
    message: 'Cybernauts API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    database: {
      status: dbStates[dbStatus] || 'unknown',
      connected: dbStatus === 1
    },
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 5000
  });
});

export default router;