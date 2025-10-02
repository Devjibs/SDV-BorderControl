using Microsoft.EntityFrameworkCore;
using SDV.BorderControl.API.Data;
using SDV.BorderControl.API.Models;

namespace SDV.BorderControl.API.Services;

public class AlertService : IAlertService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<AlertService> _logger;

    public AlertService(ApplicationDbContext context, ILogger<AlertService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<IEnumerable<Alert>> GetAllAlertsAsync()
    {
        try
        {
            return await _context.Alerts
                .OrderByDescending(a => a.Timestamp)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving all alerts");
            throw;
        }
    }

    public async Task<IEnumerable<Alert>> GetAlertsByVehicleIdAsync(string vehicleId)
    {
        try
        {
            return await _context.Alerts
                .Where(a => a.VehicleId == vehicleId)
                .OrderByDescending(a => a.Timestamp)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving alerts for vehicle {VehicleId}", vehicleId);
            throw;
        }
    }

    public async Task<IEnumerable<Alert>> GetActiveAlertsAsync()
    {
        try
        {
            return await _context.Alerts
                .Where(a => a.Status == AlertStatus.Open || a.Status == AlertStatus.Acknowledged)
                .OrderByDescending(a => a.Timestamp)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving active alerts");
            throw;
        }
    }

    public async Task<Alert> CreateAlertAsync(AlertRequest alertRequest)
    {
        try
        {
            var alert = new Alert
            {
                VehicleId = alertRequest.VehicleId,
                Type = alertRequest.Type,
                Message = alertRequest.Message,
                Severity = alertRequest.Severity,
                Timestamp = DateTime.UtcNow,
                Status = AlertStatus.Open,
                AdditionalData = alertRequest.AdditionalData
            };

            _context.Alerts.Add(alert);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Created alert {AlertId} of type {AlertType} for vehicle {VehicleId}",
                alert.Id, alert.Type, alert.VehicleId);

            return alert;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating alert for vehicle {VehicleId}", alertRequest.VehicleId);
            throw;
        }
    }

    public async Task<Alert?> GetAlertByIdAsync(int alertId)
    {
        try
        {
            return await _context.Alerts
                .FirstOrDefaultAsync(a => a.Id == alertId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving alert {AlertId}", alertId);
            throw;
        }
    }

    public async Task<Alert?> AcknowledgeAlertAsync(int alertId, string acknowledgedBy)
    {
        try
        {
            var alert = await _context.Alerts
                .FirstOrDefaultAsync(a => a.Id == alertId);

            if (alert == null)
            {
                return null;
            }

            alert.Status = AlertStatus.Acknowledged;
            alert.AcknowledgedAt = DateTime.UtcNow;
            alert.AcknowledgedBy = acknowledgedBy;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Acknowledged alert {AlertId} by {User}", alertId, acknowledgedBy);

            return alert;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error acknowledging alert {AlertId}", alertId);
            throw;
        }
    }

    public async Task<Alert?> ResolveAlertAsync(int alertId, string resolvedBy)
    {
        try
        {
            var alert = await _context.Alerts
                .FirstOrDefaultAsync(a => a.Id == alertId);

            if (alert == null)
            {
                return null;
            }

            alert.Status = AlertStatus.Resolved;
            alert.ResolvedAt = DateTime.UtcNow;
            alert.ResolvedBy = resolvedBy;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Resolved alert {AlertId} by {User}", alertId, resolvedBy);

            return alert;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error resolving alert {AlertId}", alertId);
            throw;
        }
    }

    public async Task<IEnumerable<Alert>> GetAlertsBySeverityAsync(AlertSeverity severity)
    {
        try
        {
            return await _context.Alerts
                .Where(a => a.Severity == severity)
                .OrderByDescending(a => a.Timestamp)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving alerts by severity {Severity}", severity);
            throw;
        }
    }

    public async Task<IEnumerable<Alert>> GetAlertsByStatusAsync(AlertStatus status)
    {
        try
        {
            return await _context.Alerts
                .Where(a => a.Status == status)
                .OrderByDescending(a => a.Timestamp)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving alerts by status {Status}", status);
            throw;
        }
    }
}

