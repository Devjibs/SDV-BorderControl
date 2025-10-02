export interface Mission {
  missionId: string;
  name: string;
  startTime: string;
  endTime: string;
  vehicleIds: string[];
  status: string; // Changed from MissionStatus to string to match API response
  createdAt: string;
  updatedAt?: string;
}

export enum MissionStatus {
  Pending = "Pending",
  Active = "Active",
  Completed = "Completed",
  Cancelled = "Cancelled",
}

export interface CreateMissionRequest {
  name: string;
  startTime: string;
  endTime: string;
  vehicleIds: string[];
}

export interface UpdateMissionRequest {
  name: string;
  startTime: string;
  endTime: string;
  vehicleIds: string[];
  status: string;
}
