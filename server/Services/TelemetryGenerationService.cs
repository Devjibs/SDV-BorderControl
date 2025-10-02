using SDV.BorderControl.API.Models;
using SDV.BorderControl.API.Services;

namespace SDV.BorderControl.API.Services;

public class TelemetryGenerationService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<TelemetryGenerationService> _logger;
    private readonly Random _random = new();

    public TelemetryGenerationService(IServiceProvider serviceProvider, ILogger<TelemetryGenerationService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Starting telemetry generation service");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var vehicleService = scope.ServiceProvider.GetRequiredService<IVehicleService>();
                var telemetryService = scope.ServiceProvider.GetRequiredService<ITelemetryService>();

                var vehicles = await vehicleService.GetVehiclesAsync();

                foreach (var vehicle in vehicles)
                {
                    if (string.IsNullOrEmpty(vehicle.VehicleId))
                        continue;

                    // Generate telemetry data for this vehicle
                    var telemetryData = GenerateTelemetryData(vehicle.VehicleId);
                    await telemetryService.AddTelemetryBatchAsync(new List<TelemetryData> { telemetryData }, vehicle.VehicleId);

                    _logger.LogDebug("Generated telemetry for vehicle {VehicleId}", vehicle.VehicleId);
                }

                // Wait 30 seconds before generating next batch
                await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating telemetry data");
                await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);
            }
        }
    }

    private TelemetryData GenerateTelemetryData(string vehicleId)
    {
        // Generate realistic telemetry data
        var baseLat = 40.7128; // New York area
        var baseLng = -74.0060;

        return new TelemetryData
        {
            Timestamp = DateTime.UtcNow.ToString("O"),
            Latitude = baseLat + (_random.NextDouble() - 0.5) * 0.1,
            Longitude = baseLng + (_random.NextDouble() - 0.5) * 0.1,
            Altitude = 10 + _random.NextDouble() * 50,
            Speed = _random.Next(0, 80),
            Temperature = 20 + _random.NextDouble() * 15,
            Heading = _random.Next(0, 360),
            AdditionalData = new Dictionary<string, object>
            {
                { "fuelLevel", _random.NextDouble() },
                { "batteryLevel", _random.NextDouble() },
                { "engineRpm", 1000 + _random.Next(0, 3000) },
                { "oilPressure", 30 + _random.NextDouble() * 20 }
            }
        };
    }
}
