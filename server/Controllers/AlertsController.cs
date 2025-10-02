using Microsoft.AspNetCore.Mvc;
using SDV.BorderControl.API.Models;
using SDV.BorderControl.API.Services;

namespace SDV.BorderControl.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AlertsController : ControllerBase
{
    private readonly IAlertService _alertService;
    private readonly ILogger<AlertsController> _logger;

    public AlertsController(IAlertService alertService, ILogger<AlertsController> logger)
    {
        _alertService = alertService;
        _logger = logger;
    }

    /// <summary>
    /// Get all alerts
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Alert>>> GetAlerts()
    {
        try
        {
            var alerts = await _alertService.GetAllAlertsAsync();
            return Ok(alerts);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving alerts");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get active alerts
    /// </summary>
    [HttpGet("active")]
    public async Task<ActionResult<IEnumerable<Alert>>> GetActiveAlerts()
    {
        try
        {
            var alerts = await _alertService.GetActiveAlertsAsync();
            return Ok(alerts);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving active alerts");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get alerts by vehicle ID
    /// </summary>
    [HttpGet("vehicle/{vehicleId}")]
    public async Task<ActionResult<IEnumerable<Alert>>> GetAlertsByVehicle(string vehicleId)
    {
        try
        {
            var alerts = await _alertService.GetAlertsByVehicleIdAsync(vehicleId);
            return Ok(alerts);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving alerts for vehicle {VehicleId}", vehicleId);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get alert by ID
    /// </summary>
    [HttpGet("{alertId}")]
    public async Task<ActionResult<Alert>> GetAlert(int alertId)
    {
        try
        {
            var alert = await _alertService.GetAlertByIdAsync(alertId);
            if (alert == null)
            {
                return NotFound($"Alert with ID {alertId} not found");
            }
            return Ok(alert);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving alert {AlertId}", alertId);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Create a new alert
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<Alert>> CreateAlert([FromBody] AlertRequest alertRequest)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var alert = await _alertService.CreateAlertAsync(alertRequest);
            return CreatedAtAction(nameof(GetAlert), new { alertId = alert.Id }, alert);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating alert");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Acknowledge an alert
    /// </summary>
    [HttpPatch("{alertId}/acknowledge")]
    public async Task<ActionResult<Alert>> AcknowledgeAlert(int alertId, [FromBody] AcknowledgeAlertRequest request)
    {
        try
        {
            var alert = await _alertService.AcknowledgeAlertAsync(alertId, request.AcknowledgedBy);
            if (alert == null)
            {
                return NotFound($"Alert with ID {alertId} not found");
            }

            return Ok(alert);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error acknowledging alert {AlertId}", alertId);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Resolve an alert
    /// </summary>
    [HttpPatch("{alertId}/resolve")]
    public async Task<ActionResult<Alert>> ResolveAlert(int alertId, [FromBody] ResolveAlertRequest request)
    {
        try
        {
            var alert = await _alertService.ResolveAlertAsync(alertId, request.ResolvedBy);
            if (alert == null)
            {
                return NotFound($"Alert with ID {alertId} not found");
            }

            return Ok(alert);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error resolving alert {AlertId}", alertId);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get alerts by severity
    /// </summary>
    [HttpGet("severity/{severity}")]
    public async Task<ActionResult<IEnumerable<Alert>>> GetAlertsBySeverity(AlertSeverity severity)
    {
        try
        {
            var alerts = await _alertService.GetAlertsBySeverityAsync(severity);
            return Ok(alerts);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving alerts by severity {Severity}", severity);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get alerts by status
    /// </summary>
    [HttpGet("status/{status}")]
    public async Task<ActionResult<IEnumerable<Alert>>> GetAlertsByStatus(AlertStatus status)
    {
        try
        {
            var alerts = await _alertService.GetAlertsByStatusAsync(status);
            return Ok(alerts);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving alerts by status {Status}", status);
            return StatusCode(500, "Internal server error");
        }
    }
}

public class AcknowledgeAlertRequest
{
    public string AcknowledgedBy { get; set; } = string.Empty;
}

public class ResolveAlertRequest
{
    public string ResolvedBy { get; set; } = string.Empty;
}

