using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using SDV.BorderControl.API.Data;
using SDV.BorderControl.API.Models;
using SDV.BorderControl.API.Services;
using Xunit;

namespace SDV.BorderControl.API.Tests;

public class TelemetryServiceTests : IDisposable
{
    private readonly ApplicationDbContext _context;
    private readonly TelemetryService _service;
    private readonly Mock<ILogger<TelemetryService>> _loggerMock;

    public TelemetryServiceTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new ApplicationDbContext(options);
        _loggerMock = new Mock<ILogger<TelemetryService>>();
        _service = new TelemetryService(_context, _loggerMock.Object);
    }

    [Fact]
    public async Task AddTelemetryAsync_ShouldAddTelemetryRecord()
    {
        // Arrange
        var telemetryData = new TelemetryData
        {
            Timestamp = DateTime.UtcNow.ToString("O"),
            Latitude = 40.7128,
            Longitude = -74.0060,
            Speed = 50.0,
            Temperature = 25.0,
            Altitude = 100.0,
            Heading = 180.0
        };

        // Act
        var result = await _service.AddTelemetryAsync(telemetryData, "vehicle1");

        // Assert
        Assert.NotNull(result);
        Assert.Equal("vehicle1", result.VehicleId);
        Assert.Equal(40.7128, result.Latitude);
        Assert.Equal(-74.0060, result.Longitude);
        Assert.Equal(50.0, result.Speed);
    }

    [Fact]
    public async Task AddTelemetryBatchAsync_ShouldAddMultipleRecords()
    {
        // Arrange
        var telemetryData = new List<TelemetryData>
        {
            new TelemetryData
            {
                Timestamp = DateTime.UtcNow.ToString("O"),
                Latitude = 40.7128,
                Longitude = -74.0060,
                Speed = 50.0,
                Temperature = 25.0,
                Altitude = 100.0,
                Heading = 180.0
            },
            new TelemetryData
            {
                Timestamp = DateTime.UtcNow.AddSeconds(1).ToString("O"),
                Latitude = 40.7130,
                Longitude = -74.0058,
                Speed = 52.0,
                Temperature = 25.5,
                Altitude = 101.0,
                Heading = 181.0
            }
        };

        // Act
        var result = await _service.AddTelemetryBatchAsync(telemetryData, "vehicle1");

        // Assert
        Assert.Equal(2, result.Count());
        Assert.All(result, r => Assert.Equal("vehicle1", r.VehicleId));
    }

    [Fact]
    public async Task GetTelemetryByVehicleIdAsync_ShouldReturnTelemetryRecords()
    {
        // Arrange
        var telemetry1 = new TelemetryRecord
        {
            VehicleId = "vehicle1",
            Timestamp = DateTime.UtcNow.AddMinutes(-2),
            Latitude = 40.7128,
            Longitude = -74.0060,
            Speed = 50.0,
            Temperature = 25.0,
            Altitude = 100.0,
            Heading = 180.0
        };

        var telemetry2 = new TelemetryRecord
        {
            VehicleId = "vehicle1",
            Timestamp = DateTime.UtcNow.AddMinutes(-1),
            Latitude = 40.7130,
            Longitude = -74.0058,
            Speed = 52.0,
            Temperature = 25.5,
            Altitude = 101.0,
            Heading = 181.0
        };

        _context.TelemetryRecords.AddRange(telemetry1, telemetry2);
        await _context.SaveChangesAsync();

        // Act
        var result = await _service.GetTelemetryByVehicleIdAsync("vehicle1", 10);

        // Assert
        Assert.Equal(2, result.Count());
        Assert.All(result, r => Assert.Equal("vehicle1", r.VehicleId));
    }

    [Fact]
    public async Task GetLatestTelemetryAsync_ShouldReturnMostRecentRecord()
    {
        // Arrange
        var telemetry1 = new TelemetryRecord
        {
            VehicleId = "vehicle1",
            Timestamp = DateTime.UtcNow.AddMinutes(-2),
            Latitude = 40.7128,
            Longitude = -74.0060,
            Speed = 50.0,
            Temperature = 25.0,
            Altitude = 100.0,
            Heading = 180.0
        };

        var telemetry2 = new TelemetryRecord
        {
            VehicleId = "vehicle1",
            Timestamp = DateTime.UtcNow.AddMinutes(-1),
            Latitude = 40.7130,
            Longitude = -74.0058,
            Speed = 52.0,
            Temperature = 25.5,
            Altitude = 101.0,
            Heading = 181.0
        };

        _context.TelemetryRecords.AddRange(telemetry1, telemetry2);
        await _context.SaveChangesAsync();

        // Act
        var result = await _service.GetLatestTelemetryAsync("vehicle1");

        // Assert
        Assert.NotNull(result);
        Assert.Equal(40.7130, result.Latitude);
        Assert.Equal(-74.0058, result.Longitude);
    }

    [Fact]
    public async Task GetTelemetryByTimeRangeAsync_ShouldReturnRecordsInRange()
    {
        // Arrange
        var startTime = DateTime.UtcNow.AddMinutes(-10);
        var endTime = DateTime.UtcNow.AddMinutes(-5);

        var telemetry1 = new TelemetryRecord
        {
            VehicleId = "vehicle1",
            Timestamp = DateTime.UtcNow.AddMinutes(-8),
            Latitude = 40.7128,
            Longitude = -74.0060,
            Speed = 50.0,
            Temperature = 25.0,
            Altitude = 100.0,
            Heading = 180.0
        };

        var telemetry2 = new TelemetryRecord
        {
            VehicleId = "vehicle1",
            Timestamp = DateTime.UtcNow.AddMinutes(-2),
            Latitude = 40.7130,
            Longitude = -74.0058,
            Speed = 52.0,
            Temperature = 25.5,
            Altitude = 101.0,
            Heading = 181.0
        };

        _context.TelemetryRecords.AddRange(telemetry1, telemetry2);
        await _context.SaveChangesAsync();

        // Act
        var result = await _service.GetTelemetryByTimeRangeAsync("vehicle1", startTime, endTime);

        // Assert
        Assert.Single(result);
        Assert.Equal(40.7128, result.First().Latitude);
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}

