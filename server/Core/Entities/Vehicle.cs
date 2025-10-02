using System.ComponentModel.DataAnnotations;

namespace SDV.BorderControl.API.Core.Entities;

public class Vehicle
{
    [Key]
    public string VehicleId { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    public VehicleType Type { get; set; }

    [Required]
    public VehicleStatus Status { get; set; }

    public string? ImageUrl { get; set; }

    public DateTime? LastSeen { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }
}

public enum VehicleType
{
    Patrol = 0,
    Surveillance = 1,
    Emergency = 2,
    Transport = 3
}

public enum VehicleStatus
{
    Offline = 0,
    Online = 1,
    OnMission = 2,
    Maintenance = 3,
    Alert = 4
}
