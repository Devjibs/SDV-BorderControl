using Microsoft.EntityFrameworkCore;
using SDV.BorderControl.API.Data;
using SDV.BorderControl.API.Models;

namespace SDV.BorderControl.API.Services;

public class MissionService : IMissionService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<MissionService> _logger;

    public MissionService(ApplicationDbContext context, ILogger<MissionService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<IEnumerable<Mission>> GetAllMissionsAsync()
    {
        try
        {
            return await _context.Missions
                .OrderByDescending(m => m.CreatedAt)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving all missions");
            throw;
        }
    }

    public async Task<Mission?> GetMissionByIdAsync(string missionId)
    {
        try
        {
            return await _context.Missions
                .FirstOrDefaultAsync(m => m.MissionId == missionId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving mission {MissionId}", missionId);
            throw;
        }
    }

    public async Task<Mission> CreateMissionAsync(Mission mission)
    {
        try
        {
            if (string.IsNullOrEmpty(mission.MissionId))
            {
                mission.MissionId = Guid.NewGuid().ToString();
            }

            mission.CreatedAt = DateTime.UtcNow;
            mission.UpdatedAt = DateTime.UtcNow;

            _context.Missions.Add(mission);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Created mission {MissionId} with name {MissionName}",
                mission.MissionId, mission.Name);

            return mission;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating mission {MissionName}", mission.Name);
            throw;
        }
    }

    public async Task<Mission?> UpdateMissionAsync(string missionId, Mission mission)
    {
        try
        {
            var existingMission = await _context.Missions
                .FirstOrDefaultAsync(m => m.MissionId == missionId);

            if (existingMission == null)
            {
                return null;
            }

            existingMission.Name = mission.Name;
            existingMission.StartTime = mission.StartTime;
            existingMission.EndTime = mission.EndTime;
            existingMission.VehicleIds = mission.VehicleIds;
            existingMission.Status = mission.Status;
            existingMission.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Updated mission {MissionId}", missionId);

            return existingMission;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating mission {MissionId}", missionId);
            throw;
        }
    }

    public async Task<bool> DeleteMissionAsync(string missionId)
    {
        try
        {
            var mission = await _context.Missions
                .FirstOrDefaultAsync(m => m.MissionId == missionId);

            if (mission == null)
            {
                return false;
            }

            _context.Missions.Remove(mission);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Deleted mission {MissionId}", missionId);

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting mission {MissionId}", missionId);
            throw;
        }
    }

    public async Task<IEnumerable<Mission>> GetMissionsByVehicleIdAsync(string vehicleId)
    {
        try
        {
            return await _context.Missions
                .Where(m => m.VehicleIds.Contains(vehicleId))
                .OrderByDescending(m => m.CreatedAt)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving missions for vehicle {VehicleId}", vehicleId);
            throw;
        }
    }

    public async Task<Mission?> UpdateMissionStatusAsync(string missionId, MissionStatus status)
    {
        try
        {
            var mission = await _context.Missions
                .FirstOrDefaultAsync(m => m.MissionId == missionId);

            if (mission == null)
            {
                return null;
            }

            mission.Status = status;
            mission.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Updated mission {MissionId} status to {Status}", missionId, status);

            return mission;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating mission {MissionId} status", missionId);
            throw;
        }
    }
}

