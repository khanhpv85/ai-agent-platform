#!/bin/bash

# Frontend Docker Setup Script
echo "🚀 Setting up Frontend with Vite and Docker..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Frontend Environment Variables
VITE_AUTH_SERVICE_URL=http://localhost:3001
VITE_COMPANY_SERVICE_URL=http://localhost:3002
VITE_API_BASE_URL=http://localhost:3002

# Development settings
NODE_ENV=development
EOF
    echo "✅ Created .env file"
fi

# Build and run the development container
echo "🔨 Building frontend Docker image..."
docker build -f Dockerfile.dev -t ai-agent-frontend:dev .

if [ $? -eq 0 ]; then
    echo "✅ Docker image built successfully"
    echo ""
    echo "🎯 To start the development server:"
    echo "   docker run -it --rm -p 3000:3000 -v \$(pwd):/app ai-agent-frontend:dev"
    echo ""
    echo "🌐 Or use docker-compose from the root directory:"
    echo "   docker-compose up frontend"
    echo ""
    echo "📱 The application will be available at: http://localhost:3000"
else
    echo "❌ Failed to build Docker image"
    exit 1
fi
