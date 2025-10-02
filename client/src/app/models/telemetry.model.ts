import { Alert } from "./alert.model";

export interface TelemetryRecord {
  id: number;
  vehicleId: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  speed: number;
  temperature: number;
  altitude: number;
  heading: number;
  additionalData: { [key: string]: any };
}

export interface TelemetryData {
  timestamp: string;
  latitude: number;
  longitude: number;
  speed: number;
  temperature: number;
  altitude: number;
  heading: number;
  additionalData: { [key: string]: any };
}

export interface Vehicle {
  vehicleId: string;
  name: string;
  type: VehicleType;
  status: VehicleStatus;
  lastSeen?: string;
  lastTelemetry?: TelemetryRecord;
  activeAlerts?: Alert[];
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export enum VehicleType {
  Patrol = "Patrol",
  Surveillance = "Surveillance",
  Emergency = "Emergency",
  Transport = "Transport",
}

export enum VehicleStatus {
  Offline = "Offline",
  Online = "Online",
  OnMission = "OnMission",
  Maintenance = "Maintenance",
  Alert = "Alert",
}
