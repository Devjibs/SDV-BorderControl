using Microsoft.AspNetCore.Mvc;
using SDV.BorderControl.API.Models;
using SDV.BorderControl.API.Services;

namespace SDV.BorderControl.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MissionsController : ControllerBase
{
    private readonly IMissionService _missionService;
    private readonly ILogger<MissionsController> _logger;

    public MissionsController(IMissionService missionService, ILogger<MissionsController> logger)
    {
        _missionService = missionService;
        _logger = logger;
    }

    /// <summary>
    /// Get all missions
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Mission>>> GetMissions()
    {
        try
        {
            var missions = await _missionService.GetAllMissionsAsync();
            return Ok(missions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving missions");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get mission by ID
    /// </summary>
    [HttpGet("{missionId}")]
    public async Task<ActionResult<Mission>> GetMission(string missionId)
    {
        try
        {
            var mission = await _missionService.GetMissionByIdAsync(missionId);
            if (mission == null)
            {
                return NotFound($"Mission with ID {missionId} not found");
            }
            return Ok(mission);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving mission {MissionId}", missionId);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Create a new mission
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<Mission>> CreateMission([FromBody] Mission mission)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var createdMission = await _missionService.CreateMissionAsync(mission);
            return CreatedAtAction(nameof(GetMission), new { missionId = createdMission.MissionId }, createdMission);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating mission");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Update an existing mission
    /// </summary>
    [HttpPut("{missionId}")]
    public async Task<ActionResult<Mission>> UpdateMission(string missionId, [FromBody] Mission mission)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updatedMission = await _missionService.UpdateMissionAsync(missionId, mission);
            if (updatedMission == null)
            {
                return NotFound($"Mission with ID {missionId} not found");
            }

            return Ok(updatedMission);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating mission {MissionId}", missionId);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Delete a mission
    /// </summary>
    [HttpDelete("{missionId}")]
    public async Task<ActionResult> DeleteMission(string missionId)
    {
        try
        {
            var deleted = await _missionService.DeleteMissionAsync(missionId);
            if (!deleted)
            {
                return NotFound($"Mission with ID {missionId} not found");
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting mission {MissionId}", missionId);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get missions by vehicle ID
    /// </summary>
    [HttpGet("vehicle/{vehicleId}")]
    public async Task<ActionResult<IEnumerable<Mission>>> GetMissionsByVehicle(string vehicleId)
    {
        try
        {
            var missions = await _missionService.GetMissionsByVehicleIdAsync(vehicleId);
            return Ok(missions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving missions for vehicle {VehicleId}", vehicleId);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Update mission status
    /// </summary>
    [HttpPatch("{missionId}/status")]
    public async Task<ActionResult<Mission>> UpdateMissionStatus(string missionId, [FromBody] UpdateMissionStatusRequest request)
    {
        try
        {
            var updatedMission = await _missionService.UpdateMissionStatusAsync(missionId, request.Status);
            if (updatedMission == null)
            {
                return NotFound($"Mission with ID {missionId} not found");
            }

            return Ok(updatedMission);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating mission status for {MissionId}", missionId);
            return StatusCode(500, "Internal server error");
        }
    }
}

public class UpdateMissionStatusRequest
{
    public MissionStatus Status { get; set; }
}

