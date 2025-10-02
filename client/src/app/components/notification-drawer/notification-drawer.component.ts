import { Component, OnInit, OnDestroy } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { ApiService } from "../../services/api.service";
import { Alert, AlertSeverity, AlertStatus } from "../../models/alert.model";
import { Subscription } from "rxjs";

@Component({
  selector: "app-notification-drawer",
  templateUrl: "./notification-drawer.component.html",
  styleUrls: ["./notification-drawer.component.scss"],
})
export class NotificationDrawerComponent implements OnInit, OnDestroy {
  alerts: Alert[] = [];
  filteredAlerts: Alert[] = [];
  selectedFilter: string = "All";
  isLoading = true;
  unreadCount = 0;

  private subscriptions: Subscription[] = [];

  constructor(
    private dialogRef: MatDialogRef<NotificationDrawerComponent>,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.loadAlerts();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  private loadAlerts(): void {
    this.isLoading = true;
    this.subscriptions.push(
      this.apiService.getActiveAlerts().subscribe({
        next: (alerts) => {
          this.alerts = alerts.map((alert) => this.mapAlertFromApi(alert));
          this.filteredAlerts = this.alerts;
          this.updateUnreadCount();
          this.isLoading = false;
        },
        error: (error) => {
          console.error("Error loading alerts:", error);
          this.loadMockAlerts();
          this.isLoading = false;
        },
      })
    );
  }

  private mapAlertFromApi(apiAlert: any): Alert {
    const severityMap = {
      0: AlertSeverity.Low,
      1: AlertSeverity.Medium,
      2: AlertSeverity.High,
      3: AlertSeverity.Critical,
    };

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

  private loadMockAlerts(): void {
    this.alerts = [
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
    this.filteredAlerts = this.alerts;
    this.updateUnreadCount();
  }

  private updateUnreadCount(): void {
    this.unreadCount = this.alerts.filter(
      (alert) =>
        alert.status === AlertStatus.Open || (alert.status as any) === 0
    ).length;
  }

  onFilterChange(filter: string): void {
    this.selectedFilter = filter;

    switch (filter) {
      case "All":
        this.filteredAlerts = this.alerts;
        break;
      case "Critical":
        this.filteredAlerts = this.alerts.filter(
          (alert) => alert.severity === AlertSeverity.Critical
        );
        break;
      case "High":
        this.filteredAlerts = this.alerts.filter(
          (alert) => alert.severity === AlertSeverity.High
        );
        break;
      case "Medium":
        this.filteredAlerts = this.alerts.filter(
          (alert) => alert.severity === AlertSeverity.Medium
        );
        break;
      case "Low":
        this.filteredAlerts = this.alerts.filter(
          (alert) => alert.severity === AlertSeverity.Low
        );
        break;
      case "Unread":
        this.filteredAlerts = this.alerts.filter(
          (alert) =>
            alert.status === AlertStatus.Open || (alert.status as any) === 0
        );
        break;
    }
  }

  acknowledgeAlert(alert: Alert): void {
    this.subscriptions.push(
      this.apiService.acknowledgeAlert(alert.id, "current-user").subscribe({
        next: (updatedAlert) => {
          const index = this.alerts.findIndex((a) => a.id === alert.id);
          if (index !== -1) {
            this.alerts[index] = updatedAlert;
            this.onFilterChange(this.selectedFilter);
            this.updateUnreadCount();
          }
        },
        error: (error) => {
          console.error("Error acknowledging alert:", error);
          // Update locally for demo
          const index = this.alerts.findIndex((a) => a.id === alert.id);
          if (index !== -1) {
            this.alerts[index].status = AlertStatus.Acknowledged;
            this.alerts[index].acknowledgedAt = new Date().toISOString();
            this.alerts[index].acknowledgedBy = "Current User";
            this.onFilterChange(this.selectedFilter);
            this.updateUnreadCount();
          }
        },
      })
    );
  }

  dismissAlert(alert: Alert): void {
    const index = this.alerts.findIndex((a) => a.id === alert.id);
    if (index !== -1) {
      this.alerts.splice(index, 1);
      this.onFilterChange(this.selectedFilter);
      this.updateUnreadCount();
    }
  }

  getSeverityIcon(severity: string): string {
    switch (severity.toLowerCase()) {
      case "critical":
        return "error";
      case "high":
        return "warning";
      case "medium":
        return "info";
      case "low":
        return "check_circle";
      default:
        return "notifications";
    }
  }

  getSeverityColor(severity: string): string {
    switch (severity.toLowerCase()) {
      case "critical":
        return "#d32f2f";
      case "high":
        return "#f57c00";
      case "medium":
        return "#1976d2";
      case "low":
        return "#388e3c";
      default:
        return "#757575";
    }
  }

  getTimeAgo(timestamp: string): string {
    const now = new Date();
    const alertTime = new Date(timestamp);
    const diffInMinutes = Math.floor(
      (now.getTime() - alertTime.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) {
      return "Just now";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days}d ago`;
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  trackByAlertId(index: number, alert: Alert): number {
    return alert.id;
  }

  getNotificationCountText(): string {
    const count = this.filteredAlerts.length;
    return `${count} notification${count !== 1 ? "s" : ""}`;
  }

  isAlertOpen(alert: Alert): boolean {
    return alert.status === AlertStatus.Open || (alert.status as any) === 0;
  }
}
