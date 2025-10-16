# Multi-stage build for production
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN npm install
RUN cd backend && npm install
RUN cd frontend && npm install

# Copy source code
COPY . .

# Ensure frontend public directory exists and has required files
RUN mkdir -p frontend/public
RUN if [ ! -f frontend/public/index.html ]; then \
    echo '<!DOCTYPE html><html><head><title>Cybernauts</title></head><body><div id="root"></div></body></html>' > frontend/public/index.html; \
    fi

# Build backend
RUN cd backend && npm run build
RUN ls -la backend/dist/ || echo "Backend dist directory not found"
RUN test -f backend/dist/index.js && echo "Backend index.js found" || echo "Backend index.js not found"

# Build frontend
RUN cd frontend && npm run build

# Production stage
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S cybernauts -u 1001

# Set working directory
WORKDIR /app

# Copy built backend
COPY --from=builder --chown=cybernauts:nodejs /app/backend/dist ./backend/dist
COPY --from=builder --chown=cybernauts:nodejs /app/backend/package*.json ./backend/
COPY --from=builder --chown=cybernauts:nodejs /app/backend/node_modules ./backend/node_modules

# Verify backend files exist
RUN ls -la backend/dist/ && test -f backend/dist/index.js

# Copy built frontend to serve as static files
COPY --from=builder --chown=cybernauts:nodejs /app/frontend/build ./public

# Copy other necessary files
COPY --from=builder --chown=cybernauts:nodejs /app/package*.json ./

# Switch to non-root user
USER cybernauts

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Start the application - FIXED
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "/app/backend/dist/index.js"]