using AutoMapper;
using SDV.BorderControl.API.Core.DTOs;
using SDV.BorderControl.API.Core.Entities;
using SDV.BorderControl.API.Core.Interfaces;

namespace SDV.BorderControl.API.Application.Services;

public class MissionService : IMissionService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public MissionService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<IEnumerable<MissionResponse>> GetAllMissionsAsync()
    {
        var missions = await _unitOfWork.Missions.GetAllAsync();
        return _mapper.Map<IEnumerable<MissionResponse>>(missions);
    }

    public async Task<MissionResponse?> GetMissionByIdAsync(string missionId)
    {
        var mission = await _unitOfWork.Missions.GetByIdAsync(missionId);
        return mission == null ? null : _mapper.Map<MissionResponse>(mission);
    }

    public async Task<MissionResponse> CreateMissionAsync(CreateMissionRequest request)
    {
        var mission = _mapper.Map<Mission>(request);
        mission.MissionId = Guid.NewGuid().ToString();
        mission.CreatedAt = DateTime.UtcNow;

        await _unitOfWork.Missions.AddAsync(mission);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<MissionResponse>(mission);
    }

    public async Task<MissionResponse> UpdateMissionAsync(string missionId, UpdateMissionRequest request)
    {
        var mission = await _unitOfWork.Missions.GetByIdAsync(missionId);
        if (mission == null)
            throw new KeyNotFoundException($"Mission with ID {missionId} not found");

        _mapper.Map(request, mission);
        mission.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.Missions.UpdateAsync(mission);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<MissionResponse>(mission);
    }

    public async Task<bool> DeleteMissionAsync(string missionId)
    {
        var mission = await _unitOfWork.Missions.GetByIdAsync(missionId);
        if (mission == null)
            return false;

        await _unitOfWork.Missions.DeleteAsync(mission);
        await _unitOfWork.SaveChangesAsync();
        return true;
    }

    public async Task<MissionResponse> UpdateMissionStatusAsync(string missionId, MissionStatus status)
    {
        var mission = await _unitOfWork.Missions.GetByIdAsync(missionId);
        if (mission == null)
            throw new KeyNotFoundException($"Mission with ID {missionId} not found");

        mission.Status = status;
        mission.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.Missions.UpdateAsync(mission);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<MissionResponse>(mission);
    }
}
