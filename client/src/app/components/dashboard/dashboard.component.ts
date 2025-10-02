import { Component, OnInit, OnDestroy } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
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
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.setupWebSocketConnections();
    this.startRealTimeSimulation();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  private loadDashboardData(): void {
    this.isLoading = true;

    // Load missions
    this.subscriptions.push(
      this.apiService.getMissions().subscribe({
        next: (missions) => {
          this.missions = missions.slice(0, 5); // Show latest 5 missions
          this.updateAnalytics();
        },
        error: (error) => {
          console.error("Error loading missions:", error);
          // Load mock missions if API fails
          this.loadMockMissions();
        },
      })
    );

    // Load active alerts
    this.subscriptions.push(
      this.apiService.getActiveAlerts().subscribe({
        next: (alerts) => {
          this.activeAlerts = alerts.slice(0, 10); // Show latest 10 alerts
          this.updateAnalytics();
          this.isLoading = false;
        },
        error: (error) => {
          console.error("Error loading alerts:", error);
          // Load mock alerts if API fails
          this.loadMockAlerts();
          this.isLoading = false;
        },
      })
    );

    // Load vehicles (mock data for now)
    this.loadVehicles();
    this.updateAnalytics();
  }

  private loadVehicles(): void {
    // Enhanced mock vehicle data with images and realistic data
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
      {
        vehicleId: "vehicle_002",
        name: "Patrol Vehicle 002",
        type: "Patrol",
        status: "OnMission",
        lastSeen: new Date().toISOString(),
        position: { lat: 40.7589, lng: -73.9851 },
        image:
          "https://images.pexels.com/photos/248697/pexels-photo-248697.jpeg",
        speed: 38,
        temperature: 26,
        fuelLevel: 72,
        batteryLevel: 88,
      },
      {
        vehicleId: "vehicle_003",
        name: "Surveillance Vehicle 003",
        type: "Surveillance",
        status: "Online",
        lastSeen: new Date().toISOString(),
        position: { lat: 40.6892, lng: -74.0445 },
        image:
          "https://images.pexels.com/photos/14589919/pexels-photo-14589919.jpeg",
        speed: 0,
        temperature: 24,
        fuelLevel: 95,
        batteryLevel: 78,
      },
      {
        vehicleId: "vehicle_004",
        name: "Emergency Vehicle 004",
        type: "Emergency",
        status: "Alert",
        lastSeen: new Date().toISOString(),
        position: { lat: 40.7505, lng: -73.9934 },
        image:
          "https://images.pexels.com/photos/31129031/pexels-photo-31129031.jpeg",
        speed: 65,
        temperature: 28,
        fuelLevel: 45,
        batteryLevel: 65,
      },
      {
        vehicleId: "vehicle_005",
        name: "Transport Vehicle 005",
        type: "Transport",
        status: "Online",
        lastSeen: new Date().toISOString(),
        position: { lat: 40.6782, lng: -73.9442 },
        image:
          "https://images.pexels.com/photos/139334/pexels-photo-139334.jpeg",
        speed: 32,
        temperature: 23,
        fuelLevel: 88,
        batteryLevel: 91,
      },
    ];
  }

  private setupWebSocketConnections(): void {
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

  getMissionStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case "active":
        return "status-badge active";
      case "pending":
        return "status-badge pending";
      case "completed":
        return "status-badge completed";
      case "cancelled":
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
}
