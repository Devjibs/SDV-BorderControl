import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, timeout, catchError, of, map } from "rxjs";
import {
  Mission,
  CreateMissionRequest,
  UpdateMissionRequest,
} from "../models/mission.model";
import {
  TelemetryRecord,
  TelemetryData,
  Vehicle,
} from "../models/telemetry.model";
import { Alert, AlertRequest } from "../models/alert.model";

@Injectable({
  providedIn: "root",
})
export class ApiService {
  private readonly baseUrl = "/api";

  constructor(private http: HttpClient) {}

  // Mission endpoints
  getMissions(
    page: number = 1,
    pageSize: number = 10
  ): Observable<{
    missions: Mission[];
    totalCount: number;
    totalPages: number;
  }> {
    return this.http.get<Mission[]>(`${this.baseUrl}/missions`).pipe(
      timeout(5000),
      map((missions) => {
        return {
          missions: missions || [],
          totalCount: missions ? missions.length : 0,
          totalPages: 1,
        };
      }),
      catchError((error) => {
        return of({ missions: [], totalCount: 0, totalPages: 1 });
      })
    );
  }

  getMission(id: string): Observable<Mission> {
    return this.http.get<Mission>(`${this.baseUrl}/missions/${id}`);
  }

  createMission(mission: CreateMissionRequest): Observable<Mission> {
    return this.http.post<Mission>(`${this.baseUrl}/missions`, mission);
  }

  updateMission(
    id: string,
    mission: UpdateMissionRequest
  ): Observable<Mission> {
    return this.http.put<Mission>(`${this.baseUrl}/missions/${id}`, mission);
  }

  deleteMission(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/missions/${id}`);
  }

  getMissionsByVehicle(vehicleId: string): Observable<Mission[]> {
    return this.http.get<Mission[]>(
      `${this.baseUrl}/missions/vehicle/${vehicleId}`
    );
  }

  updateMissionStatus(id: string, status: string): Observable<Mission> {
    return this.http.patch<Mission>(`${this.baseUrl}/missions/${id}/status`, {
      status,
    });
  }

  // Telemetry endpoints
  getTelemetry(
    vehicleId: string,
    limit: number = 100
  ): Observable<TelemetryRecord[]> {
    return this.http.get<TelemetryRecord[]>(
      `${this.baseUrl}/telemetry/${vehicleId}?limit=${limit}`
    );
  }

  getLatestTelemetry(vehicleId: string): Observable<TelemetryRecord> {
    return this.http.get<TelemetryRecord>(
      `${this.baseUrl}/telemetry/${vehicleId}/latest`
    );
  }

  addTelemetry(
    vehicleId: string,
    telemetryData: TelemetryData[]
  ): Observable<TelemetryRecord[]> {
    return this.http.post<TelemetryRecord[]>(
      `${this.baseUrl}/telemetry/${vehicleId}`,
      telemetryData
    );
  }

  getTelemetryByTimeRange(
    vehicleId: string,
    startTime: string,
    endTime: string
  ): Observable<TelemetryRecord[]> {
    return this.http.get<TelemetryRecord[]>(
      `${this.baseUrl}/telemetry/${vehicleId}/range?startTime=${startTime}&endTime=${endTime}`
    );
  }

  // Alert endpoints
  getAlerts(): Observable<Alert[]> {
    return this.http.get<Alert[]>(`${this.baseUrl}/alerts`);
  }

  getActiveAlerts(): Observable<Alert[]> {
    return this.http.get<Alert[]>(`${this.baseUrl}/alerts/active`);
  }

  getAlertsByVehicle(vehicleId: string): Observable<Alert[]> {
    return this.http.get<Alert[]>(
      `${this.baseUrl}/alerts/vehicle/${vehicleId}`
    );
  }

  getAlert(id: number): Observable<Alert> {
    return this.http.get<Alert>(`${this.baseUrl}/alerts/${id}`);
  }

  createAlert(alert: AlertRequest): Observable<Alert> {
    return this.http.post<Alert>(`${this.baseUrl}/alerts`, alert);
  }

  acknowledgeAlert(id: number, acknowledgedBy: string): Observable<Alert> {
    return this.http.patch<Alert>(`${this.baseUrl}/alerts/${id}/acknowledge`, {
      acknowledgedBy,
    });
  }

  resolveAlert(id: number, resolvedBy: string): Observable<Alert> {
    return this.http.patch<Alert>(`${this.baseUrl}/alerts/${id}/resolve`, {
      resolvedBy,
    });
  }

  getAlertsBySeverity(severity: string): Observable<Alert[]> {
    return this.http.get<Alert[]>(
      `${this.baseUrl}/alerts/severity/${severity}`
    );
  }

  getAlertsByStatus(status: string): Observable<Alert[]> {
    return this.http.get<Alert[]>(`${this.baseUrl}/alerts/status/${status}`);
  }

  // Vehicle endpoints
  getVehicles(): Observable<Vehicle[]> {
    console.log(
      "API Service: Getting vehicles from",
      `${this.baseUrl}/vehicles`
    );
    return this.http.get<Vehicle[]>(`${this.baseUrl}/vehicles`).pipe(
      timeout(5000), // 5 second timeout
      catchError((error) => {
        console.error("API Service: Error getting vehicles:", error);
        return of([]); // Return empty array on error
      })
    );
  }

  getVehicle(vehicleId: string): Observable<Vehicle> {
    return this.http.get<Vehicle>(`${this.baseUrl}/vehicles/${vehicleId}`);
  }

  createVehicle(vehicle: Vehicle): Observable<Vehicle> {
    return this.http.post<Vehicle>(`${this.baseUrl}/vehicles`, vehicle);
  }

  updateVehicle(vehicleId: string, vehicle: Vehicle): Observable<Vehicle> {
    return this.http.put<Vehicle>(
      `${this.baseUrl}/vehicles/${vehicleId}`,
      vehicle
    );
  }

  deleteVehicle(vehicleId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/vehicles/${vehicleId}`);
  }

  // Analytics endpoints
  getAnalyticsOverview(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/analytics/overview`);
  }

  getVehiclePerformance(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/analytics/vehicles/performance`
    );
  }

  getTelemetryTrends(hours: number = 24): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/analytics/telemetry/trends?hours=${hours}`
    );
  }

  getAlertPatterns(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/analytics/alerts/patterns`);
  }

  getMissionAnalytics(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/analytics/missions/analytics`);
  }

  getGeographicHeatmap(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/analytics/geographic/heatmap`);
  }
}
