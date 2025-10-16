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
const PORT = parseInt(process.env.PORT || '5000', 10);

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
// Handle both Docker and Vercel environments
const staticPath = path.join(__dirname, '../../public');
const vercelStaticPath = path.join(__dirname, '../public');
const frontendBuildPath = path.join(__dirname, '../../frontend/build');

console.log('Checking for static files in:', {
  staticPath,
  vercelStaticPath,
  frontendBuildPath,
  staticExists: require('fs').existsSync(staticPath),
  vercelExists: require('fs').existsSync(vercelStaticPath),
  frontendExists: require('fs').existsSync(frontendBuildPath)
});

if (require('fs').existsSync(staticPath)) {
  app.use(express.static(staticPath));
  console.log('Serving static files from:', staticPath);
} else if (require('fs').existsSync(vercelStaticPath)) {
  app.use(express.static(vercelStaticPath));
  console.log('Serving static files from:', vercelStaticPath);
} else if (require('fs').existsSync(frontendBuildPath)) {
  app.use(express.static(frontendBuildPath));
  console.log('Serving static files from:', frontendBuildPath);
} else {
  console.log('Static files directory not found, serving basic response');
}

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
  const indexPath = path.join(__dirname, '../../public/index.html');
  const vercelIndexPath = path.join(__dirname, '../public/index.html');
  const frontendIndexPath = path.join(__dirname, '../../frontend/build/index.html');
  
  console.log('Looking for index.html in:', {
    indexPath,
    vercelIndexPath,
    frontendIndexPath,
    indexExists: require('fs').existsSync(indexPath),
    vercelExists: require('fs').existsSync(vercelIndexPath),
    frontendExists: require('fs').existsSync(frontendIndexPath)
  });
  
  if (require('fs').existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else if (require('fs').existsSync(vercelIndexPath)) {
    res.sendFile(vercelIndexPath);
  } else if (require('fs').existsSync(frontendIndexPath)) {
    res.sendFile(frontendIndexPath);
  } else {
    // Fallback HTML if React app not found
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Cybernauts API</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .container { max-width: 600px; margin: 0 auto; }
            .api-link { color: #2196f3; text-decoration: none; }
            .api-link:hover { text-decoration: underline; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🚀 Cybernauts API</h1>
            <p>Your API is running successfully!</p>
            <h2>Available Endpoints:</h2>
            <ul>
              <li><a href="/health" class="api-link">Health Check</a></li>
              <li><a href="/api/health" class="api-link">API Health</a></li>
              <li><a href="/api/users" class="api-link">Users API</a></li>
            </ul>
            <p><strong>Note:</strong> The React frontend is not available. This might be a deployment configuration issue.</p>
            <p><strong>Debug Info:</strong> Check Vercel function logs for static file paths.</p>
          </div>
        </body>
      </html>
    `);
  }
});

// Catch all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, '../../public/index.html');
  const vercelIndexPath = path.join(__dirname, '../public/index.html');
  const frontendIndexPath = path.join(__dirname, '../../frontend/build/index.html');
  
  if (require('fs').existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else if (require('fs').existsSync(vercelIndexPath)) {
    res.sendFile(vercelIndexPath);
  } else if (require('fs').existsSync(frontendIndexPath)) {
    res.sendFile(frontendIndexPath);
  } else {
    res.status(404).json({ error: 'Not found', path: req.path });
  }
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
    const server = app.listen(PORT, '0.0.0.0', () => {
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
    
    server.on('error', (error: any) => {
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