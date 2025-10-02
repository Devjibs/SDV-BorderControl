import { Component, OnInit } from "@angular/core";
import { MatSidenav } from "@angular/material/sidenav";
import { ViewChild } from "@angular/core";
import { ApiService } from "../../services/api.service";
import { Alert, AlertSeverity, AlertStatus } from "../../models/alert.model";
import { Observable } from "rxjs";

@Component({
  selector: "app-navigation",
  templateUrl: "./navigation.component.html",
  styleUrls: ["./navigation.component.scss"],
})
export class NavigationComponent implements OnInit {
  @ViewChild("sidenav") sidenav!: MatSidenav;
  unreadAlertsCount = 0;
  recentAlerts: Alert[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadAlerts();
  }

  toggleSidenav(): void {
    this.sidenav.toggle();
  }

  private loadAlerts(): void {
    this.apiService.getActiveAlerts().subscribe({
      next: (alerts) => {
        this.recentAlerts = alerts.slice(0, 5);
        this.unreadAlertsCount = alerts.filter(
          (a) => a.status === AlertStatus.Open
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

  onNotificationClick(): void {
    // Toggle alerts panel or navigate to alerts page
    console.log("Notification clicked");
  }
}
