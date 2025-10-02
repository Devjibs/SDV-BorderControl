using SDV.BorderControl.API.Core.DTOs;
using SDV.BorderControl.API.Core.Entities;
using SDV.BorderControl.API.Core.Interfaces;

namespace SDV.BorderControl.API.Application.Services;

public class AlertGenerationService : IAlertGenerationService
{
    private readonly IAlertService _alertService;

    public AlertGenerationService(IAlertService alertService)
    {
        _alertService = alertService;
    }

    public async Task CheckAndGenerateAlertsAsync(string vehicleId, TelemetryData telemetryData)
    {
        var alerts = new List<CreateAlertRequest>();

        if (telemetryData.Speed > 120)
        {
            alerts.Add(new CreateAlertRequest
            {
                VehicleId = vehicleId,
                Type = "Overspeed",
                Message = $"Vehicle exceeded speed limit: {telemetryData.Speed} km/h",
                Severity = AlertSeverity.High,
                AdditionalData = new Dictionary<string, object> { ["speed"] = telemetryData.Speed }
            });
        }

        if (telemetryData.Temperature > 80)
        {
            alerts.Add(new CreateAlertRequest
            {
                VehicleId = vehicleId,
                Type = "TemperatureHigh",
                Message = $"High temperature detected: {telemetryData.Temperature}°C",
                Severity = AlertSeverity.Medium,
                AdditionalData = new Dictionary<string, object> { ["temperature"] = telemetryData.Temperature }
            });
        }

        if (telemetryData.AdditionalData.TryGetValue("fuelLevel", out var fuelLevelObj) &&
            fuelLevelObj is double fuelLevel && fuelLevel < 0.2)
        {
            alerts.Add(new CreateAlertRequest
            {
                VehicleId = vehicleId,
                Type = "FuelLow",
                Message = $"Low fuel level: {fuelLevel * 100:F1}%",
                Severity = AlertSeverity.Medium,
                AdditionalData = new Dictionary<string, object> { ["fuelLevel"] = fuelLevel }
            });
        }

        foreach (var alert in alerts)
        {
            await _alertService.CreateAlertAsync(alert);
        }
    }
}
