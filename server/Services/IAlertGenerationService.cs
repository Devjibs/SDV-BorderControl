using SDV.BorderControl.API.Models;

namespace SDV.BorderControl.API.Services
{
    public interface IAlertGenerationService
    {
        Task StartAlertGenerationAsync();
        Task StopAlertGenerationAsync();
        Task<bool> ShouldGenerateAlertsForVehicleAsync(string vehicleId);
    }
}
