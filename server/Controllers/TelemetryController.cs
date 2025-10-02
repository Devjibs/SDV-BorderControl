using Microsoft.AspNetCore.Mvc;
using SDV.BorderControl.API.Models;
using SDV.BorderControl.API.Services;

namespace SDV.BorderControl.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TelemetryController : ControllerBase
{
    private readonly ITelemetryService _telemetryService;
    private readonly ILogger<TelemetryController> _logger;

    public TelemetryController(ITelemetryService telemetryService, ILogger<TelemetryController> logger)
    {
        _telemetryService = telemetryService;
        _logger = logger;
    }

    /// <summary>
    /// Get telemetry records for a vehicle
    /// </summary>
    [HttpGet("{vehicleId}")]
    public async Task<ActionResult<IEnumerable<TelemetryRecord>>> GetTelemetry(string vehicleId, [FromQuery] int limit = 100)
    {
        try
        {
            var telemetry = await _telemetryService.GetTelemetryByVehicleIdAsync(vehicleId, limit);
            return Ok(telemetry);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving telemetry for vehicle {VehicleId}", vehicleId);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get latest telemetry for a vehicle
    /// </summary>
    [HttpGet("{vehicleId}/latest")]
    public async Task<ActionResult<TelemetryRecord>> GetLatestTelemetry(string vehicleId)
    {
        try
        {
            var telemetry = await _telemetryService.GetLatestTelemetryAsync(vehicleId);
            if (telemetry == null)
            {
                return NotFound($"No telemetry found for vehicle {vehicleId}");
            }
            return Ok(telemetry);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving latest telemetry for vehicle {VehicleId}", vehicleId);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Add telemetry records for a vehicle
    /// </summary>
    [HttpPost("{vehicleId}")]
    public async Task<ActionResult<IEnumerable<TelemetryRecord>>> AddTelemetry(string vehicleId, [FromBody] List<TelemetryData> telemetryData)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var records = await _telemetryService.AddTelemetryBatchAsync(telemetryData, vehicleId);
            return Ok(records);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding telemetry for vehicle {VehicleId}", vehicleId);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get telemetry records within a time range
    /// </summary>
    [HttpGet("{vehicleId}/range")]
    public async Task<ActionResult<IEnumerable<TelemetryRecord>>> GetTelemetryByTimeRange(
        string vehicleId,
        [FromQuery] DateTime startTime,
        [FromQuery] DateTime endTime)
    {
        try
        {
            var telemetry = await _telemetryService.GetTelemetryByTimeRangeAsync(vehicleId, startTime, endTime);
            return Ok(telemetry);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving telemetry for vehicle {VehicleId} in time range", vehicleId);
            return StatusCode(500, "Internal server error");
        }
    }
}

