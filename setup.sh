#!/bin/bash

# Cybernauts Setup Script
echo "🚀 Setting up Cybernauts - Interactive User Relationship & Hobby Network"
echo "=================================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB is not installed. Please install MongoDB or use Docker."
    echo "   You can install MongoDB from: https://docs.mongodb.com/manual/installation/"
    echo "   Or use Docker: docker run -d -p 27017:27017 --name mongodb mongo:7.0"
fi

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Create environment file
echo "⚙️  Setting up environment configuration..."
if [ ! -f backend/.env ]; then
    cp backend/env.example backend/.env
    echo "✅ Created backend/.env file from template"
    echo "📝 Please edit backend/.env with your MongoDB connection string"
else
    echo "✅ backend/.env already exists"
fi

# Create MongoDB data directory
echo "📁 Creating MongoDB data directory..."
mkdir -p data/db

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Start MongoDB (if not using Docker):"
echo "   mongod --dbpath ./data/db"
echo ""
echo "2. Start the development servers:"
echo "   npm run dev"
echo ""
echo "3. Or start with Docker:"
echo "   docker-compose up -d"
echo ""
echo "4. Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:5000"
echo "   API Docs: http://localhost:5000/api/docs"
echo ""
echo "🔧 Development commands:"
echo "   npm run dev          - Start both frontend and backend"
echo "   npm run dev:backend  - Start only backend"
echo "   npm run dev:frontend - Start only frontend"
echo "   npm test            - Run backend tests"
echo ""
echo "📚 For more information, see README.md"