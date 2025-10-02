using Microsoft.EntityFrameworkCore;
using SDV.BorderControl.API.Models;

namespace SDV.BorderControl.API.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<Mission> Missions { get; set; }
    public DbSet<TelemetryRecord> TelemetryRecords { get; set; }
    public DbSet<Alert> Alerts { get; set; }
    // public DbSet<Vehicle> Vehicles { get; set; } // Commented out to avoid foreign key constraints

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);


        // Mission configuration
        modelBuilder.Entity<Mission>(entity =>
        {
            entity.HasKey(e => e.MissionId);
            entity.Property(e => e.MissionId).HasMaxLength(50);
            entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
            entity.Property(e => e.VehicleIds).HasConversion(
                v => string.Join(',', v),
                v => v.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList()
            );
        });

        // TelemetryRecord configuration
        modelBuilder.Entity<TelemetryRecord>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.VehicleId).HasMaxLength(50).IsRequired();
            entity.Property(e => e.AdditionalData).HasConversion(
                v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                v => System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(v, (System.Text.Json.JsonSerializerOptions?)null) ?? new Dictionary<string, object>()
            );
            entity.HasIndex(e => new { e.VehicleId, e.Timestamp });
        });

        // Alert configuration
        modelBuilder.Entity<Alert>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.VehicleId).HasMaxLength(50).IsRequired();
            entity.Property(e => e.Type).HasMaxLength(50).IsRequired();
            entity.Property(e => e.Message).HasMaxLength(500).IsRequired();
            entity.Property(e => e.AcknowledgedBy).HasMaxLength(100);
            entity.Property(e => e.ResolvedBy).HasMaxLength(100);
            entity.Property(e => e.AdditionalData).HasConversion(
                v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                v => System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(v, (System.Text.Json.JsonSerializerOptions?)null) ?? new Dictionary<string, object>()
            );
            entity.HasIndex(e => new { e.VehicleId, e.Status });
        });

        // Vehicle configuration - commented out to avoid foreign key constraints
        // modelBuilder.Entity<Vehicle>(entity =>
        // {
        //     entity.HasKey(e => e.VehicleId);
        //     entity.Property(e => e.VehicleId).HasMaxLength(50);
        //     entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
        // });
    }
}

