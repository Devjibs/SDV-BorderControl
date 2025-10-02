# SDV Border Control Platform - API Documentation

## Overview

The SDV Border Control Platform provides a RESTful API for managing missions, telemetry data, and alerts. The API is built with .NET 8 and follows RESTful principles.

## Base URL

- Development: `http://localhost:5000`
- Production: `https://api.sdv-border-control.com`

## Authentication

Currently, the API uses a simple authentication mechanism. In production, this should be replaced with proper OAuth2/OIDC integration.

### Headers

```http
Content-Type: application/json
Authorization: Bearer <token>
```

## Endpoints

### Missions

#### Get All Missions
```http
GET /api/missions
```

**Response:**
```json
[
  {
    "missionId": "mission_001",
    "name": "Border Patrol Sector A",
    "startTime": "2025-01-15T08:00:00Z",
    "endTime": "2025-01-15T16:00:00Z",
    "vehicleIds": ["vehicle_001", "vehicle_002"],
    "status": "Active",
    "createdAt": "2025-01-15T07:30:00Z",
    "updatedAt": "2025-01-15T08:00:00Z"
  }
]
```

#### Get Mission by ID
```http
GET /api/missions/{missionId}
```

**Response:**
```json
{
  "missionId": "mission_001",
  "name": "Border Patrol Sector A",
  "startTime": "2025-01-15T08:00:00Z",
  "endTime": "2025-01-15T16:00:00Z",
  "vehicleIds": ["vehicle_001", "vehicle_002"],
  "status": "Active",
  "createdAt": "2025-01-15T07:30:00Z",
  "updatedAt": "2025-01-15T08:00:00Z"
}
```

#### Create Mission
```http
POST /api/missions
```

**Request Body:**
```json
{
  "name": "New Mission",
  "startTime": "2025-01-15T08:00:00Z",
  "endTime": "2025-01-15T16:00:00Z",
  "vehicleIds": ["vehicle_001", "vehicle_002"]
}
```

**Response:**
```json
{
  "missionId": "mission_002",
  "name": "New Mission",
  "startTime": "2025-01-15T08:00:00Z",
  "endTime": "2025-01-15T16:00:00Z",
  "vehicleIds": ["vehicle_001", "vehicle_002"],
  "status": "Pending",
  "createdAt": "2025-01-15T07:30:00Z",
  "updatedAt": "2025-01-15T07:30:00Z"
}
```

#### Update Mission
```http
PUT /api/missions/{missionId}
```

**Request Body:**
```json
{
  "name": "Updated Mission",
  "startTime": "2025-01-15T08:00:00Z",
  "endTime": "2025-01-15T16:00:00Z",
  "vehicleIds": ["vehicle_001", "vehicle_002", "vehicle_003"],
  "status": "Active"
}
```

#### Delete Mission
```http
DELETE /api/missions/{missionId}
```

**Response:** `204 No Content`

#### Get Missions by Vehicle
```http
GET /api/missions/vehicle/{vehicleId}
```

#### Update Mission Status
```http
PATCH /api/missions/{missionId}/status
```

**Request Body:**
```json
{
  "status": "Active"
}
```

### Telemetry

#### Get Telemetry Records
```http
GET /api/telemetry/{vehicleId}?limit=100
```

**Query Parameters:**
- `limit` (optional): Maximum number of records to return (default: 100)

**Response:**
```json
[
  {
    "id": 1,
    "vehicleId": "vehicle_001",
    "timestamp": "2025-01-15T10:30:00Z",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "speed": 45.5,
    "temperature": 22.3,
    "altitude": 150.0,
    "heading": 180.0,
    "additionalData": {
      "engineStatus": "running",
      "fuelLevel": 0.85,
      "batteryLevel": 0.92
    }
  }
]
```

#### Get Latest Telemetry
```http
GET /api/telemetry/{vehicleId}/latest
```

#### Add Telemetry Records
```http
POST /api/telemetry/{vehicleId}
```

**Request Body:**
```json
[
  {
    "timestamp": "2025-01-15T10:30:00Z",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "speed": 45.5,
    "temperature": 22.3,
    "altitude": 150.0,
    "heading": 180.0,
    "additionalData": {
      "engineStatus": "running",
      "fuelLevel": 0.85,
      "batteryLevel": 0.92
    }
  }
]
```

