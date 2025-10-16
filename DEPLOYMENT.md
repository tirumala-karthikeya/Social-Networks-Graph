# 🚀 Deployment Guide

This guide covers multiple deployment options for the Cybernauts application.

## 📋 Prerequisites

- GitHub repository with your code
- MongoDB Atlas account (for cloud database)
- Deployment platform account (Render, Vercel, Railway, etc.)

## 🌐 Deployment Options

### Option 1: Render (Recommended)

Render provides excellent support for full-stack applications with automatic deployments.

#### Backend Deployment

1. **Connect Repository**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Backend Service**
   ```
   Name: cybernauts-backend
   Environment: Node
   Build Command: cd backend && npm install && npm run build
   Start Command: cd backend && npm start
   ```

3. **Environment Variables**
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cybernauts
   JWT_SECRET=your-super-secret-jwt-key
   BCRYPT_ROUNDS=12
   ENABLE_CLUSTERING=true
   LOG_LEVEL=info
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note the service URL (e.g., `https://cybernauts-backend.onrender.com`)

#### Frontend Deployment

1. **Create Static Site**
   - Click "New +" → "Static Site"
   - Connect your GitHub repository

2. **Configure Frontend**
   ```
   Name: cybernauts-frontend
   Build Command: cd frontend && npm install && npm run build
   Publish Directory: frontend/build
   ```

3. **Environment Variables**
   ```
   REACT_APP_API_URL=https://cybernauts-backend.onrender.com/api
   REACT_APP_ENV=production
   ```

4. **Deploy**
   - Click "Create Static Site"
   - Wait for deployment to complete

#### Database Setup

1. **MongoDB Atlas**
   - Create a new cluster at [MongoDB Atlas](https://cloud.mongodb.com)
   - Create a database user
   - Whitelist all IP addresses (0.0.0.0/0) for development
   - Get connection string

2. **Update Environment Variables**
   - Use the MongoDB Atlas connection string in your backend environment variables

### Option 2: Vercel

Vercel is excellent for frontend deployment and has good serverless support.

#### Frontend Deployment

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy Frontend**
   ```bash
   cd frontend
   vercel
   ```

3. **Configure Environment Variables**
   ```
   REACT_APP_API_URL=https://your-backend-url.com/api
   ```

#### Backend Deployment

For the backend, use Railway or Render as Vercel's serverless functions have limitations for this type of application.

### Option 3: Railway

Railway provides simple deployment for both frontend and backend.

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and Deploy**
   ```bash
   railway login
   railway init
   railway up
   ```

3. **Configure Environment Variables**
   - Use Railway dashboard to set environment variables
   - Connect MongoDB Atlas database

### Option 4: Docker Deployment

#### Using Docker Compose

1. **Build and Deploy**
   ```bash
   docker-compose up --build -d
   ```

2. **Access Application**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000
   - MongoDB: localhost:27017

#### Using Individual Containers

1. **Build Backend Image**
   ```bash
   cd backend
   docker build -t cybernauts-backend .
   ```

2. **Build Frontend Image**
   ```bash
   cd frontend
   docker build -t cybernauts-frontend .
   ```

3. **Run Containers**
   ```bash
   # Start MongoDB
   docker run -d --name mongodb -p 27017:27017 mongo:latest
   
   # Start Backend
   docker run -d --name backend -p 5000:5000 --link mongodb:mongodb cybernauts-backend
   
   # Start Frontend
   docker run -d --name frontend -p 3000:3000 cybernauts-frontend
   ```

## 🔧 Environment Configuration

### Production Environment Variables

#### Backend (.env)
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cybernauts
JWT_SECRET=your-super-secret-jwt-key-here
BCRYPT_ROUNDS=12
ENABLE_CLUSTERING=true
LOG_LEVEL=info
```

#### Frontend (.env)
```env
REACT_APP_API_URL=https://your-backend-url.com/api
REACT_APP_ENV=production
```

## 📊 Performance Optimization

### Backend Optimizations

1. **Enable Clustering**
   ```env
   ENABLE_CLUSTERING=true
   ```

2. **Database Indexing**
   - MongoDB indexes are already configured in the User model
   - Monitor query performance in production

3. **Rate Limiting**
   - Rate limiting is enabled by default
   - Adjust limits based on usage patterns

### Frontend Optimizations

1. **Build Optimization**
   ```bash
   cd frontend
   npm run build
   ```

2. **CDN Configuration**
   - Use a CDN for static assets
   - Enable gzip compression

## 🔒 Security Considerations

### Production Security

1. **Environment Variables**
   - Never commit `.env` files
   - Use strong, unique secrets
   - Rotate secrets regularly

2. **Database Security**
   - Use MongoDB Atlas with proper authentication
   - Whitelist only necessary IP addresses
   - Enable SSL/TLS connections

3. **API Security**
   - Implement rate limiting
   - Add CORS configuration for production domains
   - Consider implementing JWT authentication

4. **HTTPS**
   - Always use HTTPS in production
   - Configure SSL certificates

## 📈 Monitoring and Logging

### Application Monitoring

1. **Health Checks**
   - Use `/api/health` endpoint for monitoring
   - Set up uptime monitoring

2. **Error Tracking**
   - Consider integrating Sentry or similar service
   - Monitor application logs

3. **Performance Monitoring**
   - Monitor response times
   - Track database query performance

### Logging

1. **Structured Logging**
   - Use appropriate log levels
   - Include request IDs for tracing

2. **Log Aggregation**
   - Use services like LogRocket or similar
   - Centralize logs for analysis

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for TypeScript compilation errors

2. **Database Connection Issues**
   - Verify MongoDB connection string
   - Check network connectivity
   - Ensure database user has proper permissions

3. **CORS Issues**
   - Verify CORS configuration
   - Check frontend API URL configuration

4. **Environment Variable Issues**
   - Ensure all required variables are set
   - Check variable names and values
   - Verify no typos in configuration

### Debugging Steps

1. **Check Logs**
   ```bash
   # Backend logs
   railway logs
   
   # Or for Docker
   docker logs cybernauts-backend
   ```

2. **Test API Endpoints**
   ```bash
   curl https://your-backend-url.com/api/health
   ```

3. **Verify Database Connection**
   - Test MongoDB connection string
   - Check database permissions

## 📝 Deployment Checklist

### Pre-Deployment

- [ ] Code is committed to repository
- [ ] All tests pass locally
- [ ] Environment variables are configured
- [ ] Database is set up and accessible
- [ ] Build process works locally

### Post-Deployment

- [ ] Health check endpoint responds
- [ ] Frontend loads correctly
- [ ] API endpoints are accessible
- [ ] Database operations work
- [ ] Error handling is working
- [ ] Performance is acceptable

### Production Readiness

- [ ] HTTPS is configured
- [ ] Domain is configured
- [ ] Monitoring is set up
- [ ] Backup strategy is in place
- [ ] Security measures are implemented

## 🔄 Continuous Deployment

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Render
        run: |
          # Add deployment commands here
```

### Automatic Deployments

1. **Render**: Automatic deployments on git push
2. **Vercel**: Automatic deployments on git push
3. **Railway**: Automatic deployments on git push

## 📞 Support

If you encounter issues during deployment:

1. Check the platform-specific documentation
2. Review application logs
3. Verify environment configuration
4. Test locally with production-like settings

---

**Happy Deploying! 🚀**