using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SDV.BorderControl.API.Data;
using SDV.BorderControl.API.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SDV.BorderControl.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AnalyticsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<AnalyticsController> _logger;

        public AnalyticsController(ApplicationDbContext context, ILogger<AnalyticsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Get overall system analytics
        /// </summary>
        [HttpGet("overview")]
        public async Task<ActionResult<object>> GetOverview()
        {
            try
            {
                var totalVehicles = await _context.Vehicles.CountAsync();
                var onlineVehicles = await _context.Vehicles.CountAsync(v => v.Status == VehicleStatus.Online);
                var activeMissions = await _context.Missions.CountAsync(m => m.Status == MissionStatus.Active);
                var totalAlerts = await _context.Alerts.CountAsync();
                var criticalAlerts = await _context.Alerts.CountAsync(a => a.Severity == AlertSeverity.Critical);

                // Get recent telemetry count (last 24 hours)
                var yesterday = DateTime.UtcNow.AddDays(-1);
                var recentTelemetry = await _context.TelemetryRecords
                    .CountAsync(t => t.Timestamp >= yesterday);

                return Ok(new
                {
                    totalVehicles,
                    onlineVehicles,
                    offlineVehicles = totalVehicles - onlineVehicles,
                    activeMissions,
                    totalAlerts,
                    criticalAlerts,
                    recentTelemetry,
                    systemHealth = CalculateSystemHealth(onlineVehicles, totalVehicles, criticalAlerts)
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving analytics overview");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get vehicle performance analytics
        /// </summary>
        [HttpGet("vehicles/performance")]
        public async Task<ActionResult<object>> GetVehiclePerformance()
        {
            try
            {
                var vehicles = await _context.Vehicles.ToListAsync();
                var telemetryRecords = await _context.TelemetryRecords.ToListAsync();
                var alerts = await _context.Alerts.ToListAsync();

                var performanceData = vehicles.Select(v =>
                {
                    var vehicleTelemetry = telemetryRecords.Where(t => t.VehicleId == v.VehicleId).ToList();
                    var vehicleAlerts = alerts.Where(a => a.VehicleId == v.VehicleId).ToList();

                    return new
                    {
                        vehicleId = v.VehicleId,
                        name = v.Name,
                        type = v.Type.ToString(),
                        status = v.Status.ToString(),
                        totalTelemetry = vehicleTelemetry.Count,
                        averageSpeed = vehicleTelemetry.Any() ? vehicleTelemetry.Average(t => t.Speed) : 0,
                        averageTemperature = vehicleTelemetry.Any() ? vehicleTelemetry.Average(t => t.Temperature) : 0,
                        totalAlerts = vehicleAlerts.Count,
                        criticalAlerts = vehicleAlerts.Count(a => a.Severity == AlertSeverity.Critical),
                        lastSeen = v.LastSeen,
                        operationalHours = CalculateOperationalHours(vehicleTelemetry),
                        efficiency = CalculateEfficiency(vehicleTelemetry, vehicleAlerts)
                    };
                }).OrderByDescending(v => v.efficiency).ToList();

                return Ok(performanceData);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving vehicle performance analytics");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get telemetry trends over time
        /// </summary>
        [HttpGet("telemetry/trends")]
        public async Task<ActionResult<object>> GetTelemetryTrends([FromQuery] int hours = 24)
        {
            try
            {
                var startTime = DateTime.UtcNow.AddHours(-hours);
                var telemetryData = await _context.TelemetryRecords
                    .Where(t => t.Timestamp >= startTime)
                    .OrderBy(t => t.Timestamp)
                    .ToListAsync();

                // Group by hour for trends
                var hourlyTrends = telemetryData
                    .GroupBy(t => t.Timestamp.Date.AddHours(t.Timestamp.Hour))
                    .Select(g => new
                    {
                        timestamp = g.Key,
                        averageSpeed = g.Average(t => t.Speed),
                        averageTemperature = g.Average(t => t.Temperature),
                        averageAltitude = g.Average(t => t.Altitude),
                        recordCount = g.Count()
                    })
                    .OrderBy(t => t.timestamp)
                    .ToList();

                // Get speed distribution
                var speedDistribution = telemetryData
                    .GroupBy(t => (int)(t.Speed / 20) * 20) // Group by 20 km/h ranges
                    .Select(g => new
                    {
                        speedRange = $"{g.Key}-{g.Key + 19} km/h",
                        count = g.Count()
                    })
                    .OrderBy(s => s.speedRange)
                    .ToList();

                return Ok(new
                {
                    hourlyTrends,
                    speedDistribution,
                    totalRecords = telemetryData.Count,
                    averageSpeed = telemetryData.Any() ? telemetryData.Average(t => t.Speed) : 0,
                    averageTemperature = telemetryData.Any() ? telemetryData.Average(t => t.Temperature) : 0
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving telemetry trends");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get alert analytics and patterns
        /// </summary>
        [HttpGet("alerts/patterns")]
        public async Task<ActionResult<object>> GetAlertPatterns()
        {
            try
            {
                var alerts = await _context.Alerts.ToListAsync();
                var vehicles = await _context.Vehicles.ToListAsync();

                // Alert severity distribution
                var severityDistribution = alerts
                    .GroupBy(a => a.Severity.ToString())
                    .Select(g => new
                    {
                        severity = g.Key,
                        count = g.Count(),
                        percentage = Math.Round((double)g.Count() / alerts.Count * 100, 1)
                    })
                    .OrderByDescending(s => s.count)
                    .ToList();

                // Alert types distribution
                var typeDistribution = alerts
                    .GroupBy(a => a.Type.ToString())
                    .Select(g => new
                    {
                        type = g.Key,
                        count = g.Count(),
                        percentage = Math.Round((double)g.Count() / alerts.Count * 100, 1)
                    })
                    .OrderByDescending(t => t.count)
                    .ToList();

                // Alerts by vehicle
                var alertsByVehicle = alerts
                    .GroupBy(a => new
                    {
                        a.VehicleId,
                        VehicleName = vehicles.FirstOrDefault(v => v.VehicleId == a.VehicleId)?.Name ?? "Unknown"
                    })
                    .Select(g => new
                    {
                        vehicleId = g.Key.VehicleId,
                        vehicleName = g.Key.VehicleName,
                        totalAlerts = g.Count(),
                        criticalAlerts = g.Count(a => a.Severity == AlertSeverity.Critical),
                        lastAlert = g.Max(a => a.Timestamp)
                    })
                    .OrderByDescending(v => v.totalAlerts)
                    .ToList();

                // Hourly alert patterns
                var hourlyPatterns = alerts
                    .GroupBy(a => a.Timestamp.Hour)
                    .Select(g => new
                    {
                        hour = g.Key,
                        count = g.Count(),
                        averageSeverity = g.Average(a => (int)a.Severity)
                    })
                    .OrderBy(h => h.hour)
                    .ToList();

                return Ok(new
                {
                    severityDistribution,
                    typeDistribution,
                    alertsByVehicle,
                    hourlyPatterns,
                    totalAlerts = alerts.Count,
                    resolvedAlerts = alerts.Count(a => a.Status == AlertStatus.Resolved),
                    acknowledgedAlerts = alerts.Count(a => a.Status == AlertStatus.Acknowledged),
                    openAlerts = alerts.Count(a => a.Status == AlertStatus.Open)
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving alert patterns");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get mission analytics
        /// </summary>
        [HttpGet("missions/analytics")]
        public async Task<ActionResult<object>> GetMissionAnalytics()
        {
            try
            {
                var missions = await _context.Missions.ToListAsync();

                // Mission status distribution
                var statusDistribution = missions
                    .GroupBy(m => m.Status.ToString())
                    .Select(g => new
                    {
                        status = g.Key,
                        count = g.Count(),
                        percentage = Math.Round((double)g.Count() / missions.Count * 100, 1)
                    })
                    .ToList();

                // Mission duration analysis
                var completedMissions = missions.Where(m => m.Status == MissionStatus.Completed).ToList();
                var durationAnalysis = completedMissions.Any() ? new
                {
                    averageDuration = completedMissions.Average(m => (m.EndTime - m.StartTime).TotalHours),
                    shortestDuration = completedMissions.Min(m => (m.EndTime - m.StartTime).TotalHours),
                    longestDuration = completedMissions.Max(m => (m.EndTime - m.StartTime).TotalHours)
                } : null;

                // Mission success rate
                var successRate = missions.Any() ?
                    Math.Round((double)completedMissions.Count / missions.Count * 100, 1) : 0;

                return Ok(new
                {
                    statusDistribution,
                    durationAnalysis,
                    successRate,
                    totalMissions = missions.Count,
                    activeMissions = missions.Count(m => m.Status == MissionStatus.Active),
                    completedMissions = completedMissions.Count,
                    cancelledMissions = missions.Count(m => m.Status == MissionStatus.Cancelled)
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving mission analytics");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get geographic analytics
        /// </summary>
        [HttpGet("geographic/heatmap")]
        public async Task<ActionResult<object>> GetGeographicHeatmap()
        {
            try
            {
                var recentTelemetry = await _context.TelemetryRecords
                    .Where(t => t.Timestamp >= DateTime.UtcNow.AddDays(-7))
                    .Select(t => new
                    {
                        latitude = t.Latitude,
                        longitude = t.Longitude,
                        timestamp = t.Timestamp,
                        vehicleId = t.VehicleId
                    })
                    .ToListAsync();

                // Create heatmap data points
                var heatmapData = recentTelemetry
                    .GroupBy(t => new
                    {
                        Lat = Math.Round(t.latitude, 2),
                        Lng = Math.Round(t.longitude, 2)
                    })
                    .Select(g => new
                    {
                        latitude = g.Key.Lat,
                        longitude = g.Key.Lng,
                        intensity = g.Count(),
                        lastActivity = g.Max(t => t.timestamp)
                    })
                    .OrderByDescending(h => h.intensity)
                    .ToList();

                return Ok(new
                {
                    heatmapData,
                    totalPoints = recentTelemetry.Count,
                    uniqueLocations = heatmapData.Count,
                    coverageArea = CalculateCoverageArea(heatmapData.Cast<object>().ToList())
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving geographic heatmap");
                return StatusCode(500, "Internal server error");
            }
        }

        private double CalculateSystemHealth(int onlineVehicles, int totalVehicles, int criticalAlerts)
        {
            if (totalVehicles == 0) return 0;

            var vehicleHealth = (double)onlineVehicles / totalVehicles * 100;
            var alertPenalty = Math.Min(criticalAlerts * 5, 50); // Max 50% penalty for critical alerts

            return Math.Max(0, vehicleHealth - alertPenalty);
        }

        private double CalculateOperationalHours(List<TelemetryRecord> telemetryRecords)
        {
            if (!telemetryRecords.Any()) return 0;

            var timeSpan = telemetryRecords.Max(t => t.Timestamp) - telemetryRecords.Min(t => t.Timestamp);
            return timeSpan.TotalHours;
        }

        private double CalculateEfficiency(List<TelemetryRecord> telemetryRecords, List<Alert> alerts)
        {
            if (!telemetryRecords.Any()) return 0;

            var averageSpeed = telemetryRecords.Average(t => t.Speed);
            var alertPenalty = alerts.Count(a => a.Severity == AlertSeverity.Critical) * 10;
            var temperaturePenalty = telemetryRecords.Count(t => t.Temperature > 80) * 5;

            return Math.Max(0, averageSpeed - alertPenalty - temperaturePenalty);
        }

        private object CalculateCoverageArea(List<object> heatmapData)
        {
            if (!heatmapData.Any()) return new { area = 0, unit = "km²" };

            var latitudes = heatmapData.Select(h =>
            {
                var obj = h as dynamic;
                return (double)obj.latitude;
            }).ToList();
            var longitudes = heatmapData.Select(h =>
            {
                var obj = h as dynamic;
                return (double)obj.longitude;
            }).ToList();

            var latRange = latitudes.Max() - latitudes.Min();
            var lngRange = longitudes.Max() - longitudes.Min();

            // Rough approximation of area in km²
            var area = latRange * lngRange * 111 * 111; // 1 degree ≈ 111 km

            return new { area = Math.Round(area, 2), unit = "km²" };
        }
    }
}