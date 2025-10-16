# 🚀 Cybernauts - Interactive User Relationship & Hobby Network

A full-stack application that manages users and their relationships using a CRUD API backend, MongoDB database, and a React frontend visualized as a dynamic graph using React Flow.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Deployment](#deployment)
- [Assignment Requirements](#assignment-requirements)
- [Contributing](#contributing)

## ✨ Features

### Core Features
- **User Management**: Create, read, update, and delete users
- **Relationship Management**: Create and remove friendships between users
- **Hobby Management**: Add, remove, and assign hobbies to users
- **Interactive Graph Visualization**: Dynamic graph using React Flow
- **Real-time Updates**: Graph updates automatically when data changes
- **Popularity Score Calculation**: Automatic calculation based on friends and shared hobbies

### Advanced Features
- **Drag & Drop**: Drag hobbies onto user nodes to assign them
- **Node Dragging**: Drag user nodes around the graph
- **Friendship Creation**: Click and drag between nodes to create connections
- **Search & Filter**: Search users and filter hobbies
- **Undo/Redo**: Bonus feature for reversing actions
- **Responsive Design**: Works on desktop and mobile devices
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Loading States**: Visual feedback during operations

### Bonus Features
- **Clustering**: Node.js cluster API for load balancing
- **Performance Optimization**: Debouncing, lazy loading, and caching
- **Custom Node Types**: HighScoreNode and LowScoreNode with animations
- **API Documentation**: Complete Swagger/OpenAPI documentation
- **Comprehensive Testing**: Unit and integration tests

## 🛠 Tech Stack

### Backend
- **Node.js** with **Express** and **TypeScript**
- **MongoDB** with **Mongoose** ODM
- **JWT** for authentication (ready for implementation)
- **Swagger/OpenAPI** for API documentation
- **Jest** for testing
- **Nodemon** for development

### Frontend
- **React** with **TypeScript**
- **React Flow** for graph visualization
- **Material-UI** for UI components
- **React Context** for state management
- **Axios** for API calls
- **Framer Motion** for animations
- **React Toastify** for notifications

### Development & Deployment
- **Docker** and **Docker Compose**
- **ESLint** and **Prettier** for code quality
- **Git** for version control

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas)
- **Git**

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cybernauts
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install backend dependencies
   cd backend && npm install
   
   # Install frontend dependencies
   cd ../frontend && npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy environment example files
   cp backend/env.example backend/.env
   cp frontend/env.example frontend/.env
   ```

## ⚙️ Configuration

### Backend Environment Variables (`backend/.env`)
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/cybernauts
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cybernauts

# Security
JWT_SECRET=your-super-secret-jwt-key
BCRYPT_ROUNDS=12

# Performance
ENABLE_CLUSTERING=false
LOG_LEVEL=info
```

### Frontend Environment Variables (`frontend/.env`)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

## 🏃‍♂️ Running the Application

### Option 1: Using npm scripts (Recommended)

1. **Start MongoDB** (if using local installation)
   ```bash
   # On Windows
   net start MongoDB
   
   # On macOS/Linux
   sudo systemctl start mongod
   ```

2. **Start the backend**
   ```bash
   npm run dev:backend
   ```

3. **Start the frontend** (in a new terminal)
   ```bash
   npm run dev:frontend
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api
   - API Documentation: http://localhost:5000/api-docs

### Option 2: Using Docker

1. **Build and start all services**
   ```bash
   docker-compose up --build
   ```

2. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api
   - MongoDB: localhost:27017

### Option 3: Individual services

1. **Backend only**
   ```bash
   cd backend
   npm run dev
   ```

2. **Frontend only**
   ```bash
   cd frontend
   npm start
   ```

## 📚 API Documentation

The API documentation is available at `/api-docs` when the backend is running. It includes:

- **Complete endpoint documentation**
- **Request/response schemas**
- **Example requests and responses**
- **Interactive testing interface**

### Key API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users |
| POST | `/api/users` | Create new user |
| GET | `/api/users/:id` | Get user by ID |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |
| POST | `/api/users/:id/link` | Create friendship |
| DELETE | `/api/users/:id/unlink` | Remove friendship |
| GET | `/api/graph` | Get graph data |
| GET | `/api/hobbies` | Get all hobbies |
| GET | `/api/health` | Health check |

## 📁 Project Structure

```
cybernauts/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Custom middleware
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── types/           # TypeScript types
│   │   └── utils/           # Utility functions
│   ├── tests/               # Test files
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── public/              # Static files
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── contexts/        # React contexts
│   │   ├── services/        # API services
│   │   ├── types/           # TypeScript types
│   │   └── utils/           # Utility functions
│   ├── package.json
│   └── tsconfig.json
├── docker-compose.yml
├── Dockerfile
└── README.md
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test                    # Run all tests
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Run tests with coverage
```

### Frontend Tests
```bash
cd frontend
npm test                   # Run all tests
npm run test:coverage      # Run tests with coverage
```

### Test Coverage
- **Unit Tests**: Individual function testing
- **Integration Tests**: API endpoint testing
- **Component Tests**: React component testing
- **E2E Tests**: End-to-end user flow testing

## 🚀 Deployment

### Option 1: Render (Recommended)

1. **Backend Deployment**
   - Connect your GitHub repository to Render
   - Create a new Web Service
   - Set build command: `cd backend && npm install && npm run build`
   - Set start command: `cd backend && npm start`
   - Add environment variables

2. **Frontend Deployment**
   - Create a new Static Site
   - Set build command: `cd frontend && npm install && npm run build`
   - Set publish directory: `frontend/build`

### Option 2: Vercel

1. **Frontend Deployment**
   ```bash
   cd frontend
   npx vercel
   ```

2. **Backend Deployment**
   - Use Vercel's serverless functions or deploy to Railway/Heroku

### Option 3: Railway

1. **Deploy both services**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login and deploy
   railway login
   railway deploy
   ```

### Environment Variables for Production

Make sure to set these environment variables in your deployment platform:

```env
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
REACT_APP_API_URL=your-production-api-url
```

## 📋 Assignment Requirements

This project fulfills all the requirements from the Cybernauts Development Assignment:

### ✅ Backend Requirements
- [x] Node.js (Express + TypeScript)
- [x] MongoDB database
- [x] All required API endpoints
- [x] User object with all specified fields
- [x] Business logic (popularity score, deletion rules, circular friendship prevention)
- [x] Error handling (400, 404, 409, 500)
- [x] Environment configuration
- [x] API tests (unit and integration)

### ✅ Frontend Requirements
- [x] React + TypeScript
- [x] React Flow graph visualization
- [x] Dynamic node updates
- [x] Draggable hobbies sidebar
- [x] User management panel
- [x] State management (React Context)
- [x] Loading & error UI
- [x] Toast notifications

### ✅ Bonus Features
- [x] Development mode with nodemon
- [x] Clustering/load balancing
- [x] Custom React-Flow nodes
- [x] Performance optimization
- [x] Undo/redo functionality
- [x] Comprehensive API documentation

## 🎯 How to Use the Application

### 1. **Creating Users**
- Click the "+ Add User" button in the right sidebar
- Fill in username, age, and hobbies
- Click "Create User"

### 2. **Managing Hobbies**
- Add new hobbies using the "Add new hobby..." input in the left sidebar
- Drag hobbies from the sidebar onto user nodes to assign them
- Search hobbies using the search bar

### 3. **Creating Friendships**
- Click and drag from one user node to another
- Release to create a friendship connection
- The popularity scores will update automatically

### 4. **Graph Interaction**
- Drag nodes around to reposition them
- Use zoom controls to zoom in/out
- Click "Fit View" to see all nodes
- Use the minimap for navigation

### 5. **User Management**
- Click on user nodes to select them
- Edit or delete users using the right sidebar
- View user statistics in the graph statistics panel

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

If you have any questions or need help, please:

1. Check the [API Documentation](http://localhost:5000/api-docs)
2. Review the [Issues](https://github.com/your-repo/cybernauts/issues)
3. Create a new issue with detailed information

## 🎉 Acknowledgments

- [React Flow](https://reactflow.dev/) for the amazing graph visualization library
- [Material-UI](https://mui.com/) for the beautiful UI components
- [MongoDB](https://www.mongodb.com/) for the flexible database
- [Express.js](https://expressjs.com/) for the robust backend framework

---

**Made with ❤️ for the Cybernauts Development Assignment**