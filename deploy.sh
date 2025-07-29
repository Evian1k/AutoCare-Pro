#!/bin/bash

# AutoCare Pro Deployment Script
set -e

echo "🚀 AutoCare Pro Deployment Script"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_status "Docker and Docker Compose are installed"
}

# Check if MongoDB is running locally
check_mongodb() {
    if command -v mongod &> /dev/null; then
        print_info "MongoDB found locally"
        if pgrep mongod > /dev/null; then
            print_warning "Local MongoDB is running. Consider stopping it to avoid port conflicts."
            print_info "You can stop it with: sudo systemctl stop mongod"
        fi
    fi
}

# Function to deploy with Docker
deploy_docker() {
    print_info "Deploying with Docker..."
    
    # Stop any existing containers
    print_info "Stopping existing containers..."
    docker-compose down 2>/dev/null || true
    
    # Build and start services
    print_info "Building and starting services..."
    docker-compose up --build -d
    
    # Wait for services to be ready
    print_info "Waiting for services to start..."
    sleep 10
    
    # Check if services are running
    if docker-compose ps | grep -q "Up"; then
        print_status "Services are running!"
        print_info "Frontend: http://localhost:3000"
        print_info "Backend API: http://localhost:3001/api"
        print_info "MongoDB: localhost:27017"
    else
        print_error "Some services failed to start. Check logs with: docker-compose logs"
        exit 1
    fi
}

# Function to deploy locally
deploy_local() {
    print_info "Deploying locally..."
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    # Check if MongoDB is running
    if ! pgrep mongod > /dev/null; then
        print_error "MongoDB is not running. Please start MongoDB first."
        print_info "Start with: sudo systemctl start mongod"
        exit 1
    fi
    
    # Install backend dependencies
    print_info "Installing backend dependencies..."
    cd backend
    npm install
    
    # Initialize database
    print_info "Initializing database..."
    npm run init-db
    
    # Start backend in background
    print_info "Starting backend server..."
    npm run dev &
    BACKEND_PID=$!
    cd ..
    
    # Install frontend dependencies
    print_info "Installing frontend dependencies..."
    cd frontend
    npm install
    
    # Start frontend
    print_info "Starting frontend server..."
    npm run dev &
    FRONTEND_PID=$!
    cd ..
    
    # Wait a moment for servers to start
    sleep 5
    
    print_status "Local deployment complete!"
    print_info "Frontend: http://localhost:5173"
    print_info "Backend API: http://localhost:3001/api"
    print_info "MongoDB: localhost:27017"
    print_warning "Press Ctrl+C to stop servers"
    
    # Wait for user interrupt
    trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
    wait
}

# Main deployment logic
main() {
    echo ""
    print_info "Choose deployment method:"
    echo "1) Docker (Recommended - includes MongoDB)"
    echo "2) Local development (requires MongoDB installed)"
    echo "3) Exit"
    
    read -p "Enter your choice (1-3): " choice
    
    case $choice in
        1)
            check_docker
            check_mongodb
            deploy_docker
            ;;
        2)
            deploy_local
            ;;
        3)
            print_info "Exiting..."
            exit 0
            ;;
        *)
            print_error "Invalid choice. Please run the script again."
            exit 1
            ;;
    esac
}

# Run main function
main