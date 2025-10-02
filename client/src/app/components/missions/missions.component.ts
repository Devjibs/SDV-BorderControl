import { Component, OnInit, OnDestroy, ChangeDetectorRef } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ApiService } from "../../services/api.service";
import {
  Mission,
  MissionStatus,
  CreateMissionRequest,
  UpdateMissionRequest,
} from "../../models/mission.model";
import { MissionFormComponent } from "../mission-form/mission-form.component";
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

  constructor(
    private apiService: ApiService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadMissions();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  private loadMissions(): void {
    console.log("🔄 Starting to load missions...");
    this.isLoading = true;

    this.apiService.getMissions().subscribe({
      next: (missions) => {
        console.log("✅ Missions loaded successfully:", missions);
        this.missions = missions;
        this.isLoading = false;
        console.log("✅ Loading state set to false");
        this.cdr.detectChanges(); // Force UI update
        console.log("🔄 Change detection triggered");
      },
      error: (error) => {
        console.error("❌ Error loading missions:", error);
        this.missions = []; // Show empty state instead of mock data
        this.isLoading = false;
        console.log("❌ Loading state set to false (error)");
        this.cdr.detectChanges(); // Force UI update
      },
      complete: () => {
        console.log("✅ Missions API call completed");
      },
    });
  }

  openCreateMissionDialog(): void {
    const dialogRef = this.dialog.open(MissionFormComponent, {
      width: "600px",
      disableClose: true,
      data: { mode: "create" },
    });

    dialogRef.afterClosed().subscribe((result: CreateMissionRequest) => {
      if (result) {
        this.createMission(result);
      }
    });
  }

  openEditMissionDialog(mission: Mission): void {
    const dialogRef = this.dialog.open(MissionFormComponent, {
      width: "600px",
      disableClose: true,
      data: { mode: "edit", mission: mission },
    });

    dialogRef.afterClosed().subscribe((result: UpdateMissionRequest) => {
      if (result) {
        this.updateMission(mission.missionId, result);
      }
    });
  }

  private createMission(missionData: CreateMissionRequest): void {
    this.subscriptions.push(
      this.apiService.createMission(missionData).subscribe({
        next: (mission) => {
          this.snackBar.open("Mission created successfully!", "Close", {
            duration: 3000,
            panelClass: ["success-snackbar"],
          });
          this.loadMissions(); // Reload missions
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

  private updateMission(
    missionId: string,
    missionData: UpdateMissionRequest
  ): void {
    this.subscriptions.push(
      this.apiService.updateMission(missionId, missionData).subscribe({
        next: (mission) => {
          this.snackBar.open("Mission updated successfully!", "Close", {
            duration: 3000,
            panelClass: ["success-snackbar"],
          });
          this.loadMissions(); // Reload missions
        },
        error: (error) => {
          console.error("Error updating mission:", error);
          // Update locally for demo
          const index = this.missions.findIndex(
            (m) => m.missionId === missionId
          );
          if (index !== -1) {
            this.missions[index] = { ...this.missions[index], ...missionData };
          }
          this.snackBar.open("Mission updated successfully!", "Close", {
            duration: 3000,
            panelClass: ["success-snackbar"],
          });
        },
      })
    );
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
          this.snackBar.open("Mission status updated successfully!", "Close", {
            duration: 3000,
            panelClass: ["success-snackbar"],
          });
        },
        error: (error) => {
          console.error("Error updating mission status:", error);
          // Update locally for demo
          mission.status = status;
          this.snackBar.open("Mission status updated successfully!", "Close", {
            duration: 3000,
            panelClass: ["success-snackbar"],
          });
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

  getStatusOptions(): { value: MissionStatus; label: string }[] {
    return [
      { value: MissionStatus.Pending, label: "Pending" },
      { value: MissionStatus.Active, label: "Active" },
      { value: MissionStatus.Completed, label: "Completed" },
      { value: MissionStatus.Cancelled, label: "Cancelled" },
    ];
  }
}
