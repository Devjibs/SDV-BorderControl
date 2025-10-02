using SDV.BorderControl.API.Models;

namespace SDV.BorderControl.API.Services;

public interface IAlertService
{
    Task<IEnumerable<Alert>> GetAllAlertsAsync();
    Task<IEnumerable<Alert>> GetAlertsByVehicleIdAsync(string vehicleId);
    Task<IEnumerable<Alert>> GetActiveAlertsAsync();
    Task<Alert> CreateAlertAsync(AlertRequest alertRequest);
    Task<Alert?> GetAlertByIdAsync(int alertId);
    Task<Alert?> AcknowledgeAlertAsync(int alertId, string acknowledgedBy);
    Task<Alert?> ResolveAlertAsync(int alertId, string resolvedBy);
    Task<IEnumerable<Alert>> GetAlertsBySeverityAsync(AlertSeverity severity);
    Task<IEnumerable<Alert>> GetAlertsByStatusAsync(AlertStatus status);
}

