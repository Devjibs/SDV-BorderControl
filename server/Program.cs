using Microsoft.EntityFrameworkCore;
using SDV.BorderControl.API.Data;
using SDV.BorderControl.API.Services;
using SDV.BorderControl.API.Hubs;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add Entity Framework
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add services
builder.Services.AddScoped<IMissionService, MissionService>();
builder.Services.AddScoped<ITelemetryService, TelemetryService>();
builder.Services.AddScoped<IAlertService, AlertService>();
builder.Services.AddScoped<IVehicleService, VehicleService>();
builder.Services.AddSingleton<IAlertGenerationService, AlertGenerationService>();
builder.Services.AddHostedService<TelemetryGenerationService>();

// Add SignalR
builder.Services.AddSignalR();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.WithOrigins("http://localhost:4200", "http://localhost:4201")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// Add logging
builder.Services.AddLogging();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");

app.UseRouting();

app.UseAuthorization();

app.MapControllers();
app.MapHub<TelemetryHub>("/telemetryHub");

// Ensure database is created
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    context.Database.EnsureCreated();

    // Start alert generation service
    var alertGenerationService = scope.ServiceProvider.GetRequiredService<IAlertGenerationService>();
    await alertGenerationService.StartAlertGenerationAsync();
}

app.Run("http://localhost:5001");

