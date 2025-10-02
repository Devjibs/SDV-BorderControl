using System.ComponentModel.DataAnnotations;

namespace SDV.BorderControl.API.Models;

public class Alert
{
    public int Id { get; set; }

    [Required]
    public string VehicleId { get; set; } = string.Empty;

    [Required]
    public string Type { get; set; } = string.Empty;

    [Required]
    public string Message { get; set; } = string.Empty;

    [Required]
    public AlertSeverity Severity { get; set; }

    [Required]
    public DateTime Timestamp { get; set; }

    public AlertStatus Status { get; set; } = AlertStatus.Open;

    public DateTime? AcknowledgedAt { get; set; }

    public string? AcknowledgedBy { get; set; }

    public DateTime? ResolvedAt { get; set; }

    public string? ResolvedBy { get; set; }

    public Dictionary<string, object> AdditionalData { get; set; } = new();
}

public class AlertRequest
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

public enum AlertSeverity
{
    Low,
    Medium,
    High,
    Critical
}

public enum AlertStatus
{
    Open,
    Acknowledged,
    Resolved
}

