import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
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
  private readonly baseUrl = "http://localhost:5001/api";

  constructor(private http: HttpClient) {}

  // Mission endpoints
  getMissions(): Observable<Mission[]> {
    return this.http.get<Mission[]>(`${this.baseUrl}/missions`);
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
}
