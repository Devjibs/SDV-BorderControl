import { Component, OnInit } from "@angular/core";
import { ApiService } from "../../services/api.service";

@Component({
  selector: "app-mission-manager-simple",
  template: `
    <div style="padding: 20px; font-family: Arial, sans-serif;">
      <h1>Mission Manager (Simple)</h1>

      <div style="margin-bottom: 20px;">
        <button
          (click)="loadMissions()"
          [disabled]="loading"
          style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;"
        >
          {{ loading ? "Loading..." : "Load Missions" }}
        </button>
        <button
          (click)="testApi()"
          style="margin-left: 10px; padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;"
        >
          Test API
        </button>
      </div>

      <div
        *ngIf="error"
        style="background: #f8d7da; color: #721c24; padding: 15px; border-radius: 4px; margin-bottom: 20px;"
      >
        <strong>Error:</strong> {{ error }}
      </div>

      <div *ngIf="loading" style="text-align: center; padding: 40px;">
        <div
          style="border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 2s linear infinite; margin: 0 auto;"
        ></div>
        <p>Loading missions...</p>
      </div>

      <div
        *ngIf="!loading && missions.length === 0 && !error"
        style="text-align: center; padding: 40px; color: #666;"
      >
        <h3>No missions found</h3>
        <p>Click "Load Missions" to fetch data from the API</p>
      </div>

      <div *ngIf="!loading && missions.length > 0">
        <h3>Missions ({{ missions.length }})</h3>
        <table
          style="width: 100%; border-collapse: collapse; margin-top: 20px;"
        >
          <thead>
            <tr style="background: #f8f9fa;">
              <th
                style="padding: 12px; text-align: left; border: 1px solid #dee2e6;"
              >
                Name
              </th>
              <th
                style="padding: 12px; text-align: left; border: 1px solid #dee2e6;"
              >
                Status
              </th>
              <th
                style="padding: 12px; text-align: left; border: 1px solid #dee2e6;"
              >
                Start Time
              </th>
              <th
                style="padding: 12px; text-align: left; border: 1px solid #dee2e6;"
              >
                End Time
              </th>
              <th
                style="padding: 12px; text-align: left; border: 1px solid #dee2e6;"
              >
                Vehicles
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              *ngFor="let mission of missions"
              style="border-bottom: 1px solid #dee2e6;"
            >
              <td style="padding: 12px; border: 1px solid #dee2e6;">
                <strong>{{ mission.name }}</strong
                ><br />
                <small style="color: #666;">ID: {{ mission.missionId }}</small>
              </td>
              <td style="padding: 12px; border: 1px solid #dee2e6;">
                <span [style]="getStatusStyle(mission.status)">{{
                  mission.status
                }}</span>
              </td>
              <td style="padding: 12px; border: 1px solid #dee2e6;">
                {{ formatDate(mission.startTime) }}
              </td>
              <td style="padding: 12px; border: 1px solid #dee2e6;">
                {{ formatDate(mission.endTime) }}
              </td>
              <td style="padding: 12px; border: 1px solid #dee2e6;">
                {{ getVehicleCount(mission) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        *ngIf="apiResponse"
        style="margin-top: 30px; background: #f8f9fa; padding: 20px; border-radius: 4px;"
      >
        <h4>API Response (Debug):</h4>
        <pre
          style="background: white; padding: 15px; border-radius: 4px; overflow-x: auto;"
          >{{ apiResponse | json }}</pre
        >
      </div>
    </div>

    <style>
      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
    </style>
  `,
})
export class MissionManagerSimpleComponent implements OnInit {
  missions: any[] = [];
  loading = false;
  error: string | null = null;
  apiResponse: any = null;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    console.log("MissionManagerSimpleComponent initialized");
    this.loadMissions();
  }

  loadMissions(): void {
    this.loading = true;
    this.error = null;
    this.apiResponse = null;

    console.log("Loading missions...");

    this.apiService.getMissions().subscribe({
      next: (response) => {
        console.log("Missions loaded successfully:", response);
        this.missions = response.missions || [];
        this.apiResponse = response;
        this.loading = false;
      },
      error: (error) => {
        console.error("Error loading missions:", error);
        this.error = error.message || "Failed to load missions";
        this.loading = false;
      },
    });
  }

  testApi(): void {
    console.log("Testing API directly...");
    this.apiResponse = null;

    // Test direct API call
    fetch("/api/missions")
      .then((response) => response.json())
      .then((data) => {
        console.log("Direct API response:", data);
        this.apiResponse = { directApi: data };
      })
      .catch((error) => {
        console.error("Direct API error:", error);
        this.error = "Direct API call failed: " + error.message;
      });
  }

  getVehicleCount(mission: any): number {
    return mission.vehicleIds ? mission.vehicleIds.length : 0;
  }

  getStatusStyle(status: string): string {
    switch (status.toLowerCase()) {
      case "active":
        return "background: #d4edda; color: #155724; padding: 4px 8px; border-radius: 4px;";
      case "pending":
        return "background: #fff3cd; color: #856404; padding: 4px 8px; border-radius: 4px;";
      case "completed":
        return "background: #d1ecf1; color: #0c5460; padding: 4px 8px; border-radius: 4px;";
      case "cancelled":
        return "background: #f8d7da; color: #721c24; padding: 4px 8px; border-radius: 4px;";
      default:
        return "background: #e2e3e5; color: #383d41; padding: 4px 8px; border-radius: 4px;";
    }
  }

  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + " " + date.toLocaleTimeString();
    } catch (error) {
      return dateString;
    }
  }
}
