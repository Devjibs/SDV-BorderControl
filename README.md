# SDV Border Control Platform

A comprehensive Software-Defined Vehicle (SDV) platform designed for border control operations, featuring advanced mission management, real-time vehicle telemetry, and intelligent alert systems.

## Architecture Overview

- **Backend**: .NET 8 Web API with Entity Framework Core and SQLite
- **Frontend**: Angular 17 with Angular Material Design
- **Real-time Communication**: SignalR for live telemetry updates
- **Edge Simulator**: Python-based vehicle data simulator
- **API Documentation**: Swagger/OpenAPI integration
- **Deployment**: Docker containerization with docker-compose

## Core Features

### Mission Management
- **Complete CRUD Operations**: Create, read, update, and delete missions
- **Vehicle Assignment**: Assign multiple vehicles to missions
- **Status Tracking**: Real-time mission status updates (Pending, Active, Completed, Cancelled)
- **Mission Planning**: Schedule missions with start/end times
- **Mission History**: Track mission lifecycle and changes

### Vehicle Management
- **Vehicle Registry**: Comprehensive vehicle database
- **Real-time Tracking**: Live vehicle position and status monitoring
- **Telemetry Data**: Speed, temperature, fuel level, GPS coordinates
- **Vehicle Status**: Online/Offline status tracking
- **Vehicle Types**: Support for different vehicle categories (Patrol, Surveillance, etc.)

### Alert System
- **Intelligent Alerts**: Automated alert generation based on telemetry thresholds
- **Alert Categories**: Speed violations, temperature alerts, fuel warnings, etc.
- **Alert Management**: Acknowledge, resolve, and track alert status
- **Real-time Notifications**: Instant alert delivery via SignalR

### Dashboard & Analytics
- **Interactive Dashboard**: Real-time overview of system status
- **Mission Analytics**: Mission performance and completion statistics
- **Vehicle Analytics**: Vehicle utilization and performance metrics
- **Alert Analytics**: Alert trends and resolution statistics
- **Interactive Maps**: Visual vehicle tracking and mission planning

### Real-time Features
- **Live Telemetry**: Real-time vehicle data streaming
- **WebSocket Communication**: Low-latency data updates
- **Auto-refresh**: Automatic UI updates without page refresh
- **Status Indicators**: Live status indicators throughout the application

## Quick Start Guide

### Prerequisites
- Docker and Docker Compose
- .NET 8 SDK (for local development)
- Node.js 18+ and npm (for frontend development)
- Python 3.8+ (for edge simulator)

### Option 1: Docker Deployment (Recommended)
```bash
# Clone the repository
git clone <repository-url>
cd SDV-BorderControl

# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost:4200
# Backend API: http://localhost:5001
# Swagger Documentation: http://localhost:5001/swagger
```

### Option 2: Local Development
```bash
# Backend
cd server
dotnet restore
dotnet run

# Frontend (new terminal)
cd client
npm install
npm start

# Edge Simulator (new terminal)
cd edge-simulator
pip install -r requirements.txt
python simulate.py --mission test_mission --server http://localhost:5001 --vehicle-id VEH001
```

## API Documentation

The backend API is fully documented with Swagger/OpenAPI. Access the interactive documentation at:
- **Swagger UI**: http://localhost:5001/swagger
- **OpenAPI JSON**: http://localhost:5001/swagger/v1/swagger.json

### Key API Endpoints

#### Missions
- `GET /api/missions` - Get all missions
- `POST /api/missions` - Create new mission
- `PUT /api/missions/{id}` - Update mission
- `DELETE /api/missions/{id}` - Delete mission
- `PUT /api/missions/{id}/status` - Update mission status

#### Vehicles
- `GET /api/vehicles` - Get all vehicles
- `POST /api/vehicles` - Create new vehicle
- `PUT /api/vehicles/{id}` - Update vehicle
- `DELETE /api/vehicles/{id}` - Delete vehicle

#### Telemetry
- `GET /api/telemetry` - Get telemetry data
- `GET /api/telemetry/{vehicleId}` - Get vehicle telemetry

#### Alerts
- `GET /api/alerts` - Get all alerts
- `PUT /api/alerts/{id}/acknowledge` - Acknowledge alert
- `PUT /api/alerts/{id}/resolve` - Resolve alert

## Project Structure

```
SDV-BorderControl/
├── server/                     # .NET 8 Web API Backend
│   ├── Controllers/           # API Controllers
│   ├── Services/              # Business Logic Services
│   ├── Models/                # Data Models and DTOs
│   ├── Data/                  # Entity Framework Context
│   ├── Hubs/                  # SignalR Hubs
│   └── Tests/                 # Unit Tests
├── client/                     # Angular 17 Frontend
│   ├── src/app/
│   │   ├── components/        # Angular Components
│   │   ├── services/          # Angular Services
│   │   ├── models/            # TypeScript Models
│   │   └── shared/            # Shared Utilities
│   └── src/assets/            # Static Assets
├── edge-simulator/             # Python Vehicle Simulator
│   ├── simulate.py            # Main simulator script
│   └── requirements.txt       # Python dependencies
├── docker/                     # Docker Configuration
├── scripts/                    # Utility Scripts
└── docs/                      # Documentation
```

## Frontend Application

### Navigation Structure
- **Dashboard**: Overview of system status and key metrics
- **Missions**: Mission management and vehicle assignment
- **Vehicles**: Vehicle registry and real-time tracking
- **Alerts**: Alert management and resolution
- **Analytics**: Performance metrics and reporting

### Key Components

#### Mission Manager
- Mission creation and editing with vehicle assignment
- Real-time status updates
- Mission history and tracking
- Bulk operations support

#### Vehicle Dashboard
- Real-time vehicle status monitoring
- Telemetry data visualization
- Vehicle performance metrics
- Interactive vehicle selection

#### Alert Center
- Real-time alert notifications
- Alert categorization and filtering
- Alert resolution workflow
- Alert history and analytics

## Development Guidelines

### Backend Development
- Follow SOLID principles and clean architecture
- Use dependency injection for all services
- Implement proper error handling and logging
- Write comprehensive unit tests
- Follow RESTful API design patterns

### Frontend Development
- Use Angular Material for consistent UI
- Implement reactive forms with validation
- Follow Angular best practices and style guide
- Use TypeScript strict mode
- Implement proper error handling

### Testing
- Backend: xUnit for unit tests
- Frontend: Jasmine/Karma for unit tests
- Integration tests for API endpoints
- End-to-end testing with Cypress (planned)

## Configuration

### Environment Variables
- `ASPNETCORE_ENVIRONMENT`: Development/Production
- `ConnectionStrings__DefaultConnection`: Database connection string
- `CORS__AllowedOrigins`: CORS configuration
- `SignalR__HubUrl`: SignalR hub URL

### Database
- SQLite database for development
- Entity Framework Core migrations
- Automatic database creation on startup
- Seed data for testing

## Troubleshooting

### Common Issues
1. **Port Conflicts**: Ensure ports 4200, 5001 are available
2. **Database Issues**: Delete `server/data.db` to reset database
3. **CORS Errors**: Check CORS configuration in `Program.cs`
4. **SignalR Connection**: Verify SignalR hub configuration

### Debug Mode
- Backend: Set `ASPNETCORE_ENVIRONMENT=Development`
- Frontend: Use `ng serve` with source maps
- Enable detailed logging in `appsettings.Development.json`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Check the documentation in the `/docs` folder
- Review the API documentation at `/swagger`

