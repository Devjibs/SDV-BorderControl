#!/bin/bash

# SDV Border Control Platform - Edge Simulator Runner

echo "🚗 Starting SDV Edge Simulator"
echo "==============================="

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.11+ and try again."
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "edge-simulator/venv" ]; then
    echo "📦 Creating Python virtual environment..."
    cd edge-simulator
    python3 -m venv venv
    cd ..
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source edge-simulator/venv/bin/activate

# Install dependencies
echo "📦 Installing dependencies..."
cd edge-simulator
pip install -r requirements.txt
cd ..

# Default parameters
MISSION_ID="mission_001"
SERVER_URL="http://localhost:5000"
DURATION=60
INTERVAL=1.0
LAT=40.7128
LON=-74.0060

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --mission)
            MISSION_ID="$2"
            shift 2
            ;;
        --server)
            SERVER_URL="$2"
            shift 2
            ;;
        --duration)
            DURATION="$2"
            shift 2
            ;;
        --interval)
            INTERVAL="$2"
            shift 2
            ;;
        --lat)
            LAT="$2"
            shift 2
            ;;
        --lon)
            LON="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --mission ID      Mission ID to simulate (default: mission_001)"
            echo "  --server URL       API server URL (default: http://localhost:5000)"
            echo "  --duration MIN     Simulation duration in minutes (default: 60)"
            echo "  --interval SEC     Telemetry interval in seconds (default: 1.0)"
            echo "  --lat LATITUDE     Starting latitude (default: 40.7128)"
            echo "  --lon LONGITUDE    Starting longitude (default: -74.0060)"
            echo "  --help             Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

echo "🎯 Configuration:"
echo "   Mission ID: $MISSION_ID"
echo "   Server URL: $SERVER_URL"
echo "   Duration: $DURATION minutes"
echo "   Interval: $INTERVAL seconds"
echo "   Location: $LAT, $LON"
echo ""

# Check if API server is running
echo "🔍 Checking API server..."
if ! curl -s "$SERVER_URL/health" > /dev/null 2>&1; then
    echo "❌ API server is not responding at $SERVER_URL"
    echo "   Please make sure the API server is running:"
    echo "   docker-compose up -d"
    exit 1
fi

echo "✅ API server is responding"

# Start the simulator
echo "🚀 Starting edge simulator..."
cd edge-simulator
python simulate.py \
    --mission "$MISSION_ID" \
    --server "$SERVER_URL" \
    --duration "$DURATION" \
    --interval "$INTERVAL" \
    --lat "$LAT" \
    --lon "$LON"

echo ""
echo "🏁 Edge simulator finished"

