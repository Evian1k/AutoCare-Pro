#!/bin/bash

echo "🚀 Starting AutoCare Pro Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    print_status "Dependencies check passed ✓"
}

# Install backend dependencies
install_backend() {
    print_status "Installing backend dependencies..."
    cd backend
    
    if [ -f "package-lock.json" ]; then
        npm ci
    else
        npm install
    fi
    
    if [ $? -eq 0 ]; then
        print_status "Backend dependencies installed successfully ✓"
    else
        print_error "Failed to install backend dependencies"
        exit 1
    fi
    
    cd ..
}

# Install frontend dependencies
install_frontend() {
    print_status "Installing frontend dependencies..."
    cd frontend
    
    if [ -f "package-lock.json" ]; then
        npm ci
    else
        npm install
    fi
    
    if [ $? -eq 0 ]; then
        print_status "Frontend dependencies installed successfully ✓"
    else
        print_error "Failed to install frontend dependencies"
        exit 1
    fi
    
    cd ..
}

# Build frontend
build_frontend() {
    print_status "Building frontend..."
    cd frontend
    
    npm run build
    
    if [ $? -eq 0 ]; then
        print_status "Frontend built successfully ✓"
    else
        print_error "Failed to build frontend"
        exit 1
    fi
    
    cd ..
}

# Start backend server
start_backend() {
    print_status "Starting backend server..."
    cd backend
    
    # Check if .env file exists, if not create from example
    if [ ! -f ".env" ]; then
        print_warning "No .env file found. Creating from example..."
        if [ -f "env.example" ]; then
            cp env.example .env
            print_status "Created .env file from example"
        else
            print_error "No env.example file found. Please create a .env file manually."
            exit 1
        fi
    fi
    
    # Start the server
    npm start &
    BACKEND_PID=$!
    
    # Wait a moment for server to start
    sleep 3
    
    # Check if server is running
    if curl -s http://localhost:3001/health > /dev/null; then
        print_status "Backend server started successfully ✓"
    else
        print_error "Failed to start backend server"
        kill $BACKEND_PID 2>/dev/null
        exit 1
    fi
    
    cd ..
}

# Start frontend development server
start_frontend() {
    print_status "Starting frontend development server..."
    cd frontend
    
    npm run dev &
    FRONTEND_PID=$!
    
    # Wait a moment for server to start
    sleep 5
    
    # Check if server is running
    if curl -s http://localhost:5173 > /dev/null; then
        print_status "Frontend server started successfully ✓"
    else
        print_error "Failed to start frontend server"
        kill $FRONTEND_PID 2>/dev/null
        exit 1
    fi
    
    cd ..
}

# Main deployment function
deploy() {
    print_status "Starting AutoCare Pro deployment..."
    
    check_dependencies
    install_backend
    install_frontend
    build_frontend
    start_backend
    start_frontend
    
    print_status "🎉 Deployment completed successfully!"
    print_status "Backend API: http://localhost:3001"
    print_status "Frontend App: http://localhost:5173"
    print_status "Health Check: http://localhost:3001/health"
    
    echo ""
    print_status "Press Ctrl+C to stop all servers"
    
    # Wait for interrupt signal
    trap 'cleanup' INT
    wait
}

# Cleanup function
cleanup() {
    print_status "Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    print_status "Servers stopped. Goodbye!"
    exit 0
}

# Run deployment
deploy 