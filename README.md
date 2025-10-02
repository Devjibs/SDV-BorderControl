# SDV Border-Control Platform

A Software-Defined Vehicle (SDV) platform for border control operations, featuring mission management, real-time telemetry, and vehicle tracking capabilities.

## Architecture

- **Backend**: .NET 8 Web API with SQLite database
- **Frontend**: Angular 17 with Angular Material
- **Edge Simulator**: Python script for mock vehicle data
- **Real-time**: WebSocket/SSE for live telemetry updates
- **Deployment**: Docker containers with docker-compose

## Features

- Mission CRUD operations
- Real-time vehicle telemetry tracking
- Alert management system
- Interactive map with vehicle positions
- Responsive dashboard
- Mock authentication system
- Comprehensive testing suite

## Quick Start

1. Clone the repository
2. Run `docker-compose up` to start all services
3. Navigate to `http://localhost:4200` for the frontend
4. Run the edge simulator: `python edge-simulator/simulate.py --mission mission1 --server http://localhost:5000`

## Project Structure

```
SDV-BorderControl/
├── server/                 # .NET 8 Web API
├── client/                 # Angular frontend
├── edge-simulator/         # Python vehicle simulator
├── docker/                 # Docker configuration
├── sample-data/           # Mock data and test fixtures
└── docs/                  # Documentation
```

## Development

See individual component README files for detailed setup instructions.

## Future Extensions

- OIDC/Azure AD integration
- Kubernetes deployment
- Predictive analytics
- Multi-language support
- Advanced compliance auditing

