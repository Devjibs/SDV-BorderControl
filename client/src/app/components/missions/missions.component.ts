import { Component, OnInit, OnDestroy } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ApiService } from "../../services/api.service";
import { Mission, MissionStatus } from "../../models/mission.model";
import { Subscription } from "rxjs";

@Component({
  selector: "app-missions",
  templateUrl: "./missions.component.html",
  styleUrls: ["./missions.component.scss"],
})
export class MissionsComponent implements OnInit, OnDestroy {
  missions: Mission[] = [];
  isLoading = true;
  displayedColumns: string[] = [
    "name",
    "startTime",
    "endTime",
    "vehicleCount",
    "status",
    "actions",
  ];

  private subscriptions: Subscription[] = [];

  constructor(private apiService: ApiService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadMissions();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  private loadMissions(): void {
    this.isLoading = true;
    this.subscriptions.push(
      this.apiService.getMissions().subscribe({
        next: (missions) => {
          this.missions = missions;
          this.isLoading = false;
        },
        error: (error) => {
          console.error("Error loading missions:", error);
          this.isLoading = false;
        },
      })
    );
  }

  openCreateMissionDialog(): void {
    // This would open a dialog to create a new mission
    // For now, we'll just log
    console.log("Create mission dialog would open here");
  }

  editMission(mission: Mission): void {
    // This would open a dialog to edit the mission
    console.log("Edit mission:", mission);
  }

  deleteMission(mission: Mission): void {
    if (confirm(`Are you sure you want to delete mission "${mission.name}"?`)) {
      this.subscriptions.push(
        this.apiService.deleteMission(mission.missionId).subscribe({
          next: () => {
            this.loadMissions(); // Reload missions
          },
          error: (error) => {
            console.error("Error deleting mission:", error);
          },
        })
      );
    }
  }

  updateMissionStatus(mission: Mission, status: MissionStatus): void {
    this.subscriptions.push(
      this.apiService.updateMissionStatus(mission.missionId, status).subscribe({
        next: () => {
          mission.status = status;
        },
        error: (error) => {
          console.error("Error updating mission status:", error);
        },
      })
    );
  }

  getMissionStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case "active":
        return "status-badge active";
      case "pending":
        return "status-badge pending";
      case "completed":
        return "status-badge completed";
      case "cancelled":
        return "status-badge cancelled";
      default:
        return "status-badge";
    }
  }

  getStatusOptions(): { value: MissionStatus; label: string }[] {
    return [
      { value: MissionStatus.Pending, label: "Pending" },
      { value: MissionStatus.Active, label: "Active" },
      { value: MissionStatus.Completed, label: "Completed" },
      { value: MissionStatus.Cancelled, label: "Cancelled" },
    ];
  }
}

