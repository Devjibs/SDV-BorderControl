using Microsoft.EntityFrameworkCore;
using SDV.BorderControl.API.Data;
using SDV.BorderControl.API.Models;

namespace SDV.BorderControl.API.Services
{
    public class VehicleService : IVehicleService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<VehicleService> _logger;

        public VehicleService(ApplicationDbContext context, ILogger<VehicleService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<IEnumerable<Vehicle>> GetVehiclesAsync()
        {
            try
            {
                return await _context.Vehicles
                    .OrderBy(v => v.Name)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving vehicles");
                throw;
            }
        }

        public async Task<Vehicle?> GetVehicleByIdAsync(string vehicleId)
        {
            try
            {
                return await _context.Vehicles
                    .FirstOrDefaultAsync(v => v.VehicleId == vehicleId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving vehicle {VehicleId}", vehicleId);
                throw;
            }
        }

        public async Task<Vehicle> CreateVehicleAsync(Vehicle vehicle)
        {
            try
            {
                vehicle.VehicleId = vehicle.VehicleId ?? $"vehicle_{DateTime.UtcNow.Ticks}";
                vehicle.CreatedAt = DateTime.UtcNow;

                _context.Vehicles.Add(vehicle);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Created vehicle {VehicleId}", vehicle.VehicleId);
                return vehicle;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating vehicle");
                throw;
            }
        }

        public async Task<Vehicle> CreateVehicleFromRequestAsync(CreateVehicleRequest request)
        {
            try
            {
                var vehicle = new Vehicle
                {
                    VehicleId = string.IsNullOrEmpty(request.VehicleId) ? $"vehicle_{DateTime.UtcNow.Ticks}" : request.VehicleId,
                    Name = request.Name,
                    Type = Enum.Parse<VehicleType>(request.Type),
                    Status = Enum.Parse<VehicleStatus>(request.Status),
                    ImageUrl = request.ImageUrl,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Vehicles.Add(vehicle);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Created vehicle {VehicleId}", vehicle.VehicleId);
                return vehicle;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating vehicle from request");
                throw;
            }
        }

        public async Task<Vehicle> UpdateVehicleAsync(Vehicle vehicle)
        {
            try
            {
                var existingVehicle = await _context.Vehicles
                    .FirstOrDefaultAsync(v => v.VehicleId == vehicle.VehicleId);

                if (existingVehicle == null)
                {
                    throw new ArgumentException($"Vehicle {vehicle.VehicleId} not found");
                }

                existingVehicle.Name = vehicle.Name;
                existingVehicle.Type = vehicle.Type;
                existingVehicle.Status = vehicle.Status;
                existingVehicle.ImageUrl = vehicle.ImageUrl;
                existingVehicle.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Updated vehicle {VehicleId}", vehicle.VehicleId);
                return existingVehicle;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating vehicle {VehicleId}", vehicle.VehicleId);
                throw;
            }
        }

        public async Task<bool> DeleteVehicleAsync(string vehicleId)
        {
            try
            {
                var vehicle = await _context.Vehicles
                    .FirstOrDefaultAsync(v => v.VehicleId == vehicleId);

                if (vehicle == null)
                {
                    return false;
                }

                _context.Vehicles.Remove(vehicle);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Deleted vehicle {VehicleId}", vehicleId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting vehicle {VehicleId}", vehicleId);
                throw;
            }
        }
    }
}
