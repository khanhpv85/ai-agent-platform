#!/bin/bash

# AI Agent Platform Setup Script
# This script helps you set up the AI Agent Platform

set -e

echo "🚀 AI Agent Platform Setup"
echo "=========================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "⚠️  Please edit .env file with your configuration before starting the platform"
    echo "   - Add your API keys for AI services"
    echo "   - Configure database passwords"
    echo "   - Set up external service credentials"
    echo ""
    echo "Press Enter to continue after editing .env file..."
    read
else
    echo "✅ .env file already exists"
fi

# Build and start services
echo "🔨 Building and starting services..."
docker-compose build

echo "🚀 Starting the platform..."
docker-compose up -d

echo ""
echo "🎉 AI Agent Platform is starting up!"
echo ""
echo "📋 Service URLs:"
echo "   - Frontend: http://localhost:3000"
echo "   - API Gateway: http://localhost:80"
echo "   - Auth Service Docs: http://localhost:3000/docs"
echo "   - AI Service Docs: http://localhost:8000/docs"
echo ""
echo "📊 Monitor services:"
echo "   docker-compose logs -f"
echo ""
echo "🛑 Stop services:"
echo "   docker-compose down"
echo ""
echo "🔄 Restart services:"
echo "   docker-compose restart"
echo ""
echo "📚 Documentation: README.md"
echo ""
echo "Happy building! 🎯"
