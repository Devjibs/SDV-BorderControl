using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using SDV.BorderControl.API.Data;
using SDV.BorderControl.API.Models;
using SDV.BorderControl.API.Services;
using Xunit;

namespace SDV.BorderControl.API.Tests;

public class MissionServiceTests : IDisposable
{
    private readonly ApplicationDbContext _context;
    private readonly MissionService _service;
    private readonly Mock<ILogger<MissionService>> _loggerMock;

    public MissionServiceTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new ApplicationDbContext(options);
        _loggerMock = new Mock<ILogger<MissionService>>();
        _service = new MissionService(_context, _loggerMock.Object);
    }

    [Fact]
    public async Task CreateMissionAsync_ShouldCreateMission()
    {
        // Arrange
        var mission = new Mission
        {
            MissionId = "test-mission-1",
            Name = "Test Mission",
            StartTime = DateTime.UtcNow,
            EndTime = DateTime.UtcNow.AddHours(4),
            VehicleIds = new List<string> { "vehicle1", "vehicle2" }
        };

        // Act
        var result = await _service.CreateMissionAsync(mission);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(mission.MissionId, result.MissionId);
        Assert.Equal(mission.Name, result.Name);
        Assert.Equal(2, result.VehicleIds.Count);
    }

    [Fact]
    public async Task GetMissionByIdAsync_ShouldReturnMission()
    {
        // Arrange
        var mission = new Mission
        {
            MissionId = "test-mission-1",
            Name = "Test Mission",
            StartTime = DateTime.UtcNow,
            EndTime = DateTime.UtcNow.AddHours(4),
            VehicleIds = new List<string> { "vehicle1" }
        };

        _context.Missions.Add(mission);
        await _context.SaveChangesAsync();

        // Act
        var result = await _service.GetMissionByIdAsync("test-mission-1");

        // Assert
        Assert.NotNull(result);
        Assert.Equal("test-mission-1", result.MissionId);
        Assert.Equal("Test Mission", result.Name);
    }

    [Fact]
    public async Task UpdateMissionAsync_ShouldUpdateMission()
    {
        // Arrange
        var mission = new Mission
        {
            MissionId = "test-mission-1",
            Name = "Original Name",
            StartTime = DateTime.UtcNow,
            EndTime = DateTime.UtcNow.AddHours(4),
            VehicleIds = new List<string> { "vehicle1" }
        };

        _context.Missions.Add(mission);
        await _context.SaveChangesAsync();

        var updatedMission = new Mission
        {
            MissionId = "test-mission-1",
            Name = "Updated Name",
            StartTime = DateTime.UtcNow,
            EndTime = DateTime.UtcNow.AddHours(6),
            VehicleIds = new List<string> { "vehicle1", "vehicle2" }
        };

        // Act
        var result = await _service.UpdateMissionAsync("test-mission-1", updatedMission);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Updated Name", result.Name);
        Assert.Equal(2, result.VehicleIds.Count);
    }

    [Fact]
    public async Task DeleteMissionAsync_ShouldDeleteMission()
    {
        // Arrange
        var mission = new Mission
        {
            MissionId = "test-mission-1",
            Name = "Test Mission",
            StartTime = DateTime.UtcNow,
            EndTime = DateTime.UtcNow.AddHours(4),
            VehicleIds = new List<string> { "vehicle1" }
        };

        _context.Missions.Add(mission);
        await _context.SaveChangesAsync();

        // Act
        var result = await _service.DeleteMissionAsync("test-mission-1");

        // Assert
        Assert.True(result);
        var deletedMission = await _context.Missions.FindAsync("test-mission-1");
        Assert.Null(deletedMission);
    }

    [Fact]
    public async Task GetMissionsByVehicleIdAsync_ShouldReturnMissionsForVehicle()
    {
        // Arrange
        var mission1 = new Mission
        {
            MissionId = "mission-1",
            Name = "Mission 1",
            StartTime = DateTime.UtcNow,
            EndTime = DateTime.UtcNow.AddHours(4),
            VehicleIds = new List<string> { "vehicle1", "vehicle2" }
        };

        var mission2 = new Mission
        {
            MissionId = "mission-2",
            Name = "Mission 2",
            StartTime = DateTime.UtcNow,
            EndTime = DateTime.UtcNow.AddHours(4),
            VehicleIds = new List<string> { "vehicle2", "vehicle3" }
        };

        _context.Missions.AddRange(mission1, mission2);
        await _context.SaveChangesAsync();

        // Act
        var result = await _service.GetMissionsByVehicleIdAsync("vehicle2");

        // Assert
        Assert.Equal(2, result.Count());
        Assert.Contains(result, m => m.MissionId == "mission-1");
        Assert.Contains(result, m => m.MissionId == "mission-2");
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}

