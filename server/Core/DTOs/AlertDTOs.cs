using System.ComponentModel.DataAnnotations;
using SDV.BorderControl.API.Core.Entities;

namespace SDV.BorderControl.API.Core.DTOs;

public class CreateAlertRequest
{
    [Required]
    public string VehicleId { get; set; } = string.Empty;

    [Required]
    public string Type { get; set; } = string.Empty;

    [Required]
    public string Message { get; set; } = string.Empty;

    [Required]
    public AlertSeverity Severity { get; set; }

    public Dictionary<string, object> AdditionalData { get; set; } = new();
}

public class AlertResponse
{
    public int Id { get; set; }
    public string VehicleId { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public AlertSeverity Severity { get; set; }
    public DateTime Timestamp { get; set; }
    public AlertStatus Status { get; set; }
    public DateTime? AcknowledgedAt { get; set; }
    public string? AcknowledgedBy { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public string? ResolvedBy { get; set; }
    public Dictionary<string, object> AdditionalData { get; set; } = new();
}
