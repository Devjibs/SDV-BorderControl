import { Component, OnInit, AfterViewInit } from "@angular/core";
import { MatSidenav } from "@angular/material/sidenav";
import { MatDialog } from "@angular/material/dialog";
import { ViewChild } from "@angular/core";
import { ApiService } from "../../services/api.service";
import { Alert, AlertSeverity, AlertStatus } from "../../models/alert.model";
import { NotificationDrawerComponent } from "../notification-drawer/notification-drawer.component";
import { Observable } from "rxjs";

@Component({
  selector: "app-navigation",
  templateUrl: "./navigation.component.html",
  styleUrls: ["./navigation.component.scss"],
})
export class NavigationComponent implements OnInit, AfterViewInit {
  @ViewChild("sidenav") sidenav!: MatSidenav;
  unreadAlertsCount = 0;
  recentAlerts: Alert[] = [];

  constructor(private apiService: ApiService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadAlerts();
  }

  ngAfterViewInit(): void {
    console.log("Navigation component view initialized");
    console.log("Sidenav reference after view init:", this.sidenav);
  }

  toggleSidenav(): void {
    console.log("Hamburger clicked - toggling sidenav");
    console.log("Sidenav reference:", this.sidenav);
    if (this.sidenav) {
      this.sidenav.toggle();
    } else {
      console.error("Sidenav reference is null!");
    }
  }

  private loadAlerts(): void {
    this.apiService.getActiveAlerts().subscribe({
      next: (alerts) => {
        // Map API data to frontend format
        this.recentAlerts = alerts
          .slice(0, 5)
          .map((alert) => this.mapAlertFromApi(alert));
        this.unreadAlertsCount = alerts.filter(
          (a) => (a.status as any) === 0 || a.status === AlertStatus.Open
        ).length;
      },
      error: (error) => {
        console.error("Error loading alerts:", error);
        // Mock data if API fails
        this.unreadAlertsCount = 3;
        this.recentAlerts = [
          {
            id: 1,
            vehicleId: "vehicle_001",
            type: "EngineFault",
            message: "Engine temperature critical",
            severity: AlertSeverity.Critical,
            timestamp: new Date().toISOString(),
            status: AlertStatus.Open,
            additionalData: {},
          },
        ];
      },
    });
  }

  private mapAlertFromApi(apiAlert: any): Alert {
    // Map severity from number to string
    const severityMap = {
      Low: AlertSeverity.Low,
      Medium: AlertSeverity.Medium,
      High: AlertSeverity.High,
      Critical: AlertSeverity.Critical,
    };

    // Map status from number to string
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

  onNotificationClick(): void {
    console.log("Notification clicked - opening notification drawer");

    const dialogRef = this.dialog.open(NotificationDrawerComponent, {
      width: "500px",
      maxWidth: "90vw",
      maxHeight: "80vh",
      panelClass: "notification-dialog",
      disableClose: false,
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log("Notification drawer closed");
      // Refresh alerts count after drawer is closed
      this.loadAlerts();
    });
  }
}
