namespace SDV.BorderControl.API.Models;

public class Vehicle
{
    public string VehicleId { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public VehicleType Type { get; set; }

    public VehicleStatus Status { get; set; } = VehicleStatus.Offline;

    public DateTime? LastSeen { get; set; }

    public TelemetryRecord? LastTelemetry { get; set; }

    public List<Alert> ActiveAlerts { get; set; } = new();
}

public enum VehicleType
{
    Patrol,
    Surveillance,
    Emergency,
    Transport
}

public enum VehicleStatus
{
    Offline,
    Online,
    OnMission,
    Maintenance,
    Alert
}

