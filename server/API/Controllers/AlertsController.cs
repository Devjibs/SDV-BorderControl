using Microsoft.AspNetCore.Mvc;
using SDV.BorderControl.API.Core.DTOs;
using SDV.BorderControl.API.Core.Interfaces;

namespace SDV.BorderControl.API.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AlertsController : ControllerBase
{
    private readonly IAlertService _alertService;

    public AlertsController(IAlertService alertService)
    {
        _alertService = alertService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<AlertResponse>>> GetAlerts()
    {
        var alerts = await _alertService.GetAllAlertsAsync();
        return Ok(alerts);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<AlertResponse>> GetAlert(int id)
    {
        var alert = await _alertService.GetAlertByIdAsync(id);
        if (alert == null)
            return NotFound();

        return Ok(alert);
    }

    [HttpGet("vehicle/{vehicleId}")]
    public async Task<ActionResult<IEnumerable<AlertResponse>>> GetAlertsByVehicle(string vehicleId)
    {
        var alerts = await _alertService.GetAlertsByVehicleIdAsync(vehicleId);
        return Ok(alerts);
    }

    [HttpPost]
    public async Task<ActionResult<AlertResponse>> CreateAlert(CreateAlertRequest request)
    {
        var alert = await _alertService.CreateAlertAsync(request);
        return CreatedAtAction(nameof(GetAlert), new { id = alert.Id }, alert);
    }

    [HttpPut("{id}/acknowledge")]
    public async Task<ActionResult<AlertResponse>> AcknowledgeAlert(int id, [FromBody] string acknowledgedBy)
    {
        try
        {
            var alert = await _alertService.AcknowledgeAlertAsync(id, acknowledgedBy);
            return Ok(alert);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpPut("{id}/resolve")]
    public async Task<ActionResult<AlertResponse>> ResolveAlert(int id, [FromBody] string resolvedBy)
    {
        try
        {
            var alert = await _alertService.ResolveAlertAsync(id, resolvedBy);
            return Ok(alert);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }
}
