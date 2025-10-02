# SDV Border Control Platform - Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the SDV Border Control Platform in various environments.

## Prerequisites

- Docker and Docker Compose
- .NET 8 SDK (for local development)
- Node.js 18+ (for local development)
- Python 3.11+ (for edge simulator)

## Quick Start

### Using Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SDV-BorderControl
   ```

2. **Start all services**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:4200
   - API: http://localhost:5000
   - API Documentation: http://localhost:5000/swagger

4. **Run the edge simulator**
   ```bash
   python edge-simulator/simulate.py --mission mission_001 --server http://localhost:5000
   ```

## Individual Component Deployment

### Backend API Server

1. **Navigate to server directory**
   ```bash
   cd server
   ```

2. **Restore dependencies**
   ```bash
   dotnet restore
   ```

3. **Run the application**
   ```bash
   dotnet run
   ```

4. **Access the API**
   - API: http://localhost:5000
   - Swagger UI: http://localhost:5000/swagger

### Frontend Application

1. **Navigate to client directory**
   ```bash
   cd client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

4. **Access the application**
   - Frontend: http://localhost:4200

### Edge Simulator

1. **Navigate to edge-simulator directory**
   ```bash
   cd edge-simulator
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the simulator**
   ```bash
   python simulate.py --mission mission_001 --server http://localhost:5000
   ```

## Production Deployment

### Docker Deployment

1. **Build production images**
   ```bash
   docker-compose -f docker-compose.prod.yml build
   ```

2. **Deploy with production configuration**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Kubernetes Deployment

1. **Apply Kubernetes manifests**
   ```bash
   kubectl apply -f k8s/
   ```

2. **Verify deployment**
   ```bash
   kubectl get pods
   kubectl get services
   ```

### Cloud Deployment

#### Azure Container Instances

1. **Create resource group**
   ```bash
   az group create --name sdv-rg --location eastus
   ```

2. **Deploy container group**
   ```bash
   az container create \
     --resource-group sdv-rg \
     --name sdv-platform \
     --image <your-registry>/sdv-border-control-api:latest \
     --ports 5000
   ```

#### AWS ECS

1. **Create ECS cluster**
   ```bash
   aws ecs create-cluster --cluster-name sdv-cluster
   ```

2. **Create task definition**
   ```bash
   aws ecs register-task-definition --cli-input-json file://task-definition.json
   ```

3. **Run service**
   ```bash
   aws ecs create-service \
     --cluster sdv-cluster \
     --service-name sdv-service \
     --task-definition sdv-task
   ```

## Environment Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ASPNETCORE_ENVIRONMENT` | Environment (Development/Production) | Development |
| `ConnectionStrings__DefaultConnection` | Database connection string | Data Source=sdv.db |
| `API_URL` | API server URL | http://localhost:5000 |

### Configuration Files

- **Backend**: `server/appsettings.json`
- **Frontend**: `client/src/environments/`
- **Docker**: `docker-compose.yml`

## Database Setup

### SQLite (Default)

The application uses SQLite by default for development and testing.

### SQL Server

1. **Update connection string**
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=localhost;Database=SDV;Trusted_Connection=true;"
     }
   }
   ```

2. **Run migrations**
   ```bash
   dotnet ef database update
   ```

### PostgreSQL

1. **Update connection string**
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Host=localhost;Database=sdv;Username=postgres;Password=password"
     }
   }
   ```

2. **Install PostgreSQL provider**
   ```bash
   dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL
   ```

## Monitoring and Logging

### Application Insights (Azure)

1. **Add Application Insights**
   ```bash
   dotnet add package Microsoft.ApplicationInsights.AspNetCore
   ```

2. **Configure in Program.cs**
   ```csharp
   builder.Services.AddApplicationInsightsTelemetry();
   ```

### Prometheus and Grafana

1. **Add Prometheus metrics**
   ```bash
   dotnet add package prometheus-net.AspNetCore
   ```

2. **Configure metrics endpoint**
   ```csharp
   app.UseHttpMetrics();
   app.MapMetrics();
   ```

## Security Considerations

### HTTPS Configuration

1. **Generate SSL certificate**
   ```bash
   dotnet dev-certs https --trust
   ```

2. **Configure in production**
   ```csharp
   app.UseHttpsRedirection();
   ```

### Authentication

1. **Configure JWT authentication**
   ```csharp
   builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
       .AddJwtBearer(options => {
           // JWT configuration
       });
   ```

### Input Validation

1. **Enable model validation**
   ```csharp
   app.UseRouting();
   app.UseAuthentication();
   app.UseAuthorization();
   ```

## Troubleshooting

### Common Issues

1. **Port conflicts**
   - Check if ports 5000, 5001, 4200 are available
   - Use `netstat -an | grep :5000` to check port usage

2. **Database connection issues**
   - Verify connection string
   - Check database server status
   - Ensure proper permissions

3. **CORS issues**
   - Verify CORS configuration
   - Check allowed origins
   - Ensure proper headers

### Logs

1. **View application logs**
   ```bash
   docker-compose logs -f api
   ```

2. **View specific service logs**
   ```bash
   docker-compose logs -f client
   ```

## Performance Optimization

### Backend Optimization

1. **Enable response compression**
   ```csharp
   builder.Services.AddResponseCompression();
   ```

2. **Configure caching**
   ```csharp
   builder.Services.AddMemoryCache();
   ```

### Frontend Optimization

1. **Enable production build**
   ```bash
   npm run build --prod
   ```

2. **Configure service worker**
   ```bash
   ng add @angular/pwa
   ```

## Backup and Recovery

### Database Backup

1. **SQLite backup**
   ```bash
   cp sdv.db sdv-backup-$(date +%Y%m%d).db
   ```

2. **SQL Server backup**
   ```sql
   BACKUP DATABASE SDV TO DISK = 'C:\Backup\SDV.bak'
   ```

### Application Backup

1. **Docker volumes backup**
   ```bash
   docker run --rm -v sdv_data:/data -v $(pwd):/backup alpine tar czf /backup/data-backup.tar.gz -C /data .
   ```

## Scaling

### Horizontal Scaling

1. **Load balancer configuration**
   ```yaml
   services:
     api:
       deploy:
         replicas: 3
   ```

2. **Database clustering**
   - Configure read replicas
   - Implement connection pooling
   - Use database sharding

### Vertical Scaling

1. **Resource allocation**
   ```yaml
   services:
     api:
       deploy:
         resources:
           limits:
             memory: 2G
             cpus: '1.0'
   ```

## Maintenance

### Regular Tasks

1. **Update dependencies**
   ```bash
   dotnet list package --outdated
   npm outdated
   ```

2. **Security patches**
   ```bash
   dotnet list package --vulnerable
   npm audit
   ```

3. **Database maintenance**
   ```sql
   VACUUM;
   ANALYZE;
   ```

### Monitoring

1. **Health checks**
   ```csharp
   builder.Services.AddHealthChecks();
   ```

2. **Metrics collection**
   - CPU usage
   - Memory consumption
   - Response times
   - Error rates

## Support

For additional support and documentation:

- GitHub Issues: [Repository Issues](https://github.com/your-org/sdv-border-control/issues)
- Documentation: [Project Wiki](https://github.com/your-org/sdv-border-control/wiki)
- Contact: [Support Team](mailto:support@your-org.com)