#### Get Telemetry by Time Range
```http
GET /api/telemetry/{vehicleId}/range?startTime=2025-01-15T08:00:00Z&endTime=2025-01-15T16:00:00Z
```

### Alerts

#### Get All Alerts
```http
GET /api/alerts
```

**Response:**
```json
[
  {
    "id": 1,
    "vehicleId": "vehicle_001",
    "type": "Overspeed",
    "message": "Vehicle speed 85.2 km/h exceeds limit",
    "severity": "High",
    "timestamp": "2025-01-15T10:35:00Z",
    "status": "Open",
    "acknowledgedAt": null,
    "acknowledgedBy": null,
    "resolvedAt": null,
    "resolvedBy": null,
    "additionalData": {}
  }
]
```

#### Get Active Alerts
```http
GET /api/alerts/active
```

#### Get Alerts by Vehicle
```http
GET /api/alerts/vehicle/{vehicleId}
```

#### Get Alert by ID
```http
GET /api/alerts/{alertId}
```

#### Create Alert
```http
POST /api/alerts
```

**Request Body:**
```json
{
  "vehicleId": "vehicle_001",
  "type": "Overspeed",
  "message": "Vehicle speed 85.2 km/h exceeds limit",
  "severity": "High",
  "additionalData": {
    "speed": 85.2,
    "limit": 80.0
  }
}
```

#### Acknowledge Alert
```http
PATCH /api/alerts/{alertId}/acknowledge
```

**Request Body:**
```json
{
  "acknowledgedBy": "operator_001"
}
```

#### Resolve Alert
```http
PATCH /api/alerts/{alertId}/resolve
```

**Request Body:**
```json
{
  "resolvedBy": "operator_001"
}
```

#### Get Alerts by Severity
```http
GET /api/alerts/severity/{severity}
```

**Severity Values:** `Low`, `Medium`, `High`, `Critical`

#### Get Alerts by Status
```http
GET /api/alerts/status/{status}
```

**Status Values:** `Open`, `Acknowledged`, `Resolved`

## WebSocket Endpoints

### Telemetry Hub
```http
ws://localhost:5000/telemetryHub
```

#### Join Vehicle Group
```javascript
connection.invoke("JoinVehicleGroup", "vehicle_001");
```

#### Join Dashboard Group
```javascript
connection.invoke("JoinDashboardGroup");
```

#### Receive Telemetry Updates
```javascript
connection.on("TelemetryUpdate", function (telemetry) {
    console.log("New telemetry:", telemetry);
});
```

#### Receive Alert Updates
```javascript
connection.on("AlertUpdate", function (alert) {
    console.log("New alert:", alert);
});
```

## Data Models

### Mission
```typescript
interface Mission {
  missionId: string;
  name: string;
  startTime: string; // ISO 8601
  endTime: string; // ISO 8601
  vehicleIds: string[];
  status: MissionStatus;
  createdAt: string; // ISO 8601
  updatedAt?: string; // ISO 8601
}

enum MissionStatus {
  Pending = "Pending",
  Active = "Active",
  Completed = "Completed",
  Cancelled = "Cancelled"
}
```

### TelemetryRecord
```typescript
interface TelemetryRecord {
  id: number;
  vehicleId: string;
  timestamp: string; // ISO 8601
  latitude: number;
  longitude: number;
  speed: number; // km/h
  temperature: number; // Celsius
  altitude: number; // meters
  heading: number; // degrees
  additionalData: { [key: string]: any };
}
```

### Alert
```typescript
interface Alert {
  id: number;
  vehicleId: string;
  type: string;
  message: string;
  severity: AlertSeverity;
  timestamp: string; // ISO 8601
  status: AlertStatus;
  acknowledgedAt?: string; // ISO 8601
  acknowledgedBy?: string;
  resolvedAt?: string; // ISO 8601
  resolvedBy?: string;
  additionalData: { [key: string]: any };
}

enum AlertSeverity {
  Low = "Low",
  Medium = "Medium",
  High = "High",
  Critical = "Critical"
}

enum AlertStatus {
  Open = "Open",
  Acknowledged = "Acknowledged",
  Resolved = "Resolved"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "traceId": "0HMQ8VJJA7U1P:00000001",
  "errors": {
    "Name": ["The Name field is required."]
  }
}
```

