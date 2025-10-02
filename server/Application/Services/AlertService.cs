using AutoMapper;
using SDV.BorderControl.API.Core.DTOs;
using SDV.BorderControl.API.Core.Entities;
using SDV.BorderControl.API.Core.Interfaces;

namespace SDV.BorderControl.API.Application.Services;

public class AlertService : IAlertService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public AlertService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<IEnumerable<AlertResponse>> GetAllAlertsAsync()
    {
        var alerts = await _unitOfWork.Alerts.GetAllAsync();
        return _mapper.Map<IEnumerable<AlertResponse>>(alerts);
    }

    public async Task<AlertResponse?> GetAlertByIdAsync(int alertId)
    {
        var alert = await _unitOfWork.Alerts.GetByIdAsync(alertId);
        return alert == null ? null : _mapper.Map<AlertResponse>(alert);
    }

    public async Task<AlertResponse> CreateAlertAsync(CreateAlertRequest request)
    {
        var alert = _mapper.Map<Alert>(request);
        alert.Timestamp = DateTime.UtcNow;
        alert.Status = AlertStatus.Open;

        await _unitOfWork.Alerts.AddAsync(alert);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<AlertResponse>(alert);
    }

    public async Task<AlertResponse> AcknowledgeAlertAsync(int alertId, string acknowledgedBy)
    {
        var alert = await _unitOfWork.Alerts.GetByIdAsync(alertId);
        if (alert == null)
            throw new KeyNotFoundException($"Alert with ID {alertId} not found");

        alert.Status = AlertStatus.Acknowledged;
        alert.AcknowledgedAt = DateTime.UtcNow;
        alert.AcknowledgedBy = acknowledgedBy;

        await _unitOfWork.Alerts.UpdateAsync(alert);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<AlertResponse>(alert);
    }

    public async Task<AlertResponse> ResolveAlertAsync(int alertId, string resolvedBy)
    {
        var alert = await _unitOfWork.Alerts.GetByIdAsync(alertId);
        if (alert == null)
            throw new KeyNotFoundException($"Alert with ID {alertId} not found");

        alert.Status = AlertStatus.Resolved;
        alert.ResolvedAt = DateTime.UtcNow;
        alert.ResolvedBy = resolvedBy;

        await _unitOfWork.Alerts.UpdateAsync(alert);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<AlertResponse>(alert);
    }

    public async Task<IEnumerable<AlertResponse>> GetAlertsByVehicleIdAsync(string vehicleId)
    {
        var alerts = await _unitOfWork.Alerts.FindAsync(a => a.VehicleId == vehicleId);
        return _mapper.Map<IEnumerable<AlertResponse>>(alerts);
    }
}
