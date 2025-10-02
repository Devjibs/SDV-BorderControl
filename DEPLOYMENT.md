# Deployment Guide

This guide covers deploying the SDV Border Control Platform to various environments.

## Frontend Deployment (Vercel)

### Prerequisites
- Vercel account
- GitHub repository with the code
- Backend API deployed and accessible

### Steps

1. **Connect Repository to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Set the root directory to `client`

2. **Configure Environment Variables**
   In Vercel project settings, add these environment variables:
   ```
   NG_APP_API_URL=https://your-api-domain.com/api
   NG_APP_SIGNALR_URL=https://your-api-domain.com/telemetryHub
   ```

3. **Deploy**
   - Vercel will automatically build and deploy
   - The build command is: `npm run build`
   - Output directory: `dist/sdv-border-control-client`

### Troubleshooting
- If you get dependency resolution errors, ensure all packages are compatible with Angular 17
- Check that environment variables are properly set
- Verify the API URL is accessible from Vercel

## Backend Deployment

### Option 1: Docker Deployment

1. **Build the Docker image**
   ```bash
   cd server
   docker build -t sdv-border-control-api .
   ```

2. **Run the container**
   ```bash
   docker run -p 5001:80 \
     -e ConnectionStrings__DefaultConnection="Data Source=/app/data.db" \
     -e ASPNETCORE_ENVIRONMENT=Production \
     sdv-border-control-api
   ```

### Option 2: Cloud Deployment (Azure/AWS/GCP)

1. **Prepare for deployment**
   - Update `appsettings.Production.json` with production database connection
   - Configure CORS for your frontend domain
   - Set up SSL certificates

2. **Deploy to your chosen platform**
   - Follow platform-specific deployment guides
   - Ensure the API is accessible via HTTPS

## Edge Simulator Deployment

### Local Development
```bash
cd edge-simulator
pip install -r requirements.txt
python simulate.py --server http://localhost:5001
```

### Docker Deployment
```bash
cd edge-simulator
docker build -t sdv-edge-simulator .
docker run -e API_BASE_URL=https://your-api-domain.com sdv-edge-simulator
```

### Environment Variables
Set the API base URL as an environment variable:
```bash
export API_BASE_URL=https://your-api-domain.com
```

Or create a `.env` file in the edge-simulator directory:
```bash
API_BASE_URL=https://your-api-domain.com
```

## Environment Configuration

### Development
- Frontend: `http://localhost:4200`
- Backend: `http://localhost:5001`
- Database: SQLite (local file)

### Production
- Frontend: Your Vercel domain
- Backend: Your API domain
- Database: Production database (PostgreSQL recommended)

## Security Considerations

1. **CORS Configuration**
   - Update CORS settings in `Program.cs` to include your production domains
   - Remove localhost from production CORS

2. **Database Security**
   - Use strong connection strings
   - Enable SSL for database connections
   - Regular backups

3. **API Security**
   - Use HTTPS in production
   - Consider adding authentication/authorization
   - Rate limiting for API endpoints

## Monitoring and Logging

1. **Application Insights** (Azure)
   - Add Application Insights SDK
   - Configure telemetry collection

2. **Logging**
   - Configure structured logging
   - Set up log aggregation (ELK stack, etc.)

3. **Health Checks**
   - Implement health check endpoints
   - Set up monitoring alerts

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check CORS configuration in backend
   - Verify frontend URL is in allowed origins

2. **API Connection Issues**
   - Verify API URL in environment variables
   - Check network connectivity
   - Ensure API is running and accessible

3. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for TypeScript compilation errors

### Support
- Check application logs for detailed error messages
- Verify environment variables are correctly set
- Test API endpoints independently using tools like Postman