### 404 Not Found
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.4",
  "title": "Not Found",
  "status": 404,
  "traceId": "0HMQ8VJJA7U1P:00000002"
}
```

### 500 Internal Server Error
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.6.1",
  "title": "An error occurred while processing your request.",
  "status": 500,
  "traceId": "0HMQ8VJJA7U1P:00000003"
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **General endpoints**: 100 requests per minute per IP
- **Telemetry endpoints**: 1000 requests per minute per IP
- **WebSocket connections**: 10 concurrent connections per IP

## CORS Configuration

The API is configured to allow cross-origin requests from:

- `http://localhost:4200` (Development frontend)
- `https://sdv-border-control.com` (Production frontend)

## Examples

### Creating a Mission with cURL

```bash
curl -X POST "http://localhost:5000/api/missions" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Border Patrol Sector A",
    "startTime": "2025-01-15T08:00:00Z",
    "endTime": "2025-01-15T16:00:00Z",
    "vehicleIds": ["vehicle_001", "vehicle_002"]
  }'
```

### Sending Telemetry Data

```bash
curl -X POST "http://localhost:5000/api/telemetry/vehicle_001" \
  -H "Content-Type: application/json" \
  -d '[
    {
      "timestamp": "2025-01-15T10:30:00Z",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "speed": 45.5,
      "temperature": 22.3,
      "altitude": 150.0,
      "heading": 180.0,
      "additionalData": {
        "engineStatus": "running",
        "fuelLevel": 0.85,
        "batteryLevel": 0.92
      }
    }
  ]'
```

### JavaScript WebSocket Connection

```javascript
const connection = new signalR.HubConnectionBuilder()
    .withUrl("http://localhost:5000/telemetryHub")
    .build();

connection.start().then(function () {
    console.log("Connected to telemetry hub");
    
    // Join vehicle group
    connection.invoke("JoinVehicleGroup", "vehicle_001");
    
    // Join dashboard group
    connection.invoke("JoinDashboardGroup");
}).catch(function (err) {
    console.error("Connection failed:", err);
});

// Listen for telemetry updates
connection.on("TelemetryUpdate", function (telemetry) {
    console.log("Telemetry update:", telemetry);
    // Update UI with new telemetry data
});

// Listen for alert updates
connection.on("AlertUpdate", function (alert) {
    console.log("Alert update:", alert);
    // Show alert notification
});
```

## SDKs and Libraries

### .NET Client
```csharp
// Install NuGet package
Install-Package Microsoft.AspNetCore.SignalR.Client

// Usage
var connection = new HubConnectionBuilder()
    .WithUrl("http://localhost:5000/telemetryHub")
    .Build();

await connection.StartAsync();
```

### JavaScript Client
```javascript
// Install npm package
npm install @microsoft/signalr

// Usage
import * as signalR from "@microsoft/signalr";
```

### Python Client
```python
# Install pip package
pip install requests

# Usage
import requests

response = requests.post(
    "http://localhost:5000/api/telemetry/vehicle_001",
    json=[{
        "timestamp": "2025-01-15T10:30:00Z",
        "latitude": 40.7128,
        "longitude": -74.0060,
        "speed": 45.5,
        "temperature": 22.3,
        "altitude": 150.0,
        "heading": 180.0
    }]
)
```

## Testing

### Swagger UI
Access the interactive API documentation at:
- Development: http://localhost:5000/swagger
- Production: https://api.sdv-border-control.com/swagger

### Postman Collection
A Postman collection is available in the `docs/postman/` directory with pre-configured requests for all endpoints.

### Unit Tests
Run the test suite:
```bash
dotnet test server/Tests/
```

## Support

For API support and questions:
- GitHub Issues: [Repository Issues](https://github.com/your-org/sdv-border-control/issues)
- Documentation: [Project Wiki](https://github.com/your-org/sdv-border-control/wiki)
- Contact: [API Team](mailto:api-support@your-org.com)

