using SDV.BorderControl.API.Core.DTOs;
using SDV.BorderControl.API.Core.Entities;

namespace SDV.BorderControl.API.Core.Interfaces;

public interface IMissionService
{
    Task<IEnumerable<MissionResponse>> GetAllMissionsAsync();
    Task<MissionResponse?> GetMissionByIdAsync(string missionId);
    Task<MissionResponse> CreateMissionAsync(CreateMissionRequest request);
    Task<MissionResponse> UpdateMissionAsync(string missionId, UpdateMissionRequest request);
    Task<bool> DeleteMissionAsync(string missionId);
    Task<MissionResponse> UpdateMissionStatusAsync(string missionId, MissionStatus status);
}

public interface IVehicleService
{
    Task<IEnumerable<VehicleResponse>> GetAllVehiclesAsync();
    Task<VehicleResponse?> GetVehicleByIdAsync(string vehicleId);
    Task<VehicleResponse> CreateVehicleAsync(CreateVehicleRequest request);
    Task<VehicleResponse> UpdateVehicleAsync(string vehicleId, UpdateVehicleRequest request);
    Task<bool> DeleteVehicleAsync(string vehicleId);
}

public interface IAlertService
{
    Task<IEnumerable<AlertResponse>> GetAllAlertsAsync();
    Task<AlertResponse?> GetAlertByIdAsync(int alertId);
    Task<AlertResponse> CreateAlertAsync(CreateAlertRequest request);
    Task<AlertResponse> AcknowledgeAlertAsync(int alertId, string acknowledgedBy);
    Task<AlertResponse> ResolveAlertAsync(int alertId, string resolvedBy);
    Task<IEnumerable<AlertResponse>> GetAlertsByVehicleIdAsync(string vehicleId);
}

public interface ITelemetryService
{
    Task<IEnumerable<TelemetryResponse>> GetTelemetryRecordsAsync();
    Task<IEnumerable<TelemetryResponse>> GetTelemetryByVehicleIdAsync(string vehicleId);
    Task<TelemetryResponse> CreateTelemetryRecordAsync(TelemetryData data, string vehicleId);
    Task<IEnumerable<TelemetryResponse>> CreateTelemetryRecordsAsync(TelemetryRequest request);
}

public interface IAlertGenerationService
{
    Task CheckAndGenerateAlertsAsync(string vehicleId, TelemetryData telemetryData);
}
