import { Injectable } from "@angular/core";
import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import { BehaviorSubject, Observable } from "rxjs";
import { TelemetryRecord } from "../models/telemetry.model";
import { Alert } from "../models/alert.model";

@Injectable({
  providedIn: "root",
})
export class WebSocketService {
  private hubConnection: HubConnection;
  private telemetrySubject = new BehaviorSubject<TelemetryRecord | null>(null);
  private alertSubject = new BehaviorSubject<Alert | null>(null);

  constructor() {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl("http://localhost:5001/telemetryHub")
      .build();

    this.startConnection();
  }

  private startConnection(): void {
    this.hubConnection
      .start()
      .then(() => {
        console.log("WebSocket connection started");
        this.setupEventHandlers();
      })
      .catch((err) =>
        console.error("Error starting WebSocket connection:", err)
      );
  }

  private setupEventHandlers(): void {
    this.hubConnection.on("TelemetryUpdate", (telemetry: TelemetryRecord) => {
      this.telemetrySubject.next(telemetry);
    });

    this.hubConnection.on("AlertUpdate", (alert: Alert) => {
      this.alertSubject.next(alert);
    });
  }

  joinVehicleGroup(vehicleId: string): void {
    this.hubConnection.invoke("JoinVehicleGroup", vehicleId);
  }

  leaveVehicleGroup(vehicleId: string): void {
    this.hubConnection.invoke("LeaveVehicleGroup", vehicleId);
  }

  joinDashboardGroup(): void {
    this.hubConnection.invoke("JoinDashboardGroup");
  }

  leaveDashboardGroup(): void {
    this.hubConnection.invoke("LeaveDashboardGroup");
  }

  getTelemetryUpdates(): Observable<TelemetryRecord | null> {
    return this.telemetrySubject.asObservable();
  }

  getAlertUpdates(): Observable<Alert | null> {
    return this.alertSubject.asObservable();
  }

  disconnect(): void {
    this.hubConnection.stop();
  }
}
