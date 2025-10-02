import { Component, OnInit, OnDestroy } from "@angular/core";
import { ApiService } from "../../services/api.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-analytics",
  templateUrl: "./analytics.component.html",
  styleUrls: ["./analytics.component.scss"],
})
export class AnalyticsComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];

  // Data properties
  overview: any = {};
  vehiclePerformance: any[] = [];
  telemetryTrends: any = {};
  alertPatterns: any = {};
  missionAnalytics: any = {};
  geographicData: any = {};

  // Loading states
  isLoading = true;
  isLoadingOverview = true;
  isLoadingVehicles = true;
  isLoadingTelemetry = true;
  isLoadingAlerts = true;
  isLoadingMissions = true;
  isLoadingGeographic = true;

  // Chart options
  overviewChartOptions: any = {};
  vehicleChartOptions: any = {};
  telemetryChartOptions: any = {};
  alertChartOptions: any = {};
  missionChartOptions: any = {};

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadAllAnalytics();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  private loadAllAnalytics(): void {
    this.isLoading = true;

    // Load all analytics data in parallel
    this.loadOverview();
    this.loadVehiclePerformance();
    this.loadTelemetryTrends();
    this.loadAlertPatterns();
    this.loadMissionAnalytics();
    this.loadGeographicData();
  }

  private loadOverview(): void {
    this.subscriptions.push(
      this.apiService.getAnalyticsOverview().subscribe({
        next: (data) => {
          this.overview = data;
          this.isLoadingOverview = false;
          this.checkAllLoaded();
          this.setupOverviewCharts();
        },
        error: (error) => {
          console.error("Error loading overview:", error);
          this.isLoadingOverview = false;
          this.checkAllLoaded();
        },
      })
    );
  }

  private loadVehiclePerformance(): void {
    this.subscriptions.push(
      this.apiService.getVehiclePerformance().subscribe({
        next: (data) => {
          this.vehiclePerformance = data;
          this.isLoadingVehicles = false;
          this.checkAllLoaded();
          this.setupVehicleCharts();
        },
        error: (error) => {
          console.error("Error loading vehicle performance:", error);
          this.isLoadingVehicles = false;
          this.checkAllLoaded();
        },
      })
    );
  }

  private loadTelemetryTrends(): void {
    this.subscriptions.push(
      this.apiService.getTelemetryTrends(24).subscribe({
        next: (data) => {
          this.telemetryTrends = data;
          this.isLoadingTelemetry = false;
          this.checkAllLoaded();
          this.setupTelemetryCharts();
        },
        error: (error) => {
          console.error("Error loading telemetry trends:", error);
          this.isLoadingTelemetry = false;
          this.checkAllLoaded();
        },
      })
    );
  }

  private loadAlertPatterns(): void {
    this.subscriptions.push(
      this.apiService.getAlertPatterns().subscribe({
        next: (data) => {
          this.alertPatterns = data;
          this.isLoadingAlerts = false;
          this.checkAllLoaded();
          this.setupAlertCharts();
        },
        error: (error) => {
          console.error("Error loading alert patterns:", error);
          this.isLoadingAlerts = false;
          this.checkAllLoaded();
        },
      })
    );
  }

  private loadMissionAnalytics(): void {
    this.subscriptions.push(
      this.apiService.getMissionAnalytics().subscribe({
        next: (data) => {
          this.missionAnalytics = data;
          this.isLoadingMissions = false;
          this.checkAllLoaded();
          this.setupMissionCharts();
        },
        error: (error) => {
          console.error("Error loading mission analytics:", error);
          this.isLoadingMissions = false;
          this.checkAllLoaded();
        },
      })
    );
  }

  private loadGeographicData(): void {
    this.subscriptions.push(
      this.apiService.getGeographicHeatmap().subscribe({
        next: (data) => {
          this.geographicData = data;
          this.isLoadingGeographic = false;
          this.checkAllLoaded();
        },
        error: (error) => {
          console.error("Error loading geographic data:", error);
          this.isLoadingGeographic = false;
          this.checkAllLoaded();
        },
      })
    );
  }

  private checkAllLoaded(): void {
    this.isLoading =
      this.isLoadingOverview ||
      this.isLoadingVehicles ||
      this.isLoadingTelemetry ||
      this.isLoadingAlerts ||
      this.isLoadingMissions ||
      this.isLoadingGeographic;
  }

  private setupOverviewCharts(): void {
    this.overviewChartOptions = {
      systemHealth: {
        title: "System Health",
        value: this.overview.systemHealth,
        max: 100,
        color: this.getHealthColor(this.overview.systemHealth),
      },
      vehicleStatus: {
        title: "Vehicle Status",
        data: [
          {
            name: "Online",
            value: this.overview.onlineVehicles,
            color: "#4caf50",
          },
          {
            name: "Offline",
            value: this.overview.offlineVehicles,
            color: "#f44336",
          },
        ],
      },
    };
  }

  private setupVehicleCharts(): void {
    this.vehicleChartOptions = {
      performance: this.vehiclePerformance.slice(0, 10), // Top 10 vehicles
      efficiency: this.vehiclePerformance.map((v) => ({
        name: v.name,
        value: v.efficiency,
      })),
    };
  }

  private setupTelemetryCharts(): void {
    this.telemetryChartOptions = {
      trends: this.telemetryTrends.hourlyTrends || [],
      speedDistribution: this.telemetryTrends.speedDistribution || [],
    };
  }

  private setupAlertCharts(): void {
    this.alertChartOptions = {
      severityDistribution: this.alertPatterns.severityDistribution || [],
      typeDistribution: this.alertPatterns.typeDistribution || [],
      hourlyPatterns: this.alertPatterns.hourlyPatterns || [],
    };
  }

  private setupMissionCharts(): void {
    this.missionChartOptions = {
      statusDistribution: this.missionAnalytics.statusDistribution || [],
      successRate: this.missionAnalytics.successRate || 0,
    };
  }

  private getHealthColor(health: number): string {
    if (health >= 80) return "#4caf50";
    if (health >= 60) return "#ff9800";
    return "#f44336";
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case "online":
        return "#4caf50";
      case "offline":
        return "#f44336";
      case "on-mission":
        return "#2196f3";
      case "alert":
        return "#ff9800";
      default:
        return "#9e9e9e";
    }
  }

  getSeverityColor(severity: string): string {
    switch (severity.toLowerCase()) {
      case "critical":
        return "#f44336";
      case "high":
        return "#ff9800";
      case "medium":
        return "#ffc107";
      case "low":
        return "#4caf50";
      default:
        return "#9e9e9e";
    }
  }

  formatNumber(value: number | undefined, decimals: number = 1): string {
    if (value === undefined || value === null || isNaN(value)) {
      return '0';
    }
    return value.toFixed(decimals);
  }

  formatPercentage(value: number | undefined): string {
    if (value === undefined || value === null || isNaN(value)) {
      return '0.0%';
    }
    return `${value.toFixed(1)}%`;
  }

  formatDuration(hours: number | undefined): string {
    if (hours === undefined || hours === null || isNaN(hours)) {
      return '0h';
    }
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    if (hours < 24) return `${hours.toFixed(1)}h`;
    return `${(hours / 24).toFixed(1)}d`;
  }
}
