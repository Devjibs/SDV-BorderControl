# SDV Border Control Platform - Architecture Documentation

## Overview

The SDV Border Control Platform is a comprehensive software-defined vehicle (SDV) system designed for border control operations. It provides mission management, real-time telemetry tracking, and alert management capabilities.

## System Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │  Edge Simulator │
│   (Angular)     │◄──►│   (.NET 8)      │◄──►│   (Python)      │
│                 │    │                 │    │                 │
│ - Dashboard     │    │ - Missions      │    │ - Vehicle Data  │
│ - Missions      │    │ - Telemetry     │    │ - Alert Gen     │
│ - Alerts        │    │ - Alerts        │    │ - Mission Sync  │
│ - Vehicle Map   │    │ - WebSocket     │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   WebSocket     │    │   Database      │    │   File System   │
│   Real-time     │    │   (SQLite)      │    │   (Logs)        │
│   Updates       │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Component Architecture

### Backend API (.NET 8)

#### Core Components

1. **Controllers**
   - `MissionsController`: Mission CRUD operations
   - `TelemetryController`: Telemetry data management
   - `AlertsController`: Alert management

2. **Services**
   - `MissionService`: Business logic for missions
   - `TelemetryService`: Telemetry data processing
   - `AlertService`: Alert processing and management

3. **Data Layer**
   - `ApplicationDbContext`: Entity Framework context
   - Models: `Mission`, `TelemetryRecord`, `Alert`, `Vehicle`

4. **Real-time Communication**
   - `TelemetryHub`: SignalR hub for real-time updates
   - WebSocket connections for live data streaming

#### Technology Stack
- **Framework**: .NET 8 Web API
- **Database**: SQLite (development), SQL Server/PostgreSQL (production)
- **ORM**: Entity Framework Core
- **Real-time**: SignalR
- **Authentication**: JWT (planned)
- **Documentation**: Swagger/OpenAPI

### Frontend (Angular 17)

#### Component Structure

```
src/app/
├── components/
│   ├── dashboard/          # Main dashboard
│   ├── missions/           # Mission management
│   ├── alerts/            # Alert management
│   ├── vehicle-detail/    # Vehicle information
│   ├── vehicle-map/       # Interactive map
│   ├── mission-form/      # Mission creation/editing
│   └── navigation/        # Navigation component
├── services/
│   ├── api.service.ts     # HTTP API client
│   └── websocket.service.ts # WebSocket client
├── models/                # TypeScript interfaces
└── app.module.ts         # Main module
```

#### Technology Stack
- **Framework**: Angular 17
- **UI Library**: Angular Material
- **Maps**: Leaflet
- **Real-time**: SignalR client
- **State Management**: RxJS
- **Styling**: SCSS

### Edge Simulator (Python)

#### Components

1. **TelemetryGenerator**
   - Generates realistic vehicle movement patterns
   - Simulates sensor data (GPS, speed, temperature)
   - Patrol pattern simulation

2. **AlertGenerator**
   - Threshold-based alert generation
   - Random alert simulation
   - Alert severity classification

3. **EdgeSimulator**
   - Main simulation orchestrator
   - API communication
   - Mission synchronization

#### Technology Stack
- **Language**: Python 3.11
- **HTTP Client**: Requests
- **Math**: NumPy
- **Geographic**: Geopy
- **Configuration**: python-dotenv

## Data Flow

### Mission Management Flow

```
1. Operator creates mission via UI
2. Frontend sends POST /api/missions
3. Backend validates and stores mission
4. Mission assigned to vehicles
5. Edge simulator polls for missions
6. Vehicles execute mission tasks
7. Real-time updates via WebSocket
```

### Telemetry Flow

```
1. Edge simulator generates telemetry data
2. POST /api/telemetry/{vehicleId} with batch data
3. Backend stores telemetry records
4. SignalR hub broadcasts updates
5. Frontend receives real-time updates
6. Dashboard and maps update automatically
```

### Alert Flow

```
1. Edge simulator detects threshold breach
2. POST /api/alerts with alert data
3. Backend stores and processes alert
4. SignalR hub broadcasts alert
5. Frontend shows alert notification
6. Operator acknowledges/resolves alert
7. Alert status updated in real-time
```

## Database Schema

### Missions Table
```sql
CREATE TABLE Missions (
    MissionId TEXT PRIMARY KEY,
    Name TEXT NOT NULL,
    StartTime DATETIME NOT NULL,
    EndTime DATETIME NOT NULL,
    VehicleIds TEXT NOT NULL, -- JSON array
    Status INTEGER NOT NULL,
    CreatedAt DATETIME NOT NULL,
    UpdatedAt DATETIME
);
```

### TelemetryRecords Table
```sql
CREATE TABLE TelemetryRecords (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    VehicleId TEXT NOT NULL,
    Timestamp DATETIME NOT NULL,
    Latitude REAL NOT NULL,
    Longitude REAL NOT NULL,
    Speed REAL NOT NULL,
    Temperature REAL NOT NULL,
    Altitude REAL NOT NULL,
    Heading REAL NOT NULL,
    AdditionalData TEXT -- JSON object
);

CREATE INDEX IX_TelemetryRecords_VehicleId_Timestamp 
ON TelemetryRecords (VehicleId, Timestamp);
```

