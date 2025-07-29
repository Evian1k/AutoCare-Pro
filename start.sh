#!/bin/bash

# AutoCare Pro Quick Start Script
echo "🚗 Starting AutoCare Pro..."

# Check if MongoDB is running
if ! pgrep mongod > /dev/null; then
    echo "❌ MongoDB is not running. Please start MongoDB first:"
    echo "   sudo systemctl start mongod"
    echo "   or"
    echo "   brew services start mongodb-community"
    exit 1
fi

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Port $1 is already in use"
        return 1
    fi
    return 0
}

# Check ports
if ! check_port 3001; then
    echo "Backend port 3001 is busy. Please free it first."
    exit 1
fi

if ! check_port 5173; then
    echo "Frontend port 5173 is busy. Please free it first."
    exit 1
fi

# Start backend
echo "🚀 Starting backend server..."
cd backend
npm install > /dev/null 2>&1
npm run init-db > /dev/null 2>&1
npm run dev &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 3

# Start frontend
echo "🎨 Starting frontend server..."
cd frontend
npm install > /dev/null 2>&1
npm run dev &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
echo "⏳ Waiting for frontend to start..."
sleep 3

echo ""
echo "✅ AutoCare Pro is running!"
echo "🌐 Frontend: http://localhost:5173"
echo "🔧 Backend:  http://localhost:3001/api"
echo ""
echo "👤 Admin Login:"
echo "   Email: emmanuel.evian@autocare.com"
echo "   Password: autocarpro12k@12k.wwc"
echo ""
echo "Press Ctrl+C to stop servers"

# Cleanup function
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    echo "✅ Servers stopped"
    exit 0
}

# Set up signal handlers
trap cleanup INT TERM

# Wait for user interrupt
wait