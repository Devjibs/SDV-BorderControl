using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using SDV.BorderControl.API.Application.Mappings;
using SDV.BorderControl.API.Application.Services;
using SDV.BorderControl.API.Core.Interfaces;
using SDV.BorderControl.API.Infrastructure.Data;
using SDV.BorderControl.API.Infrastructure.Repositories;
using SDV.BorderControl.API.Hubs;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "SDV Border Control API",
        Version = "v1",
        Description = "A comprehensive Software-Defined Vehicle platform for border control operations",
        Contact = new OpenApiContact
        {
            Name = "SDV Border Control Team",
            Email = "support@sdv-bordercontrol.com"
        }
    });

    c.IncludeXmlComments(Path.Combine(AppContext.BaseDirectory, "SDV.BorderControl.API.xml"));
});

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<IMissionService, MissionService>();
builder.Services.AddScoped<IVehicleService, VehicleService>();
builder.Services.AddScoped<IAlertService, AlertService>();
builder.Services.AddScoped<ITelemetryService, TelemetryService>();
builder.Services.AddScoped<IAlertGenerationService, AlertGenerationService>();

builder.Services.AddAutoMapper(typeof(MappingProfile));

builder.Services.AddSignalR();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp", policy =>
    {
        policy.WithOrigins(
                "http://localhost:4200",
                "https://localhost:4200",
                "https://sdv-border-control-client.vercel.app",
                "https://*.vercel.app"
              )
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });

    // More permissive policy for development
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "SDV Border Control API v1");
        c.RoutePrefix = "swagger";
    });
}

// Use appropriate CORS policy based on environment
if (app.Environment.IsDevelopment())
{
    app.UseCors("AllowAll");
}
else
{
    app.UseCors("AllowAngularApp");
}

app.UseRouting();

app.UseAuthorization();

app.MapControllers();
app.MapHub<TelemetryHub>("/telemetryHub");

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    context.Database.EnsureCreated();
}

app.Run();