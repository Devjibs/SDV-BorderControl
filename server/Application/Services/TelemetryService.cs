using AutoMapper;
using SDV.BorderControl.API.Core.DTOs;
using SDV.BorderControl.API.Core.Entities;
using SDV.BorderControl.API.Core.Interfaces;

namespace SDV.BorderControl.API.Application.Services;

public class TelemetryService : ITelemetryService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public TelemetryService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<IEnumerable<TelemetryResponse>> GetTelemetryRecordsAsync()
    {
        var records = await _unitOfWork.TelemetryRecords.GetAllAsync();
        return _mapper.Map<IEnumerable<TelemetryResponse>>(records);
    }

    public async Task<IEnumerable<TelemetryResponse>> GetTelemetryByVehicleIdAsync(string vehicleId)
    {
        var records = await _unitOfWork.TelemetryRecords.FindAsync(t => t.VehicleId == vehicleId);
        return _mapper.Map<IEnumerable<TelemetryResponse>>(records);
    }

    public async Task<TelemetryResponse> CreateTelemetryRecordAsync(TelemetryData data, string vehicleId)
    {
        var record = _mapper.Map<TelemetryRecord>(data);
        record.VehicleId = vehicleId;

        await _unitOfWork.TelemetryRecords.AddAsync(record);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<TelemetryResponse>(record);
    }

    public async Task<IEnumerable<TelemetryResponse>> CreateTelemetryRecordsAsync(TelemetryRequest request)
    {
        var records = new List<TelemetryRecord>();

        foreach (var data in request.Records)
        {
            var record = _mapper.Map<TelemetryRecord>(data);
            record.VehicleId = request.VehicleId;
            records.Add(record);
        }

        await _unitOfWork.TelemetryRecords.AddRangeAsync(records);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<IEnumerable<TelemetryResponse>>(records);
    }
}