### Alerts Table
```sql
CREATE TABLE Alerts (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    VehicleId TEXT NOT NULL,
    Type TEXT NOT NULL,
    Message TEXT NOT NULL,
    Severity INTEGER NOT NULL,
    Timestamp DATETIME NOT NULL,
    Status INTEGER NOT NULL,
    AcknowledgedAt DATETIME,
    AcknowledgedBy TEXT,
    ResolvedAt DATETIME,
    ResolvedBy TEXT,
    AdditionalData TEXT -- JSON object
);

CREATE INDEX IX_Alerts_VehicleId_Status 
ON Alerts (VehicleId, Status);
```

## Security Architecture

### Authentication & Authorization

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │    │   Backend API   │
│                 │    │                 │    │                 │
│ - JWT Token     │───►│ - Token         │───►│ - JWT           │
│ - Role-based    │    │ - Validation    │    │ - Validation    │
│ - Permissions   │    │ - Rate Limiting │    │ - Authorization │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Security Measures

1. **Input Validation**
   - Model validation attributes
   - SQL injection prevention
   - XSS protection

2. **Authentication**
   - JWT token-based authentication
   - Role-based access control
   - Session management

3. **Authorization**
   - Endpoint-level authorization
   - Resource-based permissions
   - Operation-level controls

4. **Data Protection**
   - HTTPS/TLS encryption
   - Data encryption at rest
   - Secure communication

## Deployment Architecture

### Development Environment

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │  Edge Simulator │
│   (Port 4200)   │    │   (Port 5000)   │    │   (Local)       │
│                 │    │                 │    │                 │
│ - Angular CLI   │    │ - .NET CLI      │    │ - Python        │
│ - Hot Reload    │    │ - Hot Reload    │    │ - Script        │
│ - Dev Server    │    │ - Dev Server    │    │ - Manual Run    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Production Environment

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │   API Gateway   │    │   Database      │
│                 │    │                 │    │                 │
│ - Nginx         │    │ - Rate Limiting │    │ - SQL Server    │
│ - SSL/TLS       │    │ - Authentication│    │ - Backup        │
│ - Caching       │    │ - Monitoring    │    │ - Replication   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Monitoring    │
│   (Docker)      │    │   (Docker)      │    │                 │
│                 │    │                 │    │ - Prometheus    │
│ - Static Files  │    │ - Microservices │    │ - Grafana       │
│ - CDN           │    │ - Auto-scaling  │    │ - Logs          │
│ - PWA           │    │ - Health Checks │    │ - Alerts        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Scalability Considerations

### Horizontal Scaling

1. **API Scaling**
   - Load balancer distribution
   - Stateless API design
   - Database connection pooling

2. **Database Scaling**
   - Read replicas
   - Database sharding
   - Caching layers

3. **Frontend Scaling**
   - CDN distribution
   - Static file optimization
   - Progressive Web App

### Vertical Scaling

1. **Resource Allocation**
   - CPU and memory limits
   - Auto-scaling policies
   - Performance monitoring

2. **Optimization**
   - Database indexing
   - Query optimization
   - Caching strategies

## Monitoring & Observability

### Metrics Collection

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Application   │    │   Infrastructure│    │   Business      │
│   Metrics       │    │   Metrics       │    │   Metrics       │
│                 │    │                 │    │                 │
│ - Response Time │    │ - CPU Usage     │    │ - Mission Count │
│ - Error Rate    │    │ - Memory Usage  │    │ - Alert Volume  │
│ - Throughput    │    │ - Disk Usage    │    │ - Vehicle Count │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 ▼
                    ┌─────────────────┐
                    │   Monitoring    │
                    │   Dashboard     │
                    │                 │
                    │ - Prometheus    │
                    │ - Grafana       │
                    │ - Alerting      │
                    └─────────────────┘
