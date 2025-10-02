using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using SDV.BorderControl.API.Data;
using SDV.BorderControl.API.Models;
using SDV.BorderControl.API.Hubs;

namespace SDV.BorderControl.API.Services
{
    public class AlertGenerationService : IAlertGenerationService
    {
        private readonly ApplicationDbContext _context;
        private readonly IAlertService _alertService;
        private readonly IHubContext<TelemetryHub> _hubContext;
        private readonly ILogger<AlertGenerationService> _logger;
        private readonly Timer _timer;
        private readonly Random _random = new Random();

        public AlertGenerationService(
            ApplicationDbContext context,
            IAlertService alertService,
            IHubContext<TelemetryHub> hubContext,
            ILogger<AlertGenerationService> logger)
        {
            _context = context;
            _alertService = alertService;
            _hubContext = hubContext;
            _logger = logger;
            _timer = new Timer(GenerateAlertsForVehicles, null, Timeout.Infinite, Timeout.Infinite);
        }

        public async Task StartAlertGenerationAsync()
        {
            _logger.LogInformation("Starting alert generation service");
            _timer.Change(TimeSpan.Zero, TimeSpan.FromSeconds(30)); // Generate alerts every 30 seconds
        }

        public async Task StopAlertGenerationAsync()
        {
            _logger.LogInformation("Stopping alert generation service");
            _timer.Change(Timeout.Infinite, Timeout.Infinite);
        }

        public async Task<bool> ShouldGenerateAlertsForVehicleAsync(string vehicleId)
        {
            var alertCount = await _context.Alerts
                .Where(a => a.VehicleId == vehicleId)
                .CountAsync();

            return alertCount < 100; // Stop generating after 100 alerts
        }

        private async void GenerateAlertsForVehicles(object? state)
        {
            try
            {
                var vehicles = await _context.Vehicles.ToListAsync();

                foreach (var vehicle in vehicles)
                {
                    if (await ShouldGenerateAlertsForVehicleAsync(vehicle.VehicleId))
                    {
                        // 30% chance to generate an alert for each vehicle
                        if (_random.NextDouble() < 0.3)
                        {
                            await GenerateRandomAlertForVehicle(vehicle);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating alerts for vehicles");
            }
        }

        private async Task GenerateRandomAlertForVehicle(Vehicle vehicle)
        {
            try
            {
                var alertTypes = new[]
                {
                    ("Overspeed", "High"),
                    ("TemperatureHigh", "Medium"),
                    ("FuelLow", "Low"),
                    ("BatteryLow", "Medium"),
                    ("EngineFault", "Critical"),
                    ("GeofenceBreach", "High")
                };

                var (alertType, severity) = alertTypes[_random.Next(alertTypes.Length)];

                var messages = new Dictionary<string, string>
                {
                    ["Overspeed"] = $"Vehicle {vehicle.Name} exceeded speed limit",
                    ["TemperatureHigh"] = $"Engine temperature high on {vehicle.Name}",
                    ["FuelLow"] = $"Fuel level low on {vehicle.Name}",
                    ["BatteryLow"] = $"Battery level critical on {vehicle.Name}",
                    ["EngineFault"] = $"Engine fault detected on {vehicle.Name}",
                    ["GeofenceBreach"] = $"{vehicle.Name} has left designated patrol area"
                };

                var severityMap = new Dictionary<string, AlertSeverity>
                {
                    ["Low"] = AlertSeverity.Low,
                    ["Medium"] = AlertSeverity.Medium,
                    ["High"] = AlertSeverity.High,
                    ["Critical"] = AlertSeverity.Critical
                };

                var alert = new Alert
                {
                    VehicleId = vehicle.VehicleId,
                    Type = alertType,
                    Message = messages[alertType],
                    Severity = severityMap[severity],
                    Timestamp = DateTime.UtcNow,
                    Status = AlertStatus.Open,
                    AdditionalData = new Dictionary<string, object>
                    {
                        ["vehicleName"] = vehicle.Name,
                        ["vehicleType"] = vehicle.Type.ToString(),
                        ["generatedBy"] = "AlertGenerationService"
                    }
                };

                var alertRequest = new AlertRequest
                {
                    VehicleId = alert.VehicleId,
                    Type = alert.Type,
                    Message = alert.Message,
                    Severity = alert.Severity,
                    AdditionalData = alert.AdditionalData
                };

                await _alertService.CreateAlertAsync(alertRequest);

                // Send real-time update via SignalR
                await _hubContext.Clients.All.SendAsync("ReceiveAlert", alert);

                _logger.LogInformation("Generated alert {AlertType} for vehicle {VehicleId}",
                    alertType, vehicle.VehicleId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating alert for vehicle {VehicleId}", vehicle.VehicleId);
            }
        }
    }
}
