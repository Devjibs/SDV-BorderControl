import { Component, OnInit, OnDestroy } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ApiService } from "../../services/api.service";
import {
  Mission,
  CreateMissionRequest,
  UpdateMissionRequest,
} from "../../models/mission.model";
import { MissionFormComponent } from "../mission-form/mission-form.component";
import { Subscription } from "rxjs";

@Component({
  selector: "app-mission-manager",
  templateUrl: "./mission-manager.component.html",
  styleUrls: ["./mission-manager.component.scss"],
})
export class MissionManagerComponent implements OnInit, OnDestroy {
  missions: Mission[] = [];
  isLoading = true;
  error: string | null = null;

  displayedColumns: string[] = [
    "name",
    "startTime",
    "endTime",
    "vehicleCount",
    "status",
    "actions",
  ];

  private subscriptions: Subscription[] = [];

  constructor(
    private apiService: ApiService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadMissions();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  private loadMissions(): void {
    this.isLoading = true;
    this.error = null;

    // Use the simple getMissions without pagination parameters
    this.subscriptions.push(
      this.apiService.getMissions().subscribe({
        next: (response) => {
          console.log("Missions loaded:", response);
          this.missions = response.missions || [];
          this.isLoading = false;
        },
        error: (error) => {
          console.error("Error loading missions:", error);
          this.error = "Failed to load missions. Please try again.";
          this.missions = [];
          this.isLoading = false;
          this.snackBar.open("Error loading missions", "Close", {
            duration: 5000,
            panelClass: ["error-snackbar"],
          });
        },
      })
    );
  }

  openCreateMissionDialog(): void {
    const dialogRef = this.dialog.open(MissionFormComponent, {
      width: "600px",
      disableClose: true,
      data: { mode: "create" },
    });

    this.subscriptions.push(
      dialogRef.afterClosed().subscribe((result: CreateMissionRequest) => {
        if (result) {
          this.createMission(result);
        }
      })
    );
  }

  openEditMissionDialog(mission: Mission): void {
    const dialogRef = this.dialog.open(MissionFormComponent, {
      width: "600px",
      disableClose: true,
      data: { mode: "edit", mission: mission },
    });

    this.subscriptions.push(
      dialogRef.afterClosed().subscribe((result: UpdateMissionRequest) => {
        if (result) {
          this.updateMission(mission.missionId, result);
        }
      })
    );
  }

  createMission(createRequest: CreateMissionRequest): void {
    this.subscriptions.push(
      this.apiService.createMission(createRequest).subscribe({
        next: (mission) => {
          this.snackBar.open("Mission created successfully!", "Close", {
            duration: 3000,
            panelClass: ["success-snackbar"],
          });
          this.missions.unshift(mission);
        },
        error: (error) => {
          console.error("Error creating mission:", error);
          this.snackBar.open(
            "Error creating mission. Please try again.",
            "Close",
            {
              duration: 5000,
              panelClass: ["error-snackbar"],
            }
          );
        },
      })
    );
  }

  updateMission(missionId: string, updateRequest: UpdateMissionRequest): void {
    this.subscriptions.push(
      this.apiService.updateMission(missionId, updateRequest).subscribe({
        next: (mission) => {
          this.snackBar.open("Mission updated successfully!", "Close", {
            duration: 3000,
            panelClass: ["success-snackbar"],
          });
          const index = this.missions.findIndex(
            (m) => m.missionId === missionId
          );
          if (index !== -1) {
            this.missions[index] = mission;
          }
        },
        error: (error) => {
          console.error("Error updating mission:", error);
          this.snackBar.open(
            "Error updating mission. Please try again.",
            "Close",
            {
              duration: 5000,
              panelClass: ["error-snackbar"],
            }
          );
        },
      })
    );
  }

  deleteMission(mission: Mission): void {
    if (confirm(`Are you sure you want to delete mission "${mission.name}"?`)) {
      this.subscriptions.push(
        this.apiService.deleteMission(mission.missionId).subscribe({
          next: () => {
            this.snackBar.open("Mission deleted successfully!", "Close", {
              duration: 3000,
              panelClass: ["success-snackbar"],
            });
            this.missions = this.missions.filter(
              (m) => m.missionId !== mission.missionId
            );
          },
          error: (error) => {
            console.error("Error deleting mission:", error);
            this.snackBar.open(
              "Error deleting mission. Please try again.",
              "Close",
              {
                duration: 5000,
                panelClass: ["error-snackbar"],
              }
            );
          },
        })
      );
    }
  }

  updateMissionStatus(mission: Mission, event: any): void {
    const status = event.target ? event.target.value : event;
    this.subscriptions.push(
      this.apiService.updateMissionStatus(mission.missionId, status).subscribe({
        next: (updatedMission) => {
          const index = this.missions.findIndex(
            (m) => m.missionId === mission.missionId
          );
          if (index !== -1) {
            this.missions[index] = updatedMission;
          }
          this.snackBar.open("Mission status updated successfully!", "Close", {
            duration: 3000,
            panelClass: ["success-snackbar"],
          });
        },
        error: (error) => {
          console.error("Error updating mission status:", error);
          this.snackBar.open(
            "Error updating mission status. Please try again.",
            "Close",
            {
              duration: 5000,
              panelClass: ["error-snackbar"],
            }
          );
        },
      })
    );
  }

  getVehicleCount(mission: Mission): number {
    return mission.vehicleIds ? mission.vehicleIds.length : 0;
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

  getStatusOptions(): { value: string; label: string }[] {
    return [
      { value: "Pending", label: "Pending" },
      { value: "Active", label: "Active" },
      { value: "Completed", label: "Completed" },
      { value: "Cancelled", label: "Cancelled" },
    ];
  }

  refreshMissions(): void {
    this.loadMissions();
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
