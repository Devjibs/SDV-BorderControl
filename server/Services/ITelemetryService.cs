using SDV.BorderControl.API.Models;

namespace SDV.BorderControl.API.Services;

public interface ITelemetryService
{
    Task<IEnumerable<TelemetryRecord>> GetTelemetryByVehicleIdAsync(string vehicleId, int limit = 100);
    Task<TelemetryRecord?> GetLatestTelemetryAsync(string vehicleId);
    Task<TelemetryRecord> AddTelemetryAsync(TelemetryData telemetryData, string vehicleId);
    Task<IEnumerable<TelemetryRecord>> AddTelemetryBatchAsync(IEnumerable<TelemetryData> telemetryData, string vehicleId);
    Task<IEnumerable<TelemetryRecord>> GetTelemetryByTimeRangeAsync(string vehicleId, DateTime startTime, DateTime endTime);
}

