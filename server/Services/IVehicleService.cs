using SDV.BorderControl.API.Models;

namespace SDV.BorderControl.API.Services
{
    public interface IVehicleService
    {
        Task<IEnumerable<Vehicle>> GetVehiclesAsync();
        Task<Vehicle?> GetVehicleByIdAsync(string vehicleId);
        Task<Vehicle> CreateVehicleAsync(Vehicle vehicle);
        Task<Vehicle> CreateVehicleFromRequestAsync(CreateVehicleRequest request);
        Task<Vehicle> UpdateVehicleAsync(Vehicle vehicle);
        Task<bool> DeleteVehicleAsync(string vehicleId);
    }
}
