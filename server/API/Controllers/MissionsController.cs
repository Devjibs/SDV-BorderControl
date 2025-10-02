using Microsoft.AspNetCore.Mvc;
using SDV.BorderControl.API.Core.DTOs;
using SDV.BorderControl.API.Core.Entities;
using SDV.BorderControl.API.Core.Interfaces;

namespace SDV.BorderControl.API.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MissionsController : ControllerBase
{
    private readonly IMissionService _missionService;

    public MissionsController(IMissionService missionService)
    {
        _missionService = missionService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MissionResponse>>> GetMissions()
    {
        var missions = await _missionService.GetAllMissionsAsync();
        return Ok(missions);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<MissionResponse>> GetMission(string id)
    {
        var mission = await _missionService.GetMissionByIdAsync(id);
        if (mission == null)
            return NotFound();

        return Ok(mission);
    }

    [HttpPost]
    public async Task<ActionResult<MissionResponse>> CreateMission(CreateMissionRequest request)
    {
        var mission = await _missionService.CreateMissionAsync(request);
        return CreatedAtAction(nameof(GetMission), new { id = mission.MissionId }, mission);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<MissionResponse>> UpdateMission(string id, UpdateMissionRequest request)
    {
        try
        {
            var mission = await _missionService.UpdateMissionAsync(id, request);
            return Ok(mission);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteMission(string id)
    {
        var result = await _missionService.DeleteMissionAsync(id);
        if (!result)
            return NotFound();

        return NoContent();
    }

    [HttpPut("{id}/status")]
    public async Task<ActionResult<MissionResponse>> UpdateMissionStatus(string id, [FromBody] string status)
    {
        try
        {
            if (!Enum.TryParse<MissionStatus>(status, true, out var missionStatus))
                return BadRequest("Invalid status value");

            var mission = await _missionService.UpdateMissionStatusAsync(id, missionStatus);
            return Ok(mission);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }
}
