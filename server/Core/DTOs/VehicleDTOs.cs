using System.ComponentModel.DataAnnotations;
using SDV.BorderControl.API.Core.Entities;

namespace SDV.BorderControl.API.Core.DTOs;

public class CreateVehicleRequest
{
    [Required]
    [StringLength(50)]
    public string VehicleId { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    public VehicleType Type { get; set; }

    [Required]
    public VehicleStatus Status { get; set; }

    public string? ImageUrl { get; set; }
}

public class UpdateVehicleRequest
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    public VehicleType Type { get; set; }

    [Required]
    public VehicleStatus Status { get; set; }

    public string? ImageUrl { get; set; }
}

public class VehicleResponse
{
    public string VehicleId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public VehicleType Type { get; set; }
    public VehicleStatus Status { get; set; }
    public string? ImageUrl { get; set; }
    public DateTime? LastSeen { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
