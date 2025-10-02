using Microsoft.EntityFrameworkCore;
using SDV.BorderControl.API.Data;
using SDV.BorderControl.API.Models;

namespace SDV.BorderControl.API.Services;

public class TelemetryService : ITelemetryService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<TelemetryService> _logger;

    public TelemetryService(ApplicationDbContext context, ILogger<TelemetryService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<IEnumerable<TelemetryRecord>> GetTelemetryByVehicleIdAsync(string vehicleId, int limit = 100)
    {
        try
        {
            return await _context.TelemetryRecords
                .Where(t => t.VehicleId == vehicleId)
                .OrderByDescending(t => t.Timestamp)
                .Take(limit)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving telemetry for vehicle {VehicleId}", vehicleId);
            throw;
        }
    }

    public async Task<TelemetryRecord?> GetLatestTelemetryAsync(string vehicleId)
    {
        try
        {
            return await _context.TelemetryRecords
                .Where(t => t.VehicleId == vehicleId)
                .OrderByDescending(t => t.Timestamp)
                .FirstOrDefaultAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving latest telemetry for vehicle {VehicleId}", vehicleId);
            throw;
        }
    }

    public async Task<TelemetryRecord> AddTelemetryAsync(TelemetryData telemetryData, string vehicleId)
    {
        try
        {
            var record = new TelemetryRecord
            {
                VehicleId = vehicleId,
                Timestamp = DateTime.Parse(telemetryData.Timestamp),
                Latitude = telemetryData.Latitude,
                Longitude = telemetryData.Longitude,
                Speed = telemetryData.Speed,
                Temperature = telemetryData.Temperature,
                Altitude = telemetryData.Altitude,
                Heading = telemetryData.Heading,
                AdditionalData = telemetryData.AdditionalData
            };

            _context.TelemetryRecords.Add(record);
            await _context.SaveChangesAsync();

            _logger.LogDebug("Added telemetry record for vehicle {VehicleId} at {Timestamp}",
                vehicleId, telemetryData.Timestamp);

            return record;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding telemetry for vehicle {VehicleId}", vehicleId);
            throw;
        }
    }

    public async Task<IEnumerable<TelemetryRecord>> AddTelemetryBatchAsync(IEnumerable<TelemetryData> telemetryData, string vehicleId)
    {
        try
        {
            var records = telemetryData.Select(data => new TelemetryRecord
            {
                VehicleId = vehicleId,
                Timestamp = DateTime.Parse(data.Timestamp),
                Latitude = data.Latitude,
                Longitude = data.Longitude,
                Speed = data.Speed,
                Temperature = data.Temperature,
                Altitude = data.Altitude,
                Heading = data.Heading,
                AdditionalData = data.AdditionalData
            }).ToList();

            _context.TelemetryRecords.AddRange(records);
            await _context.SaveChangesAsync();

            _logger.LogDebug("Added {Count} telemetry records for vehicle {VehicleId}",
                records.Count, vehicleId);

            return records;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding telemetry batch for vehicle {VehicleId}", vehicleId);
            throw;
        }
    }

    public async Task<IEnumerable<TelemetryRecord>> GetTelemetryByTimeRangeAsync(string vehicleId, DateTime startTime, DateTime endTime)
    {
        try
        {
            return await _context.TelemetryRecords
                .Where(t => t.VehicleId == vehicleId &&
                           t.Timestamp >= startTime &&
                           t.Timestamp <= endTime)
                .OrderBy(t => t.Timestamp)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving telemetry for vehicle {VehicleId} in time range {StartTime} to {EndTime}",
                vehicleId, startTime, endTime);
            throw;
        }
    }
}

