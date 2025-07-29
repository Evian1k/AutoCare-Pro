#!/bin/bash

# MongoDB Installation Script for Ubuntu/Debian
echo "🍃 Installing MongoDB Community Edition..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

# Detect OS
if [[ -f /etc/os-release ]]; then
    . /etc/os-release
    OS=$NAME
    VER=$VERSION_ID
else
    print_error "Cannot detect OS version"
    exit 1
fi

print_status "Detected OS: $OS $VER"

# Install MongoDB based on OS
if [[ $OS == *"Ubuntu"* ]]; then
    print_status "Installing MongoDB on Ubuntu..."
    
    # Import MongoDB public key
    curl -fsSL https://pgp.mongodb.com/server-7.0.asc | \
        sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
    
    # Add MongoDB repository
    echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
        sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    
    # Update package list
    sudo apt-get update
    
    # Install MongoDB
    sudo apt-get install -y mongodb-org
    
elif [[ $OS == *"Debian"* ]]; then
    print_status "Installing MongoDB on Debian..."
    
    # Import MongoDB public key
    curl -fsSL https://pgp.mongodb.com/server-7.0.asc | \
        sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
    
    # Add MongoDB repository
    echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] http://repo.mongodb.org/apt/debian bullseye/mongodb-org/7.0 main" | \
        sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    
    # Update package list
    sudo apt-get update
    
    # Install MongoDB
    sudo apt-get install -y mongodb-org
    
else
    print_error "Unsupported OS: $OS"
    print_warning "Please install MongoDB manually from: https://docs.mongodb.com/manual/installation/"
    exit 1
fi

# Start and enable MongoDB
print_status "Starting MongoDB service..."
sudo systemctl start mongod
sudo systemctl enable mongod

# Check if MongoDB is running
if sudo systemctl is-active --quiet mongod; then
    print_status "MongoDB is running successfully!"
    print_status "Service status: $(sudo systemctl is-active mongod)"
    
    # Test connection
    sleep 2
    if mongosh --eval "db.runCommand('ping').ok" --quiet; then
        print_status "MongoDB connection test passed!"
    else
        print_warning "MongoDB is running but connection test failed"
    fi
else
    print_error "Failed to start MongoDB"
    print_warning "Check logs with: sudo journalctl -u mongod"
    exit 1
fi

echo ""
print_status "MongoDB installation completed!"
print_status "You can now run: ./start.sh or ./deploy.sh"
echo ""
print_status "Useful MongoDB commands:"
echo "  Start:   sudo systemctl start mongod"
echo "  Stop:    sudo systemctl stop mongod"
echo "  Status:  sudo systemctl status mongod"
echo "  Connect: mongosh"