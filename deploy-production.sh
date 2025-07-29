#!/bin/bash

echo "🚀 Starting AutoCare Pro Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking deployment dependencies..."
    
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed. Please install Git first."
        exit 1
    fi
    
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

# Prepare backend for Render deployment
prepare_backend() {
    print_step "Preparing backend for Render deployment..."
    
    cd backend
    
    # Ensure all dependencies are installed
    npm install
    
    # Test the build
    npm run build 2>/dev/null || echo "No build script found, continuing..."
    
    # Check if server.js exists
    if [ ! -f "server.js" ]; then
        print_error "server.js not found in backend directory"
        exit 1
    fi
    
    print_status "Backend prepared successfully ✓"
    cd ..
}

# Prepare frontend for Vercel deployment
prepare_frontend() {
    print_step "Preparing frontend for Vercel deployment..."
    
    cd frontend
    
    # Ensure all dependencies are installed
    npm install
    
    # Test the build
    npm run build
    
    if [ $? -eq 0 ]; then
        print_status "Frontend build successful ✓"
    else
        print_error "Frontend build failed"
        exit 1
    fi
    
    cd ..
}

# Deploy to Render (Backend)
deploy_backend() {
    print_step "Deploying backend to Render..."
    
    print_warning "To deploy to Render:"
    echo "1. Go to https://render.com"
    echo "2. Create a new Web Service"
    echo "3. Connect your GitHub repository"
    echo "4. Set the following configuration:"
    echo "   - Build Command: npm install"
    echo "   - Start Command: npm start"
    echo "   - Environment: Node"
    echo "5. Add these environment variables:"
    echo "   - NODE_ENV=production"
    echo "   - PORT=10000"
    echo "   - MONGODB_URI=your-mongodb-atlas-url"
    echo "   - JWT_SECRET=your-secret-key"
    echo "   - PAYPAL_CLIENT_ID=your-paypal-client-id"
    echo "   - PAYPAL_CLIENT_SECRET=your-paypal-client-secret"
    echo "   - SOCKET_CORS_ORIGIN=https://your-frontend-domain.vercel.app"
    echo "   - FRONTEND_URL=https://your-frontend-domain.vercel.app"
    
    print_status "Backend deployment instructions provided ✓"
}

# Deploy to Vercel (Frontend)
deploy_frontend() {
    print_step "Deploying frontend to Vercel..."
    
    print_warning "To deploy to Vercel:"
    echo "1. Go to https://vercel.com"
    echo "2. Create a new project"
    echo "3. Import your GitHub repository"
    echo "4. Set the following configuration:"
    echo "   - Framework Preset: Vite"
    echo "   - Build Command: npm run build"
    echo "   - Output Directory: dist"
    echo "   - Install Command: npm install"
    echo "5. Add these environment variables:"
    echo "   - VITE_API_URL=https://your-backend-domain.onrender.com/api/v1"
    
    print_status "Frontend deployment instructions provided ✓"
}

# Main deployment function
deploy_production() {
    print_status "Starting AutoCare Pro production deployment..."
    
    check_dependencies
    prepare_backend
    prepare_frontend
    deploy_backend
    deploy_frontend
    
    print_status "🎉 Production deployment preparation completed!"
    print_status ""
    print_status "Next steps:"
    print_status "1. Deploy backend to Render using the instructions above"
    print_status "2. Deploy frontend to Vercel using the instructions above"
    print_status "3. Update environment variables with your actual URLs"
    print_status "4. Test the deployed application"
    
    echo ""
    print_status "Your application will be available at:"
    print_status "Backend: https://your-app-name.onrender.com"
    print_status "Frontend: https://your-app-name.vercel.app"
}

# Run deployment
deploy_production 