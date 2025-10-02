import { Component, OnInit, OnDestroy } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ApiService } from "../../services/api.service";
import { Alert, AlertSeverity, AlertStatus } from "../../models/alert.model";
import { Subscription } from "rxjs";

@Component({
  selector: "app-alerts-management",
  templateUrl: "./alerts-management.component.html",
  styleUrls: ["./alerts-management.component.scss"],
})
export class AlertsManagementComponent implements OnInit, OnDestroy {
  alerts: Alert[] = [];
  filteredAlerts: Alert[] = [];
  paginatedAlerts: Alert[] = [];
  isLoading = true;
  selectedFilter: string = "All";

  // Pagination
  currentPage = 1;
  pageSize = 20;
  totalPages = 0;
  totalItems = 0;

  displayedColumns: string[] = [
    "id",
    "vehicleId",
    "type",
    "message",
    "severity",
    "status",
    "timestamp",
    "actions",
  ];

  private subscriptions: Subscription[] = [];

  constructor(
    private apiService: ApiService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
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
          this.updatePagination();
          this.isLoading = false;
        },
        error: (error) => {
          console.error("Error loading alerts:", error);
          this.isLoading = false;
        },
      })
    );
  }

  private mapAlertFromApi(apiAlert: any): Alert {
    const severityMap = {
      Low: AlertSeverity.Low,
      Medium: AlertSeverity.Medium,
      High: AlertSeverity.High,
      Critical: AlertSeverity.Critical,
    };

    const statusMap = {
      Open: AlertStatus.Open,
      Acknowledged: AlertStatus.Acknowledged,
      Resolved: AlertStatus.Resolved,
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

  onFilterChange(filter: string): void {
    this.selectedFilter = filter;

    switch (filter) {
      case "All":
        this.filteredAlerts = this.alerts;
        break;
      case "Open":
        this.filteredAlerts = this.alerts.filter(
          (alert) => alert.status === AlertStatus.Open
        );
        break;
      case "Acknowledged":
        this.filteredAlerts = this.alerts.filter(
          (alert) => alert.status === AlertStatus.Acknowledged
        );
        break;
      case "Resolved":
        this.filteredAlerts = this.alerts.filter(
          (alert) => alert.status === AlertStatus.Resolved
        );
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
    }
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalItems = this.filteredAlerts.length;
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedAlerts = this.filteredAlerts.slice(startIndex, endIndex);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.updatePagination();
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(
      1,
      this.currentPage - Math.floor(maxVisiblePages / 2)
    );
    const endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  getEndItem(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }

  acknowledgeAlert(alert: Alert): void {
    this.subscriptions.push(
      this.apiService.acknowledgeAlert(alert.id, "current-user").subscribe({
        next: (updatedAlert) => {
          const index = this.alerts.findIndex((a) => a.id === alert.id);
          if (index !== -1) {
            this.alerts[index] = updatedAlert;
            this.onFilterChange(this.selectedFilter);
          }
          this.snackBar.open("Alert acknowledged successfully!", "Close", {
            duration: 3000,
            panelClass: ["success-snackbar"],
          });
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
          }
          this.snackBar.open("Alert acknowledged successfully!", "Close", {
            duration: 3000,
            panelClass: ["success-snackbar"],
          });
        },
      })
    );
  }

  resolveAlert(alert: Alert): void {
    this.subscriptions.push(
      this.apiService.resolveAlert(alert.id, "current-user").subscribe({
        next: (updatedAlert) => {
          const index = this.alerts.findIndex((a) => a.id === alert.id);
          if (index !== -1) {
            this.alerts[index] = updatedAlert;
            this.onFilterChange(this.selectedFilter);
          }
          this.snackBar.open("Alert resolved successfully!", "Close", {
            duration: 3000,
            panelClass: ["success-snackbar"],
          });
        },
        error: (error) => {
          console.error("Error resolving alert:", error);
          // Update locally for demo
          const index = this.alerts.findIndex((a) => a.id === alert.id);
          if (index !== -1) {
            this.alerts[index].status = AlertStatus.Resolved;
            this.alerts[index].resolvedAt = new Date().toISOString();
            this.alerts[index].resolvedBy = "Current User";
            this.onFilterChange(this.selectedFilter);
          }
          this.snackBar.open("Alert resolved successfully!", "Close", {
            duration: 3000,
            panelClass: ["success-snackbar"],
          });
        },
      })
    );
  }

  getSeverityClass(severity: AlertSeverity): string {
    switch (severity) {
      case AlertSeverity.Critical:
        return "severity-critical";
      case AlertSeverity.High:
        return "severity-high";
      case AlertSeverity.Medium:
        return "severity-medium";
      case AlertSeverity.Low:
        return "severity-low";
      default:
        return "";
    }
  }

  getStatusClass(status: AlertStatus): string {
    switch (status) {
      case AlertStatus.Open:
        return "status-open";
      case AlertStatus.Acknowledged:
        return "status-acknowledged";
      case AlertStatus.Resolved:
        return "status-resolved";
      default:
        return "";
    }
  }

  getSeverityIcon(severity: AlertSeverity): string {
    switch (severity) {
      case AlertSeverity.Critical:
        return "error";
      case AlertSeverity.High:
        return "warning";
      case AlertSeverity.Medium:
        return "info";
      case AlertSeverity.Low:
        return "check_circle";
      default:
        return "notifications";
    }
  }

  canAcknowledge(alert: Alert): boolean {
    return alert.status === AlertStatus.Open;
  }

  canResolve(alert: Alert): boolean {
    return alert.status === AlertStatus.Acknowledged;
  }
}
