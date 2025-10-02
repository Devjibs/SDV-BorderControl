import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ApiService } from "../../services/api.service";
import { WebSocketService } from "../../services/websocket.service";
import { TelemetryRecord } from "../../models/telemetry.model";
import { Alert } from "../../models/alert.model";
import { Subscription } from "rxjs";

@Component({
  selector: "app-vehicle-detail",
  templateUrl: "./vehicle-detail.component.html",
  styleUrls: ["./vehicle-detail.component.scss"],
})
export class VehicleDetailComponent implements OnInit, OnDestroy {
  vehicleId: string = "";
  vehicle: any = null;
  latestTelemetry: TelemetryRecord | null = null;
  telemetryHistory: TelemetryRecord[] = [];
  alerts: Alert[] = [];
  isLoading = true;

  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private webSocketService: WebSocketService
  ) {}

  ngOnInit(): void {
    this.vehicleId = this.route.snapshot.paramMap.get("id") || "";
    this.loadVehicleData();
    this.setupWebSocketConnections();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.webSocketService.leaveVehicleGroup(this.vehicleId);
  }

  private loadVehicleData(): void {
    this.isLoading = true;

    // Load latest telemetry
    this.subscriptions.push(
      this.apiService.getLatestTelemetry(this.vehicleId).subscribe({
        next: (telemetry) => {
          this.latestTelemetry = telemetry;
        },
        error: (error) => {
          console.error("Error loading latest telemetry:", error);
        },
      })
    );

    // Load telemetry history
    this.subscriptions.push(
      this.apiService.getTelemetry(this.vehicleId, 50).subscribe({
        next: (telemetry) => {
          this.telemetryHistory = telemetry;
        },
        error: (error) => {
          console.error("Error loading telemetry history:", error);
        },
      })
    );

    // Load alerts for this vehicle
    this.subscriptions.push(
      this.apiService.getAlertsByVehicle(this.vehicleId).subscribe({
        next: (alerts) => {
          this.alerts = alerts;
        },
        error: (error) => {
          console.error("Error loading alerts:", error);
        },
      })
    );

    // Mock vehicle data
    this.vehicle = {
      vehicleId: this.vehicleId,
      name: `Vehicle ${this.vehicleId}`,
      type: "Patrol",
      status: "Online",
      lastSeen: new Date().toISOString(),
    };

    this.isLoading = false;
  }

  private setupWebSocketConnections(): void {
    // Join vehicle group for real-time updates
    this.webSocketService.joinVehicleGroup(this.vehicleId);

    // Subscribe to telemetry updates for this vehicle
    this.subscriptions.push(
      this.webSocketService.getTelemetryUpdates().subscribe((telemetry) => {
        if (telemetry && telemetry.vehicleId === this.vehicleId) {
          this.latestTelemetry = telemetry;
          this.telemetryHistory.unshift(telemetry);
          this.telemetryHistory = this.telemetryHistory.slice(0, 50); // Keep only latest 50
        }
      })
    );

    // Subscribe to alert updates for this vehicle
    this.subscriptions.push(
      this.webSocketService.getAlertUpdates().subscribe((alert) => {
        if (alert && alert.vehicleId === this.vehicleId) {
          this.alerts.unshift(alert);
        }
      })
    );
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

  formatSpeed(speed: number): string {
    return `${speed.toFixed(1)} km/h`;
  }

  formatTemperature(temperature: number): string {
    return `${temperature.toFixed(1)}°C`;
  }

  formatCoordinate(coord: number): string {
    return coord.toFixed(6);
  }
}

