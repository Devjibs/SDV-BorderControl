using Microsoft.AspNetCore.Mvc;
using SDV.BorderControl.API.Core.DTOs;
using SDV.BorderControl.API.Core.Interfaces;

namespace SDV.BorderControl.API.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VehiclesController : ControllerBase
{
    private readonly IVehicleService _vehicleService;

    public VehiclesController(IVehicleService vehicleService)
    {
        _vehicleService = vehicleService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<VehicleResponse>>> GetVehicles()
    {
        var vehicles = await _vehicleService.GetAllVehiclesAsync();
        return Ok(vehicles);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<VehicleResponse>> GetVehicle(string id)
    {
        var vehicle = await _vehicleService.GetVehicleByIdAsync(id);
        if (vehicle == null)
            return NotFound();

        return Ok(vehicle);
    }

    [HttpPost]
    public async Task<ActionResult<VehicleResponse>> CreateVehicle(CreateVehicleRequest request)
    {
        var vehicle = await _vehicleService.CreateVehicleAsync(request);
        return CreatedAtAction(nameof(GetVehicle), new { id = vehicle.VehicleId }, vehicle);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<VehicleResponse>> UpdateVehicle(string id, UpdateVehicleRequest request)
    {
        try
        {
            var vehicle = await _vehicleService.UpdateVehicleAsync(id, request);
            return Ok(vehicle);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteVehicle(string id)
    {
        var result = await _vehicleService.DeleteVehicleAsync(id);
        if (!result)
            return NotFound();

        return NoContent();
    }
}
