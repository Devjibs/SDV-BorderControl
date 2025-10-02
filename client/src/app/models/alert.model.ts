export interface Alert {
  id: number;
  vehicleId: string;
  type: string;
  message: string;
  severity: AlertSeverity;
  timestamp: string;
  status: AlertStatus;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  additionalData: { [key: string]: any };
}

export interface AlertRequest {
  vehicleId: string;
  type: string;
  message: string;
  severity: AlertSeverity;
  additionalData: { [key: string]: any };
}

export enum AlertSeverity {
  Low = "Low",
  Medium = "Medium",
  High = "High",
  Critical = "Critical",
}

export enum AlertStatus {
  Open = "Open",
  Acknowledged = "Acknowledged",
  Resolved = "Resolved",
}

