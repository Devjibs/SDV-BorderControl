using Microsoft.AspNetCore.Mvc;
using SDV.BorderControl.API.Models;
using SDV.BorderControl.API.Services;

namespace SDV.BorderControl.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VehiclesController : ControllerBase
    {
        private readonly IVehicleService _vehicleService;
        private readonly ILogger<VehiclesController> _logger;

        public VehiclesController(IVehicleService vehicleService, ILogger<VehiclesController> logger)
        {
            _vehicleService = vehicleService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Vehicle>>> GetVehicles()
        {
            try
            {
                var vehicles = await _vehicleService.GetVehiclesAsync();
                return Ok(vehicles);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving vehicles");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("{vehicleId}")]
        public async Task<ActionResult<Vehicle>> GetVehicle(string vehicleId)
        {
            try
            {
                var vehicle = await _vehicleService.GetVehicleByIdAsync(vehicleId);
                if (vehicle == null)
                {
                    return NotFound();
                }
                return Ok(vehicle);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving vehicle {VehicleId}", vehicleId);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost]
        public async Task<ActionResult<Vehicle>> CreateVehicle([FromBody] CreateVehicleRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var createdVehicle = await _vehicleService.CreateVehicleFromRequestAsync(request);
                return CreatedAtAction(nameof(GetVehicle), new { vehicleId = createdVehicle.VehicleId }, createdVehicle);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating vehicle");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPut("{vehicleId}")]
        public async Task<ActionResult<Vehicle>> UpdateVehicle(string vehicleId, [FromBody] Vehicle vehicle)
        {
            try
            {
                if (vehicleId != vehicle.VehicleId)
                {
                    return BadRequest("Vehicle ID mismatch");
                }

                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var updatedVehicle = await _vehicleService.UpdateVehicleAsync(vehicle);
                return Ok(updatedVehicle);
            }
            catch (ArgumentException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating vehicle {VehicleId}", vehicleId);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpDelete("{vehicleId}")]
        public async Task<ActionResult> DeleteVehicle(string vehicleId)
        {
            try
            {
                var result = await _vehicleService.DeleteVehicleAsync(vehicleId);
                if (!result)
                {
                    return NotFound();
                }
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting vehicle {VehicleId}", vehicleId);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpDelete("empty")]
        public async Task<ActionResult> DeleteVehicleWithEmptyId()
        {
            try
            {
                var result = await _vehicleService.DeleteVehicleAsync("");
                if (!result)
                {
                    return NotFound();
                }
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting vehicle with empty ID");
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
