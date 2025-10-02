using SDV.BorderControl.API.Core.Entities;

namespace SDV.BorderControl.API.Core.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IRepository<Mission> Missions { get; }
    IRepository<Vehicle> Vehicles { get; }
    IRepository<Alert> Alerts { get; }
    IRepository<TelemetryRecord> TelemetryRecords { get; }

    Task<int> SaveChangesAsync();
    Task BeginTransactionAsync();
    Task CommitTransactionAsync();
    Task RollbackTransactionAsync();
}
