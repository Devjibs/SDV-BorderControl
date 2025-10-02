using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using SDV.BorderControl.API.Controllers;
using SDV.BorderControl.API.Models;
using SDV.BorderControl.API.Services;
using Xunit;

namespace SDV.BorderControl.API.Tests.Controllers;

public class MissionsControllerTests
{
    private readonly Mock<IMissionService> _missionServiceMock;
    private readonly Mock<ILogger<MissionsController>> _loggerMock;
    private readonly MissionsController _controller;

    public MissionsControllerTests()
    {
        _missionServiceMock = new Mock<IMissionService>();
        _loggerMock = new Mock<ILogger<MissionsController>>();
        _controller = new MissionsController(_missionServiceMock.Object, _loggerMock.Object);
    }

    [Fact]
    public async Task GetMissions_ShouldReturnOkResult()
    {
        // Arrange
        var missions = new List<Mission>
        {
            new Mission
            {
                MissionId = "mission1",
                Name = "Test Mission 1",
                StartTime = DateTime.UtcNow,
                EndTime = DateTime.UtcNow.AddHours(4),
                VehicleIds = new List<string> { "vehicle1" }
            }
        };

        _missionServiceMock.Setup(x => x.GetAllMissionsAsync()).ReturnsAsync(missions);

        // Act
        var result = await _controller.GetMissions();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var returnedMissions = Assert.IsType<List<Mission>>(okResult.Value);
        Assert.Single(returnedMissions);
    }

    [Fact]
    public async Task GetMission_ShouldReturnNotFound_WhenMissionDoesNotExist()
    {
        // Arrange
        _missionServiceMock.Setup(x => x.GetMissionByIdAsync("nonexistent")).ReturnsAsync((Mission?)null);

        // Act
        var result = await _controller.GetMission("nonexistent");

        // Assert
        var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
        Assert.Contains("not found", notFoundResult.Value?.ToString());
    }

    [Fact]
    public async Task CreateMission_ShouldReturnCreatedAtAction()
    {
        // Arrange
        var mission = new Mission
        {
            MissionId = "mission1",
            Name = "Test Mission",
            StartTime = DateTime.UtcNow,
            EndTime = DateTime.UtcNow.AddHours(4),
            VehicleIds = new List<string> { "vehicle1" }
        };

        _missionServiceMock.Setup(x => x.CreateMissionAsync(It.IsAny<Mission>())).ReturnsAsync(mission);

        // Act
        var result = await _controller.CreateMission(mission);

        // Assert
        var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result);
        Assert.Equal("GetMission", createdAtActionResult.ActionName);
        Assert.Equal(mission.MissionId, createdAtActionResult.RouteValues?["missionId"]);
    }

    [Fact]
    public async Task UpdateMission_ShouldReturnNotFound_WhenMissionDoesNotExist()
    {
        // Arrange
        var mission = new Mission
        {
            MissionId = "nonexistent",
            Name = "Test Mission",
            StartTime = DateTime.UtcNow,
            EndTime = DateTime.UtcNow.AddHours(4),
            VehicleIds = new List<string> { "vehicle1" }
        };

        _missionServiceMock.Setup(x => x.UpdateMissionAsync("nonexistent", It.IsAny<Mission>())).ReturnsAsync((Mission?)null);

        // Act
        var result = await _controller.UpdateMission("nonexistent", mission);

        // Assert
        var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
        Assert.Contains("not found", notFoundResult.Value?.ToString());
    }

    [Fact]
    public async Task DeleteMission_ShouldReturnNoContent_WhenMissionExists()
    {
        // Arrange
        _missionServiceMock.Setup(x => x.DeleteMissionAsync("mission1")).ReturnsAsync(true);

        // Act
        var result = await _controller.DeleteMission("mission1");

        // Assert
        Assert.IsType<NoContentResult>(result);
    }

    [Fact]
    public async Task DeleteMission_ShouldReturnNotFound_WhenMissionDoesNotExist()
    {
        // Arrange
        _missionServiceMock.Setup(x => x.DeleteMissionAsync("nonexistent")).ReturnsAsync(false);

        // Act
        var result = await _controller.DeleteMission("nonexistent");

        // Assert
        var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
        Assert.Contains("not found", notFoundResult.Value?.ToString());
    }

    [Fact]
    public async Task GetMissionsByVehicle_ShouldReturnOkResult()
    {
        // Arrange
        var missions = new List<Mission>
        {
            new Mission
            {
                MissionId = "mission1",
                Name = "Test Mission 1",
                StartTime = DateTime.UtcNow,
                EndTime = DateTime.UtcNow.AddHours(4),
                VehicleIds = new List<string> { "vehicle1" }
            }
        };

        _missionServiceMock.Setup(x => x.GetMissionsByVehicleIdAsync("vehicle1")).ReturnsAsync(missions);

        // Act
        var result = await _controller.GetMissionsByVehicle("vehicle1");

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var returnedMissions = Assert.IsType<List<Mission>>(okResult.Value);
        Assert.Single(returnedMissions);
    }

    [Fact]
    public async Task UpdateMissionStatus_ShouldReturnOkResult()
    {
        // Arrange
        var mission = new Mission
        {
            MissionId = "mission1",
            Name = "Test Mission",
            StartTime = DateTime.UtcNow,
            EndTime = DateTime.UtcNow.AddHours(4),
            VehicleIds = new List<string> { "vehicle1" },
            Status = MissionStatus.Active
        };

        var request = new UpdateMissionStatusRequest { Status = MissionStatus.Active };

        _missionServiceMock.Setup(x => x.UpdateMissionStatusAsync("mission1", MissionStatus.Active)).ReturnsAsync(mission);

        // Act
        var result = await _controller.UpdateMissionStatus("mission1", request);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var returnedMission = Assert.IsType<Mission>(okResult.Value);
        Assert.Equal(MissionStatus.Active, returnedMission.Status);
    }
}

