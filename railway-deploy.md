# Railway Deployment Guide for Cybernauts

## Required Environment Variables

Make sure to set these environment variables in your Railway project:

### Required Variables:
- `MONGODB_URI` - Your MongoDB connection string
- `NODE_ENV` - Set to `production`
- `PORT` - Railway will set this automatically, but you can override it

### Optional Variables:
- `CORS_ORIGIN` - Set to your frontend URL (default: http://localhost:3000)
- `ENABLE_CLUSTERING` - Set to `false` (Railway handles scaling)
- `JWT_SECRET` - If using authentication features

## Common Issues and Solutions:

### 1. Container fails to start
- Check that `MONGODB_URI` is set correctly
- Ensure `ENABLE_CLUSTERING=false` is set
- Verify the MongoDB connection string is accessible from Railway's network

### 2. Database connection fails
- Verify your MongoDB Atlas cluster allows connections from Railway's IP ranges
- Check that the MongoDB user has the correct permissions
- Ensure the database name is included in the connection string

### 3. Port binding issues
- Railway automatically sets the `PORT` environment variable
- The app is configured to use `process.env.PORT || 5000`

## Testing Locally with Railway Environment:

```bash
# Set environment variables similar to Railway
export NODE_ENV=production
export ENABLE_CLUSTERING=false
export MONGODB_URI="your-mongodb-connection-string"

# Build and test
docker build -t cybernauts-test .
docker run --rm -p 5000:5000 -e NODE_ENV=production -e ENABLE_CLUSTERING=false -e MONGODB_URI="your-mongodb-connection-string" cybernauts-test
```

## Railway Configuration:

The `railway.json` file is included to help Railway understand how to deploy your application. It specifies:
- Use the Dockerfile for building
- Use the startup script for running
- Configure health checks
- Set restart policies