using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using SDV.BorderControl.API.Data;
using SDV.BorderControl.API.Models;
using SDV.BorderControl.API.Services;
using Xunit;

namespace SDV.BorderControl.API.Tests;

public class AlertServiceTests : IDisposable
{
    private readonly ApplicationDbContext _context;
    private readonly AlertService _service;
    private readonly Mock<ILogger<AlertService>> _loggerMock;

    public AlertServiceTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new ApplicationDbContext(options);
        _loggerMock = new Mock<ILogger<AlertService>>();
        _service = new AlertService(_context, _loggerMock.Object);
    }

    [Fact]
    public async Task CreateAlertAsync_ShouldCreateAlert()
    {
        // Arrange
        var alertRequest = new AlertRequest
        {
            VehicleId = "vehicle1",
            Type = "Overspeed",
            Message = "Speed exceeded limit",
            Severity = AlertSeverity.High
        };

        // Act
        var result = await _service.CreateAlertAsync(alertRequest);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("vehicle1", result.VehicleId);
        Assert.Equal("Overspeed", result.Type);
        Assert.Equal("Speed exceeded limit", result.Message);
        Assert.Equal(AlertSeverity.High, result.Severity);
        Assert.Equal(AlertStatus.Open, result.Status);
    }

    [Fact]
    public async Task GetAlertsByVehicleIdAsync_ShouldReturnAlertsForVehicle()
    {
        // Arrange
        var alert1 = new Alert
        {
            VehicleId = "vehicle1",
            Type = "Overspeed",
            Message = "Speed exceeded limit",
            Severity = AlertSeverity.High,
            Timestamp = DateTime.UtcNow,
            Status = AlertStatus.Open
        };

        var alert2 = new Alert
        {
            VehicleId = "vehicle2",
            Type = "TemperatureHigh",
            Message = "Temperature is high",
            Severity = AlertSeverity.Medium,
            Timestamp = DateTime.UtcNow,
            Status = AlertStatus.Open
        };

        _context.Alerts.AddRange(alert1, alert2);
        await _context.SaveChangesAsync();

        // Act
        var result = await _service.GetAlertsByVehicleIdAsync("vehicle1");

        // Assert
        Assert.Single(result);
        Assert.Equal("vehicle1", result.First().VehicleId);
    }

    [Fact]
    public async Task GetActiveAlertsAsync_ShouldReturnOpenAndAcknowledgedAlerts()
    {
        // Arrange
        var openAlert = new Alert
        {
            VehicleId = "vehicle1",
            Type = "Overspeed",
            Message = "Speed exceeded limit",
            Severity = AlertSeverity.High,
            Timestamp = DateTime.UtcNow,
            Status = AlertStatus.Open
        };

        var acknowledgedAlert = new Alert
        {
            VehicleId = "vehicle2",
            Type = "TemperatureHigh",
            Message = "Temperature is high",
            Severity = AlertSeverity.Medium,
            Timestamp = DateTime.UtcNow,
            Status = AlertStatus.Acknowledged
        };

        var resolvedAlert = new Alert
        {
            VehicleId = "vehicle3",
            Type = "EngineFault",
            Message = "Engine fault detected",
            Severity = AlertSeverity.Critical,
            Timestamp = DateTime.UtcNow,
            Status = AlertStatus.Resolved
        };

        _context.Alerts.AddRange(openAlert, acknowledgedAlert, resolvedAlert);
        await _context.SaveChangesAsync();

        // Act
        var result = await _service.GetActiveAlertsAsync();

        // Assert
        Assert.Equal(2, result.Count());
        Assert.Contains(result, a => a.Status == AlertStatus.Open);
        Assert.Contains(result, a => a.Status == AlertStatus.Acknowledged);
        Assert.DoesNotContain(result, a => a.Status == AlertStatus.Resolved);
    }

    [Fact]
    public async Task AcknowledgeAlertAsync_ShouldUpdateAlertStatus()
    {
        // Arrange
        var alert = new Alert
        {
            VehicleId = "vehicle1",
            Type = "Overspeed",
            Message = "Speed exceeded limit",
            Severity = AlertSeverity.High,
            Timestamp = DateTime.UtcNow,
            Status = AlertStatus.Open
        };

        _context.Alerts.Add(alert);
        await _context.SaveChangesAsync();

        // Act
        var result = await _service.AcknowledgeAlertAsync(alert.Id, "operator1");

        // Assert
        Assert.NotNull(result);
        Assert.Equal(AlertStatus.Acknowledged, result.Status);
        Assert.Equal("operator1", result.AcknowledgedBy);
        Assert.NotNull(result.AcknowledgedAt);
    }

    [Fact]
    public async Task ResolveAlertAsync_ShouldUpdateAlertStatus()
    {
        // Arrange
        var alert = new Alert
        {
            VehicleId = "vehicle1",
            Type = "Overspeed",
            Message = "Speed exceeded limit",
            Severity = AlertSeverity.High,
            Timestamp = DateTime.UtcNow,
            Status = AlertStatus.Acknowledged,
            AcknowledgedBy = "operator1",
            AcknowledgedAt = DateTime.UtcNow
        };

        _context.Alerts.Add(alert);
        await _context.SaveChangesAsync();

        // Act
        var result = await _service.ResolveAlertAsync(alert.Id, "operator1");

        // Assert
        Assert.NotNull(result);
        Assert.Equal(AlertStatus.Resolved, result.Status);
        Assert.Equal("operator1", result.ResolvedBy);
        Assert.NotNull(result.ResolvedAt);
    }

    [Fact]
    public async Task GetAlertsBySeverityAsync_ShouldReturnAlertsBySeverity()
    {
        // Arrange
        var highAlert = new Alert
        {
            VehicleId = "vehicle1",
            Type = "Overspeed",
            Message = "Speed exceeded limit",
            Severity = AlertSeverity.High,
            Timestamp = DateTime.UtcNow,
            Status = AlertStatus.Open
        };

        var mediumAlert = new Alert
        {
            VehicleId = "vehicle2",
            Type = "TemperatureHigh",
            Message = "Temperature is high",
            Severity = AlertSeverity.Medium,
            Timestamp = DateTime.UtcNow,
            Status = AlertStatus.Open
        };

        _context.Alerts.AddRange(highAlert, mediumAlert);
        await _context.SaveChangesAsync();

        // Act
        var result = await _service.GetAlertsBySeverityAsync(AlertSeverity.High);

        // Assert
        Assert.Single(result);
        Assert.Equal(AlertSeverity.High, result.First().Severity);
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}

