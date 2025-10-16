import cluster from 'cluster';
import os from 'os';
import { connectDatabase } from '../config/database';

export const setupClustering = (): void => {
  if (cluster.isPrimary) {
    const numCPUs = os.cpus().length;
    const numWorkers = Math.min(numCPUs, 4); // Limit to 4 workers max

    console.log(`🚀 Master process ${process.pid} is running`);
    console.log(`👥 Starting ${numWorkers} worker processes`);

    // Fork workers
    for (let i = 0; i < numWorkers; i++) {
      cluster.fork();
    }

    // Handle worker exit
    cluster.on('exit', (worker, code, signal) => {
      console.log(`💀 Worker ${worker.process.pid} died`);
      
      if (code !== 0 && !worker.exitedAfterDisconnect) {
        console.log('🔄 Starting a new worker');
        cluster.fork();
      }
    });

    // Handle worker online
    cluster.on('online', (worker) => {
      console.log(`✅ Worker ${worker.process.pid} is online`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('🛑 Master received SIGTERM, shutting down gracefully');
      
      for (const id in cluster.workers) {
        cluster.workers[id]?.kill();
      }
    });

    process.on('SIGINT', () => {
      console.log('🛑 Master received SIGINT, shutting down gracefully');
      
      for (const id in cluster.workers) {
        cluster.workers[id]?.kill();
      }
    });

  } else {
    // Worker process
    console.log(`👷 Worker ${process.pid} started`);
    
    // Connect to database for each worker
    connectDatabase().catch((error) => {
      console.error(`❌ Worker ${process.pid} failed to connect to database:`, error);
      process.exit(1);
    });

    // Handle worker shutdown
    process.on('SIGTERM', () => {
      console.log(`🛑 Worker ${process.pid} received SIGTERM, shutting down gracefully`);
      process.exit(0);
    });

    process.on('SIGINT', () => {
      console.log(`🛑 Worker ${process.pid} received SIGINT, shutting down gracefully`);
      process.exit(0);
    });
  }
};

export const isClusteringEnabled = (): boolean => {
  return process.env.NODE_ENV === 'production' && process.env.ENABLE_CLUSTERING === 'true';
};