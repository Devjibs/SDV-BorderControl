using System.ComponentModel.DataAnnotations;

namespace SDV.BorderControl.API.Core.Entities;

public class TelemetryRecord
{
    public int Id { get; set; }

    [Required]
    public string VehicleId { get; set; } = string.Empty;

    [Required]
    public DateTime Timestamp { get; set; }

    [Required]
    public double Latitude { get; set; }

    [Required]
    public double Longitude { get; set; }

    public double Speed { get; set; }

    public double Temperature { get; set; }

    public double Altitude { get; set; }

    public double Heading { get; set; }

    public Dictionary<string, object> AdditionalData { get; set; } = new();
}
