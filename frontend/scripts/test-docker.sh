#!/bin/bash

# Test Docker Build Script
echo "🧪 Testing Frontend Docker Build..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Clean up any existing containers
echo "🧹 Cleaning up existing containers..."
docker stop frontend-app 2>/dev/null || true
docker rm frontend-app 2>/dev/null || true

# Build the development image
echo "🔨 Building Docker image..."
docker build -f Dockerfile.dev -t ai-agent-frontend:test .

if [ $? -ne 0 ]; then
    echo "❌ Docker build failed!"
    exit 1
fi

echo "✅ Docker image built successfully"

# Test the container
echo "🚀 Testing container..."
docker run -d --name frontend-app-test -p 3000:3000 \
  -e VITE_AUTH_SERVICE_URL=http://localhost:3001 \
  -e VITE_COMPANY_SERVICE_URL=http://localhost:3002 \
  -e VITE_API_BASE_URL=http://localhost:3002 \
  -e NODE_ENV=development \
  ai-agent-frontend:test

# Wait a moment for the container to start
sleep 5

# Check if container is running
if docker ps | grep -q frontend-app-test; then
    echo "✅ Container is running"
    
    # Check container logs
    echo "📋 Container logs:"
    docker logs frontend-app-test
    
    echo ""
    echo "🌐 Application should be available at: http://localhost:3000"
    echo "Press Ctrl+C to stop the test container"
    
    # Keep container running for testing
    docker logs -f frontend-app-test
else
    echo "❌ Container failed to start"
    docker logs frontend-app-test
    exit 1
fi

# Cleanup
echo "🧹 Cleaning up test container..."
docker stop frontend-app-test
docker rm frontend-app-test
