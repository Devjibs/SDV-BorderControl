using System.ComponentModel.DataAnnotations;

namespace SDV.BorderControl.API.Core.Entities;

public class Mission
{
    public string MissionId { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    public DateTime StartTime { get; set; }

    [Required]
    public DateTime EndTime { get; set; }

    public List<string> VehicleIds { get; set; } = new();

    public MissionStatus Status { get; set; } = MissionStatus.Pending;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }
}

public enum MissionStatus
{
    Pending,
    Active,
    Completed,
    Cancelled
}