```

### Logging Strategy

1. **Application Logs**
   - Structured logging (JSON)
   - Log levels (Debug, Info, Warn, Error)
   - Correlation IDs

2. **Audit Logs**
   - User actions
   - Data changes
   - Security events

3. **Performance Logs**
   - Request/response times
   - Database query performance
   - Memory usage

## Integration Points

### External Systems

1. **Authentication Provider**
   - Azure AD integration
   - OAuth2/OIDC flows
   - Single sign-on (SSO)

2. **Geographic Services**
   - Map tile services
   - Geocoding services
   - Route optimization

3. **Communication Systems**
   - SMS notifications
   - Email alerts
   - Push notifications

### API Integrations

1. **REST APIs**
   - Standard HTTP methods
   - JSON data format
   - RESTful design principles

2. **WebSocket APIs**
   - Real-time communication
   - Bidirectional data flow
   - Connection management

3. **GraphQL APIs** (Future)
   - Flexible data querying
   - Reduced over-fetching
   - Type-safe operations

## Future Architecture Considerations

### Microservices Migration

```
Current Monolith → Microservices Architecture

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mission        │    │   Telemetry     │    │   Alert         │
│   Service        │    │   Service       │    │   Service       │
│                 │    │                 │    │                 │
│ - Mission API   │    │ - Telemetry API │    │ - Alert API     │
│ - Mission DB    │    │ - Telemetry DB  │    │ - Alert DB      │
│ - Mission Logic │    │ - Telemetry     │    │ - Alert Logic   │
│                 │    │   Processing    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Event-Driven Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Event         │    │   Message       │    │   Event         │
│   Producers     │    │   Broker        │    │   Consumers     │
│                 │    │                 │    │                 │
│ - Mission       │───►│ - Apache Kafka  │◄───│ - Notification  │
│   Events        │    │ - RabbitMQ      │    │   Service       │
│ - Telemetry    │    │ - Azure Service │    │ - Analytics     │
│   Events        │    │   Bus           │    │   Service       │
│ - Alert Events  │    │                 │    │ - Audit Service │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Cloud-Native Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Kubernetes    │    │   Service       │    │   Data          │
│   Cluster       │    │   Mesh          │    │   Platform      │
│                 │    │                 │    │                 │
│ - Pods          │    │ - Istio         │    │ - Data Lake     │
│ - Services      │    │ - Envoy Proxy   │    │ - Data Warehouse│
│ - Ingress       │    │ - Traffic Mgmt  │    │ - Data Pipeline │
│ - ConfigMaps    │    │ - Security      │    │ - ML Platform   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Technology Decisions

### Backend Technology Choices

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Framework | .NET 8 | Performance, ecosystem, team expertise |
| Database | SQLite → SQL Server | Development simplicity → Production scalability |
| ORM | Entity Framework Core | Code-first approach, migrations |
| Real-time | SignalR | Native .NET solution, WebSocket support |
| Authentication | JWT | Stateless, scalable, industry standard |

### Frontend Technology Choices

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Framework | Angular 17 | Enterprise-grade, TypeScript, ecosystem |
| UI Library | Angular Material | Consistent design, accessibility |
| Maps | Leaflet | Open-source, lightweight, customizable |
| State Management | RxJS | Reactive programming, built-in |
| Styling | SCSS | CSS preprocessing, maintainability |

### Infrastructure Technology Choices

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Containerization | Docker | Portability, consistency |
| Orchestration | Docker Compose | Development simplicity |
| CI/CD | GitHub Actions | Native integration, cost-effective |
| Monitoring | Prometheus + Grafana | Open-source, comprehensive |
| Logging | Structured Logging | Debugging, auditing, compliance |

## Performance Characteristics

### Expected Performance Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| API Response Time | < 200ms | 95th percentile |
| WebSocket Latency | < 50ms | Real-time updates |
| Database Query Time | < 100ms | 95th percentile |
| Frontend Load Time | < 3s | Initial page load |
| Concurrent Users | 100+ | Simultaneous users |
| Data Throughput | 1000+ req/s | API requests per second |

### Scalability Targets

| Component | Current | Target | Strategy |
|-----------|---------|--------|----------|
| API Instances | 1 | 10+ | Horizontal scaling |
| Database Connections | 100 | 1000+ | Connection pooling |
| WebSocket Connections | 50 | 500+ | Load balancing |
| Data Volume | 1GB | 100GB+ | Database optimization |
| Concurrent Missions | 10 | 100+ | Resource optimization |

## Security Considerations

### Threat Model

1. **External Threats**
   - DDoS attacks
   - SQL injection
   - XSS attacks
   - Man-in-the-middle

2. **Internal Threats**
   - Privilege escalation
   - Data exfiltration
   - Insider threats
   - Configuration errors

### Security Controls

1. **Network Security**
   - HTTPS/TLS encryption
   - Firewall rules
   - Network segmentation
   - VPN access

2. **Application Security**
   - Input validation
   - Authentication
   - Authorization
   - Secure coding practices

3. **Data Security**
   - Encryption at rest
   - Encryption in transit
   - Data classification
   - Access controls

## Compliance & Governance

### Regulatory Compliance

1. **Data Protection**
   - GDPR compliance
   - Data retention policies
   - Privacy controls
   - Consent management

2. **Security Standards**
   - ISO 27001
   - SOC 2 Type II
   - NIST Cybersecurity Framework
   - OWASP Top 10

3. **Operational Compliance**
   - Audit logging
   - Change management
   - Incident response
   - Business continuity

### Governance Framework

1. **Development Governance**
   - Code review process
   - Security scanning
   - Dependency management
   - Version control

2. **Operational Governance**
   - Monitoring and alerting
   - Incident management
   - Capacity planning
   - Disaster recovery

3. **Data Governance**
   - Data classification
   - Data lineage
   - Data quality
   - Data lifecycle management

This architecture documentation provides a comprehensive overview of the SDV Border Control Platform's design, implementation, and future considerations. It serves as a guide for developers, architects, and stakeholders to understand the system's structure and capabilities.

