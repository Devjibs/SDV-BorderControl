using AutoMapper;
using SDV.BorderControl.API.Core.DTOs;
using SDV.BorderControl.API.Core.Entities;

namespace SDV.BorderControl.API.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<Mission, MissionResponse>();
        CreateMap<CreateMissionRequest, Mission>();
        CreateMap<UpdateMissionRequest, Mission>();

        CreateMap<Vehicle, VehicleResponse>();
        CreateMap<CreateVehicleRequest, Vehicle>();
        CreateMap<UpdateVehicleRequest, Vehicle>();

        CreateMap<Alert, AlertResponse>();
        CreateMap<CreateAlertRequest, Alert>();

        CreateMap<TelemetryRecord, TelemetryResponse>();
        CreateMap<TelemetryData, TelemetryRecord>()
            .ForMember(dest => dest.Timestamp, opt => opt.MapFrom(src => DateTime.Parse(src.Timestamp)));
    }
}
