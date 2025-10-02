import { Component, OnInit, OnDestroy } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { ApiService } from "../../services/api.service";
import { WebSocketService } from "../../services/websocket.service";
import { Mission, MissionStatus } from "../../models/mission.model";
import { Alert, AlertSeverity, AlertStatus } from "../../models/alert.model";
import { TelemetryRecord } from "../../models/telemetry.model";
import { Subscription } from "rxjs";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})
export class DashboardComponent implements OnInit, OnDestroy {
  missions: Mission[] = [];
  activeAlerts: Alert[] = [];
  vehicles: any[] = [];
  displayedVehicles: any[] = [];
  isLoading = true;

  // Analytics data
  totalVehicles = 0;
  onlineVehicles = 0;
  activeMissions = 0;
  criticalAlerts = 0;

  private subscriptions: Subscription[] = [];

  constructor(
    private apiService: ApiService,
    private webSocketService: WebSocketService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log("Dashboard component initialized");
    this.loadDashboardData();
    this.setupWebSocketConnections();
    this.startRealTimeSimulation();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  private loadDashboardData(): void {
    console.log("Loading dashboard data...");
    this.isLoading = true;

    // Load missions
    this.subscriptions.push(
      this.apiService.getMissions().subscribe({
        next: (missions) => {
          console.log("Missions loaded:", missions);
          this.missions = missions.slice(0, 5); // Show latest 5 missions
          this.updateAnalytics();
        },
        error: (error) => {
          console.error("Error loading missions:", error);
          this.missions = []; // Show empty state instead of mock data
        },
      })
    );

    // Load active alerts
    console.log("Attempting to load active alerts...");
    this.subscriptions.push(
      this.apiService.getActiveAlerts().subscribe({
        next: (alerts) => {
          console.log("Raw alerts from API:", alerts);
          // Map API data to frontend format
          this.activeAlerts = alerts
            .slice(0, 10)
            .map((alert) => this.mapAlertFromApi(alert));
          console.log("Mapped alerts for display:", this.activeAlerts);
          this.updateAnalytics();
          this.isLoading = false;
        },
        error: (error) => {
          console.error("Error loading alerts:", error);
          this.activeAlerts = []; // Show empty state instead of mock data
          this.isLoading = false;
        },
      })
    );

    // Load vehicles from API
    this.loadVehicles();
    this.updateAnalytics();
  }

  private loadVehicles(): void {
    this.subscriptions.push(
      this.apiService.getVehicles().subscribe({
        next: (vehicles) => {
          // Convert API vehicles to dashboard format
          this.vehicles = vehicles.map((vehicle) => ({
            vehicleId: vehicle.vehicleId,
            name: vehicle.name,
            type: vehicle.type,
            status: vehicle.status,
            lastSeen: vehicle.lastSeen || new Date().toISOString(),
            position: {
              lat: 40.7128 + (Math.random() - 0.5) * 0.1,
              lng: -74.006 + (Math.random() - 0.5) * 0.1,
            },
            image:
              vehicle.imageUrl || this.getDefaultVehicleImage(vehicle.type),
            speed: Math.floor(Math.random() * 80),
            temperature: 20 + Math.random() * 15,
            fuelLevel: Math.floor(Math.random() * 100),
            batteryLevel: Math.floor(Math.random() * 100),
          }));

          // Limit to 5 vehicles for dashboard display
          this.displayedVehicles = this.vehicles.slice(0, 5);
          this.updateAnalytics();
        },
        error: (error) => {
          console.error("Error loading vehicles:", error);
          this.vehicles = []; // Show empty state instead of mock data
          this.displayedVehicles = [];
        },
      })
    );
  }

  private loadMockVehicles(): void {
    // Fallback mock data if API fails
    this.vehicles = [
      {
        vehicleId: "vehicle_001",
        name: "Patrol Vehicle 001",
        type: "Patrol",
        status: "Online",
        lastSeen: new Date().toISOString(),
        position: { lat: 40.7128, lng: -74.006 },
        image:
          "https://images.pexels.com/photos/1008738/pexels-photo-1008738.jpeg",
        speed: 45,
        temperature: 25,
        fuelLevel: 85,
        batteryLevel: 92,
      },
    ];
  }

  private getDefaultVehicleImage(type: string): string {
    const defaultImages = {
      Patrol:
        "https://images.pexels.com/photos/1008738/pexels-photo-1008738.jpeg",
      Surveillance:
        "https://images.pexels.com/photos/14589919/pexels-photo-14589919.jpeg",
      Emergency:
        "https://images.pexels.com/photos/31129031/pexels-photo-31129031.jpeg",
      Transport:
        "https://images.pexels.com/photos/139334/pexels-photo-139334.jpeg",
    };
    return (
      defaultImages[type as keyof typeof defaultImages] ||
      defaultImages["Patrol"]
    );
  }

  private setupWebSocketConnections(): void {
    try {
      // Join dashboard group for real-time updates
      this.webSocketService.joinDashboardGroup();

      // Subscribe to telemetry updates
      this.subscriptions.push(
        this.webSocketService.getTelemetryUpdates().subscribe((telemetry) => {
          if (telemetry) {
            this.updateVehiclePosition(telemetry);
          }
        })
      );

      // Subscribe to alert updates
      this.subscriptions.push(
        this.webSocketService.getAlertUpdates().subscribe((alert) => {
          if (alert) {
            this.activeAlerts.unshift(alert);
            this.activeAlerts = this.activeAlerts.slice(0, 10); // Keep only latest 10
            this.showAlertNotification(alert);
            this.updateAnalytics();
          }
        })
      );
    } catch (error) {
      console.warn(
        "WebSocket connection failed, continuing without real-time updates:",
        error
      );
    }
  }

  private updateVehiclePosition(telemetry: TelemetryRecord): void {
    const vehicle = this.vehicles.find(
      (v) => v.vehicleId === telemetry.vehicleId
    );
    if (vehicle) {
      vehicle.position = {
        lat: telemetry.latitude,
        lng: telemetry.longitude,
      };
      vehicle.lastSeen = telemetry.timestamp;
    }
  }

  getMissionStatusClass(status: any): string {
    // Handle both string and numeric status values
    const statusStr = typeof status === "string" ? status : String(status);
    switch (statusStr.toLowerCase()) {
      case "active":
      case "1":
        return "status-badge active";
      case "pending":
      case "0":
        return "status-badge pending";
      case "completed":
      case "2":
        return "status-badge completed";
      case "cancelled":
      case "3":
        return "status-badge cancelled";
      default:
        return "status-badge";
    }
  }

  getAlertSeverityClass(severity: string): string {
    switch (severity.toLowerCase()) {
      case "critical":
        return "alert-critical";
      case "high":
        return "alert-high";
      case "medium":
        return "alert-medium";
      case "low":
        return "alert-low";
      default:
        return "";
    }
  }

  getVehicleStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case "online":
        return "vehicle-status-online";
      case "offline":
        return "vehicle-status-offline";
      case "onmission":
        return "vehicle-status-on-mission";
      case "alert":
        return "vehicle-status-alert";
      default:
        return "";
    }
  }

  private loadMockMissions(): void {
    // Load mock missions if API is not available
    this.missions = [
      {
        missionId: "mission_001",
        name: "Border Patrol - Sector A",
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 3600000).toISOString(),
        vehicleIds: ["vehicle_001", "vehicle_002"],
        status: MissionStatus.Active,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        missionId: "mission_002",
        name: "Surveillance Operation - North Zone",
        startTime: new Date(Date.now() - 1800000).toISOString(),
        endTime: new Date(Date.now() + 1800000).toISOString(),
        vehicleIds: ["vehicle_003"],
        status: MissionStatus.Active,
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        missionId: "mission_003",
        name: "Emergency Response - Highway 95",
        startTime: new Date(Date.now() - 7200000).toISOString(),
        endTime: new Date(Date.now() - 3600000).toISOString(),
        vehicleIds: ["vehicle_004"],
        status: MissionStatus.Completed,
        createdAt: new Date(Date.now() - 14400000).toISOString(),
      },
    ];
    this.updateAnalytics();
  }

  private loadMockAlerts(): void {
    console.log("Loading mock alerts...");
    // Load mock alerts if API is not available
    this.activeAlerts = [
      {
        id: 1,
        vehicleId: "vehicle_004",
        type: "EngineFault",
        message: "Engine temperature critical - 95°C",
        severity: AlertSeverity.Critical,
        timestamp: new Date().toISOString(),
        status: AlertStatus.Open,
        additionalData: {},
      },
      {
        id: 2,
        vehicleId: "vehicle_002",
        type: "FuelLow",
        message: "Fuel level low - 15% remaining",
        severity: AlertSeverity.High,
        timestamp: new Date(Date.now() - 300000).toISOString(),
        status: AlertStatus.Open,
        additionalData: {},
      },
      {
        id: 3,
        vehicleId: "vehicle_001",
        type: "BatteryLow",
        message: "Battery level critical - 8% remaining",
        severity: AlertSeverity.Critical,
        timestamp: new Date(Date.now() - 600000).toISOString(),
        status: AlertStatus.Open,
        additionalData: {},
      },
    ];
    console.log("Mock alerts loaded:", this.activeAlerts);
    this.updateAnalytics();
  }

  private updateAnalytics(): void {
    this.totalVehicles = this.vehicles.length;
    this.onlineVehicles = this.vehicles.filter(
      (v) => v.status === "Online" || v.status === "OnMission"
    ).length;
    this.activeMissions = this.missions.filter(
      (m) => m.status === MissionStatus.Active
    ).length;
    this.criticalAlerts = this.activeAlerts.filter(
      (a) => a.severity === AlertSeverity.Critical
    ).length;
  }

  private showAlertNotification(alert: Alert): void {
    const severityColors = {
      Critical: "error",
      High: "warn",
      Medium: "accent",
      Low: "primary",
    };

    this.snackBar.open(`🚨 ${alert.type}: ${alert.message}`, "Dismiss", {
      duration: 5000,
      panelClass: [`alert-${alert.severity.toLowerCase()}`],
      horizontalPosition: "right",
      verticalPosition: "top",
    });
  }

  // Method to simulate real-time updates
  startRealTimeSimulation(): void {
    setInterval(() => {
      this.simulateRandomUpdates();
    }, 10000); // Update every 10 seconds
  }

  private simulateRandomUpdates(): void {
    // Randomly update vehicle data
    this.vehicles.forEach((vehicle) => {
      if (Math.random() < 0.3) {
        // 30% chance to update
        vehicle.speed = Math.floor(Math.random() * 80);
        vehicle.temperature = 20 + Math.random() * 15;
        vehicle.fuelLevel = Math.floor(Math.random() * 100);
        vehicle.batteryLevel = Math.floor(Math.random() * 100);
        vehicle.lastSeen = new Date().toISOString();

        // Generate random alerts
        if (Math.random() < 0.1) {
          // 10% chance for alert
          const alertTypes = [
            "EngineFault",
            "FuelLow",
            "BatteryLow",
            "Overspeed",
            "TemperatureHigh",
          ];
          const severities = ["Low", "Medium", "High", "Critical"];
          const randomType =
            alertTypes[Math.floor(Math.random() * alertTypes.length)];
          const randomSeverity =
            severities[Math.floor(Math.random() * severities.length)];

          const newAlert: Alert = {
            id: Date.now(),
            vehicleId: vehicle.vehicleId,
            type: randomType,
            message: `${randomType} detected on ${vehicle.name}`,
            severity: randomSeverity as AlertSeverity,
            timestamp: new Date().toISOString(),
            status: AlertStatus.Open,
            additionalData: {},
          };

          this.activeAlerts.unshift(newAlert);
          this.activeAlerts = this.activeAlerts.slice(0, 10);
          this.showAlertNotification(newAlert);
        }
      }
    });
    this.updateAnalytics();
  }

  dismissAlert(alert: Alert): void {
    // Remove alert from the list
    this.activeAlerts = this.activeAlerts.filter((a) => a.id !== alert.id);
    this.updateAnalytics();

    this.snackBar.open(`Alert dismissed: ${alert.type}`, "Undo", {
      duration: 3000,
      horizontalPosition: "right",
      verticalPosition: "top",
    });
  }

  acknowledgeAlert(alert: Alert): void {
    // Update alert status to acknowledged
    const alertIndex = this.activeAlerts.findIndex((a) => a.id === alert.id);
    if (alertIndex !== -1) {
      this.activeAlerts[alertIndex].status = AlertStatus.Acknowledged;
      this.activeAlerts[alertIndex].acknowledgedAt = new Date().toISOString();
      this.activeAlerts[alertIndex].acknowledgedBy = "Current User";
    }
    this.updateAnalytics();

    this.snackBar.open(`Alert acknowledged: ${alert.type}`, "Close", {
      duration: 3000,
      horizontalPosition: "right",
      verticalPosition: "top",
    });
  }

  isAlertOpen(alert: Alert): boolean {
    return (
      alert.status === AlertStatus.Open ||
      (alert.status as any) === "Open" ||
      (alert.status as any) === "0" ||
      (alert.status as any) === 0
    );
  }

  private mapAlertFromApi(apiAlert: any): Alert {
    // Map severity from number to string
    const severityMap = {
      0: AlertSeverity.Low,
      1: AlertSeverity.Medium,
      2: AlertSeverity.High,
      3: AlertSeverity.Critical,
    };

    // Map status from number to string
    const statusMap = {
      0: AlertStatus.Open,
      1: AlertStatus.Acknowledged,
      2: AlertStatus.Resolved,
    };

    return {
      id: apiAlert.id,
      vehicleId: apiAlert.vehicleId,
      type: apiAlert.type,
      message: apiAlert.message,
      severity:
        severityMap[apiAlert.severity as keyof typeof severityMap] ||
        AlertSeverity.Medium,
      timestamp: apiAlert.timestamp,
      status:
        statusMap[apiAlert.status as keyof typeof statusMap] ||
        AlertStatus.Open,
      acknowledgedAt: apiAlert.acknowledgedAt,
      acknowledgedBy: apiAlert.acknowledgedBy,
      resolvedAt: apiAlert.resolvedAt,
      resolvedBy: apiAlert.resolvedBy,
      additionalData: apiAlert.additionalData || {},
    };
  }

  navigateToVehicles(): void {
    this.router.navigate(["/vehicles"]);
  }
}
