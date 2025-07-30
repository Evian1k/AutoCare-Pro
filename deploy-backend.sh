#!/bin/bash

echo "🚀 Deploying AutoCare Pro Backend to Render..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📁 Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit - Fixed authentication and messaging system"
fi

# Check if remote exists
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "🔗 Adding Render remote..."
    git remote add origin https://git.render.com/autocare-pro-2.git
fi

# Add all changes
echo "📝 Staging changes..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "Fix authentication and messaging system - $(date)"

# Push to Render
echo "🚀 Pushing to Render..."
git push origin main

echo "✅ Backend deployment initiated!"
echo "🌐 Backend URL: https://autocare-pro-2.onrender.com"
echo "⏳ Deployment will take a few minutes to complete..."
echo ""
echo "📋 To check deployment status:"
echo "   Visit: https://dashboard.render.com/web/srv-autocare-pro-2"
echo ""
echo "🔍 To test the deployment:"
echo "   curl https://autocare-pro-2.onrender.com/health" 