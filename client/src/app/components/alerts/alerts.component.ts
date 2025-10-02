import { Component, OnInit, OnDestroy } from "@angular/core";
import { ApiService } from "../../services/api.service";
import { WebSocketService } from "../../services/websocket.service";
import { Alert, AlertStatus, AlertSeverity } from "../../models/alert.model";
import { Subscription } from "rxjs";

@Component({
  selector: "app-alerts",
  templateUrl: "./alerts.component.html",
  styleUrls: ["./alerts.component.scss"],
})
export class AlertsComponent implements OnInit, OnDestroy {
  alerts: Alert[] = [];
  filteredAlerts: Alert[] = [];
  isLoading = true;
  selectedStatus: AlertStatus | "all" = "all";
  selectedSeverity: AlertSeverity | "all" = "all";

  displayedColumns: string[] = [
    "timestamp",
    "vehicleId",
    "type",
    "message",
    "severity",
    "status",
    "actions",
  ];

  private subscriptions: Subscription[] = [];

  constructor(
    private apiService: ApiService,
    private webSocketService: WebSocketService
  ) {}

  ngOnInit(): void {
    this.loadAlerts();
    this.setupWebSocketConnections();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  private loadAlerts(): void {
    this.isLoading = true;
    this.subscriptions.push(
      this.apiService.getAlerts().subscribe({
        next: (alerts) => {
          this.alerts = alerts;
          this.applyFilters();
          this.isLoading = false;
        },
        error: (error) => {
          console.error("Error loading alerts:", error);
          this.isLoading = false;
        },
      })
    );
  }

  private setupWebSocketConnections(): void {
    // Subscribe to real-time alert updates
    this.subscriptions.push(
      this.webSocketService.getAlertUpdates().subscribe((alert) => {
        if (alert) {
          this.alerts.unshift(alert);
          this.applyFilters();
        }
      })
    );
  }

  private applyFilters(): void {
    this.filteredAlerts = this.alerts.filter((alert) => {
      const statusMatch =
        this.selectedStatus === "all" || alert.status === this.selectedStatus;
      const severityMatch =
        this.selectedSeverity === "all" ||
        alert.severity === this.selectedSeverity;
      return statusMatch && severityMatch;
    });
  }

  onStatusFilterChange(): void {
    this.applyFilters();
  }

  onSeverityFilterChange(): void {
    this.applyFilters();
  }

  acknowledgeAlert(alert: Alert): void {
    this.subscriptions.push(
      this.apiService.acknowledgeAlert(alert.id, "current-user").subscribe({
        next: () => {
          alert.status = AlertStatus.Acknowledged;
          alert.acknowledgedAt = new Date().toISOString();
          alert.acknowledgedBy = "current-user";
          this.applyFilters();
        },
        error: (error) => {
          console.error("Error acknowledging alert:", error);
        },
      })
    );
  }

  resolveAlert(alert: Alert): void {
    this.subscriptions.push(
      this.apiService.resolveAlert(alert.id, "current-user").subscribe({
        next: () => {
          alert.status = AlertStatus.Resolved;
          alert.resolvedAt = new Date().toISOString();
          alert.resolvedBy = "current-user";
          this.applyFilters();
        },
        error: (error) => {
          console.error("Error resolving alert:", error);
        },
      })
    );
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

  getAlertStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case "open":
        return "status-badge pending";
      case "acknowledged":
        return "status-badge active";
      case "resolved":
        return "status-badge completed";
      default:
        return "status-badge";
    }
  }

  getStatusOptions(): { value: AlertStatus | "all"; label: string }[] {
    return [
      { value: "all", label: "All Statuses" },
      { value: AlertStatus.Open, label: "Open" },
      { value: AlertStatus.Acknowledged, label: "Acknowledged" },
      { value: AlertStatus.Resolved, label: "Resolved" },
    ];
  }

  getSeverityOptions(): { value: AlertSeverity | "all"; label: string }[] {
    return [
      { value: "all", label: "All Severities" },
      { value: AlertSeverity.Low, label: "Low" },
      { value: AlertSeverity.Medium, label: "Medium" },
      { value: AlertSeverity.High, label: "High" },
      { value: AlertSeverity.Critical, label: "Critical" },
    ];
  }
}

