#!/bin/bash

# SDV Border Control Platform - Setup Script

echo "🛠️  Setting up SDV Border Control Platform"
echo "=========================================="

# Check if required tools are installed
echo "🔍 Checking prerequisites..."

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker and try again."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose and try again."
    echo "   Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.11+ and try again."
    echo "   Visit: https://www.python.org/downloads/"
    exit 1
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check .NET
if ! command -v dotnet &> /dev/null; then
    echo "❌ .NET 8 SDK is not installed. Please install .NET 8 SDK and try again."
    echo "   Visit: https://dotnet.microsoft.com/download"
    exit 1
fi

echo "✅ All prerequisites are installed"

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p data
mkdir -p logs
mkdir -p scripts

# Set up Python virtual environment for edge simulator
echo "🐍 Setting up Python environment..."
cd edge-simulator
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt
cd ..

# Set up .NET dependencies
echo "🔧 Setting up .NET dependencies..."
cd server
dotnet restore
cd ..

# Set up Node.js dependencies
echo "📦 Setting up Node.js dependencies..."
cd client
npm install
cd ..

# Create sample data
echo "📊 Creating sample data..."
if [ ! -f "data/sample-missions.json" ]; then
    cp sample-data/sample-missions.json data/
fi
if [ ! -f "data/sample-telemetry.json" ]; then
    cp sample-data/sample-telemetry.json data/
fi
if [ ! -f "data/sample-alerts.json" ]; then
    cp sample-data/sample-alerts.json data/
fi

# Set up environment variables
echo "⚙️  Setting up environment variables..."
if [ ! -f ".env" ]; then
    cat > .env << EOF
# SDV Border Control Platform Environment Variables

# API Configuration
API_URL=http://localhost:5000
ASPNETCORE_ENVIRONMENT=Development

# Database Configuration
ConnectionStrings__DefaultConnection=Data Source=./data/sdv.db

# Frontend Configuration
REACT_APP_API_URL=http://localhost:5000

# Logging Configuration
LOG_LEVEL=Information

# Security Configuration
JWT_SECRET=your-secret-key-here
JWT_ISSUER=SDV-BorderControl
JWT_AUDIENCE=SDV-BorderControl-Users

# Monitoring Configuration
ENABLE_METRICS=true
METRICS_PORT=9090
EOF
    echo "✅ Created .env file"
else
    echo "✅ .env file already exists"
fi

# Make scripts executable
echo "🔧 Making scripts executable..."
chmod +x scripts/*.sh

# Build Docker images
echo "🐳 Building Docker images..."
docker-compose build

echo ""
echo "🎉 Setup completed successfully!"
echo "==============================="
echo ""
echo "📋 Next steps:"
echo "1. Start the platform: ./scripts/start-dev.sh"
echo "2. Run the edge simulator: ./scripts/run-simulator.sh"
echo "3. Access the frontend: http://localhost:4200"
echo "4. Access the API: http://localhost:5000"
echo "5. View API documentation: http://localhost:5000/swagger"
echo ""
echo "📚 Documentation:"
echo "- Architecture: docs/ARCHITECTURE.md"
echo "- API Reference: docs/API.md"
echo "- Deployment Guide: docs/DEPLOYMENT.md"
echo ""
echo "🛠️  Development commands:"
echo "- Start platform: docker-compose up -d"
echo "- Stop platform: docker-compose down"
echo "- View logs: docker-compose logs -f"
echo "- Run tests: dotnet test server/Tests/"
echo "- Run frontend tests: cd client && npm test"
echo ""
echo "Happy coding! 🚀"

