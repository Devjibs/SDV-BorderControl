using System.ComponentModel.DataAnnotations;
using SDV.BorderControl.API.Core.Entities;

namespace SDV.BorderControl.API.Core.DTOs;

public class CreateMissionRequest
{
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    public DateTime StartTime { get; set; }

    [Required]
    public DateTime EndTime { get; set; }

    public List<string> VehicleIds { get; set; } = new();
}

public class UpdateMissionRequest
{
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    public DateTime StartTime { get; set; }

    [Required]
    public DateTime EndTime { get; set; }

    public List<string> VehicleIds { get; set; } = new();

    public MissionStatus Status { get; set; }
}

public class MissionResponse
{
    public string MissionId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public List<string> VehicleIds { get; set; } = new();
    public MissionStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
