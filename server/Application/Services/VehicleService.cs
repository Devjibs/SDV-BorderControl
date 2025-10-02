using AutoMapper;
using SDV.BorderControl.API.Core.DTOs;
using SDV.BorderControl.API.Core.Entities;
using SDV.BorderControl.API.Core.Interfaces;

namespace SDV.BorderControl.API.Application.Services;

public class VehicleService : IVehicleService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public VehicleService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<IEnumerable<VehicleResponse>> GetAllVehiclesAsync()
    {
        var vehicles = await _unitOfWork.Vehicles.GetAllAsync();
        return _mapper.Map<IEnumerable<VehicleResponse>>(vehicles);
    }

    public async Task<VehicleResponse?> GetVehicleByIdAsync(string vehicleId)
    {
        var vehicle = await _unitOfWork.Vehicles.GetByIdAsync(vehicleId);
        return vehicle == null ? null : _mapper.Map<VehicleResponse>(vehicle);
    }

    public async Task<VehicleResponse> CreateVehicleAsync(CreateVehicleRequest request)
    {
        var vehicle = _mapper.Map<Vehicle>(request);
        vehicle.CreatedAt = DateTime.UtcNow;

        await _unitOfWork.Vehicles.AddAsync(vehicle);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<VehicleResponse>(vehicle);
    }

    public async Task<VehicleResponse> UpdateVehicleAsync(string vehicleId, UpdateVehicleRequest request)
    {
        var vehicle = await _unitOfWork.Vehicles.GetByIdAsync(vehicleId);
        if (vehicle == null)
            throw new KeyNotFoundException($"Vehicle with ID {vehicleId} not found");

        _mapper.Map(request, vehicle);
        vehicle.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.Vehicles.UpdateAsync(vehicle);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<VehicleResponse>(vehicle);
    }

    public async Task<bool> DeleteVehicleAsync(string vehicleId)
    {
        var vehicle = await _unitOfWork.Vehicles.GetByIdAsync(vehicleId);
        if (vehicle == null)
            return false;

        await _unitOfWork.Vehicles.DeleteAsync(vehicle);
        await _unitOfWork.SaveChangesAsync();
        return true;
    }
}
