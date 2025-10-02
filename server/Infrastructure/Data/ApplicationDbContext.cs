using Microsoft.EntityFrameworkCore;
using SDV.BorderControl.API.Core.Entities;

namespace SDV.BorderControl.API.Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<Mission> Missions { get; set; }
    public DbSet<Vehicle> Vehicles { get; set; }
    public DbSet<Alert> Alerts { get; set; }
    public DbSet<TelemetryRecord> TelemetryRecords { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Mission>(entity =>
        {
            entity.HasKey(e => e.MissionId);
            entity.Property(e => e.VehicleIds)
                .HasConversion(
                    v => string.Join(',', v),
                    v => v.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList());
        });

        modelBuilder.Entity<Vehicle>(entity =>
        {
            entity.HasKey(e => e.VehicleId);
        });

        modelBuilder.Entity<Alert>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.AdditionalData)
                .HasConversion(
                    v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions)null!),
                    v => System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(v, (System.Text.Json.JsonSerializerOptions)null!) ?? new Dictionary<string, object>());
        });

        modelBuilder.Entity<TelemetryRecord>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.AdditionalData)
                .HasConversion(
                    v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions)null!),
                    v => System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(v, (System.Text.Json.JsonSerializerOptions)null!) ?? new Dictionary<string, object>());
        });
    }
}
