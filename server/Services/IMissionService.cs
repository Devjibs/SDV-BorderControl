using SDV.BorderControl.API.Models;

namespace SDV.BorderControl.API.Services;

public interface IMissionService
{
    Task<IEnumerable<Mission>> GetAllMissionsAsync();
    Task<Mission?> GetMissionByIdAsync(string missionId);
    Task<Mission> CreateMissionAsync(Mission mission);
    Task<Mission?> UpdateMissionAsync(string missionId, Mission mission);
    Task<bool> DeleteMissionAsync(string missionId);
    Task<IEnumerable<Mission>> GetMissionsByVehicleIdAsync(string vehicleId);
    Task<Mission?> UpdateMissionStatusAsync(string missionId, MissionStatus status);
}

