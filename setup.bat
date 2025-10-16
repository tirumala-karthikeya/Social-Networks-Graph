@echo off
echo 🚀 Setting up Cybernauts - Interactive User Relationship ^& Hobby Network
echo ==================================================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 16 or higher.
    pause
    exit /b 1
)

echo ✅ Node.js version: 
node --version

REM Check if MongoDB is installed
mongod --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  MongoDB is not installed. Please install MongoDB or use Docker.
    echo    You can install MongoDB from: https://docs.mongodb.com/manual/installation/
    echo    Or use Docker: docker run -d -p 27017:27017 --name mongodb mongo:7.0
)

REM Install root dependencies
echo 📦 Installing root dependencies...
call npm install

REM Install backend dependencies
echo 📦 Installing backend dependencies...
cd backend
call npm install
cd ..

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
cd frontend
call npm install
cd ..

REM Create environment file
echo ⚙️  Setting up environment configuration...
if not exist backend\.env (
    copy backend\env.example backend\.env
    echo ✅ Created backend\.env file from template
    echo 📝 Please edit backend\.env with your MongoDB connection string
) else (
    echo ✅ backend\.env already exists
)

REM Create MongoDB data directory
echo 📁 Creating MongoDB data directory...
if not exist data\db mkdir data\db

echo.
echo 🎉 Setup completed successfully!
echo.
echo 📋 Next steps:
echo 1. Start MongoDB (if not using Docker):
echo    mongod --dbpath ./data/db
echo.
echo 2. Start the development servers:
echo    npm run dev
echo.
echo 3. Or start with Docker:
echo    docker-compose up -d
echo.
echo 4. Access the application:
echo    Frontend: http://localhost:3000
echo    Backend API: http://localhost:5000
echo    API Docs: http://localhost:5000/api/docs
echo.
echo 🔧 Development commands:
echo    npm run dev          - Start both frontend and backend
echo    npm run dev:backend  - Start only backend
echo    npm run dev:frontend - Start only frontend
echo    npm test            - Run backend tests
echo.
echo 📚 For more information, see README.md
pause