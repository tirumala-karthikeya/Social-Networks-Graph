import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';
import { connectDatabase } from './config/database';
import { setupSwagger } from './config/swagger';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';
import { setupClustering, isClusteringEnabled } from './utils/cluster';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use('/api', apiLimiter);

// Setup Swagger documentation
setupSwagger(app);

// API routes
app.use('/api', routes);

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, '../../public')));

// Health check route (before API routes)
app.get('/health', (req, res) => {
  try {
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
  } catch (error) {
    // Fallback health check if mongoose is not available
    res.status(200).json({
      success: true,
      message: 'Cybernauts API is running (basic health check)',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      port: process.env.PORT || 5000
    });
  }
});

// Root route - serve the React app
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/index.html'));
});

// Catch all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/index.html'));
});

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const startServer = async (): Promise<void> => {
  try {
    console.log('🔄 Starting server...');
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
    console.log(`🔧 Clustering enabled: ${isClusteringEnabled()}`);
    
    // Setup clustering if enabled
    if (isClusteringEnabled()) {
      console.log('🔄 Setting up clustering...');
      setupClustering();
      return;
    }

    // Start the server first (so health checks can work)
    console.log(`🔄 Starting server on port ${PORT}...`);
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Cybernauts API server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api/health`);
      console.log(`✅ Server is ready to accept connections`);
      
      // Connect to database in the background (non-blocking)
      connectDatabase().catch((error) => {
        console.error('❌ MongoDB connection failed (will retry):', error.message);
        // Don't exit the process, just log the error
        // The app can still serve static files and basic endpoints
      });
    });
    
    // Handle server startup errors
    app.on('error', (error: any) => {
      console.error('❌ Server error:', error);
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
      }
      process.exit(1);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

// Start the server
startServer();

export default app;