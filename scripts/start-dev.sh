#!/bin/bash

# SDV Border Control Platform - Development Startup Script

echo "🚀 Starting SDV Border Control Platform Development Environment"
echo "================================================================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose and try again."
    exit 1
fi

echo "✅ Docker and Docker Compose are available"

# Create data directory if it doesn't exist
mkdir -p data

echo "📁 Created data directory"

# Start the services
echo "🐳 Starting services with Docker Compose..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if API is responding
echo "🔍 Checking API health..."
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
    if curl -s http://localhost:5000/health > /dev/null 2>&1; then
        echo "✅ API is ready"
        break
    fi
    
    if [ $attempt -eq $max_attempts ]; then
        echo "❌ API failed to start after $max_attempts attempts"
        echo "📋 Checking logs..."
        docker-compose logs api
        exit 1
    fi
    
    echo "⏳ Attempt $attempt/$max_attempts - API not ready yet..."
    sleep 2
    ((attempt++))
done

# Check if frontend is responding
echo "🔍 Checking frontend health..."
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
    if curl -s http://localhost:4200 > /dev/null 2>&1; then
        echo "✅ Frontend is ready"
        break
    fi
    
    if [ $attempt -eq $max_attempts ]; then
        echo "❌ Frontend failed to start after $max_attempts attempts"
        echo "📋 Checking logs..."
        docker-compose logs client
        exit 1
    fi
    
    echo "⏳ Attempt $attempt/$max_attempts - Frontend not ready yet..."
    sleep 2
    ((attempt++))
done

echo ""
echo "🎉 SDV Border Control Platform is ready!"
echo "========================================"
echo ""
echo "📱 Frontend: http://localhost:4200"
echo "🔧 API: http://localhost:5000"
echo "📚 API Documentation: http://localhost:5000/swagger"
echo ""
echo "🚗 To start the edge simulator:"
echo "   python edge-simulator/simulate.py --mission mission_001 --server http://localhost:5000"
echo ""
echo "📋 To view logs:"
echo "   docker-compose logs -f"
echo ""
echo "🛑 To stop the platform:"
echo "   docker-compose down"
echo ""
echo "Happy coding! 🚀"

