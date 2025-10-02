using Microsoft.AspNetCore.Mvc;
using SDV.BorderControl.API.Core.DTOs;
using SDV.BorderControl.API.Core.Interfaces;

namespace SDV.BorderControl.API.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TelemetryController : ControllerBase
{
    private readonly ITelemetryService _telemetryService;

    public TelemetryController(ITelemetryService telemetryService)
    {
        _telemetryService = telemetryService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TelemetryResponse>>> GetTelemetryRecords()
    {
        var records = await _telemetryService.GetTelemetryRecordsAsync();
        return Ok(records);
    }

    [HttpGet("{vehicleId}")]
    public async Task<ActionResult<IEnumerable<TelemetryResponse>>> GetTelemetryByVehicle(string vehicleId)
    {
        var records = await _telemetryService.GetTelemetryByVehicleIdAsync(vehicleId);
        return Ok(records);
    }

    [HttpPost]
    public async Task<ActionResult<IEnumerable<TelemetryResponse>>> CreateTelemetryRecords(TelemetryRequest request)
    {
        var records = await _telemetryService.CreateTelemetryRecordsAsync(request);
        return Ok(records);
    }
}
