import { Component, OnInit, OnDestroy } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ApiService } from "../../services/api.service";
import {
  Mission,
  MissionStatus,
  CreateMissionRequest,
  UpdateMissionRequest,
} from "../../models/mission.model";
import { Subscription } from "rxjs";

@Component({
  selector: "app-missions",
  templateUrl: "./missions.component.html",
  styleUrls: ["./missions.component.scss"],
})
export class MissionsComponent implements OnInit, OnDestroy {
  missions: Mission[] = [];
  paginatedMissions: Mission[] = [];
  isLoading = true;

  // Pagination
  currentPage = 1;
  pageSize = 6;
  totalPages = 0;
  totalItems = 0;

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
    this.subscriptions.push(
      this.apiService.getMissions().subscribe({
        next: (missions) => {
          this.missions = missions || [];
          this.updatePagination();
          this.isLoading = false;
        },
        error: (error) => {
          console.error("Error loading missions:", error);
          this.missions = [];
          this.updatePagination();
          this.isLoading = false;
        },
      })
    );
  }

  openCreateMissionDialog(): void {
    // For now, just show a simple message
    this.snackBar.open("Create Mission dialog will be implemented", "Close", {
      duration: 3000,
    });
  }

  openEditMissionDialog(mission: Mission): void {
    // For now, just show a simple message
    this.snackBar.open(
      `Edit Mission ${mission.name} dialog will be implemented`,
      "Close",
      {
        duration: 3000,
      }
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
            this.loadMissions();
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

  updateMissionStatus(mission: Mission, status: MissionStatus): void {
    this.subscriptions.push(
      this.apiService.updateMissionStatus(mission.missionId, status).subscribe({
        next: () => {
          // Update locally for immediate feedback
          const index = this.missions.findIndex(
            (m) => m.missionId === mission.missionId
          );
          if (index !== -1) {
            this.missions[index].status = status;
            this.updatePagination();
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

  getStatusOptions(): { value: MissionStatus; label: string }[] {
    return [
      { value: MissionStatus.Pending, label: "Pending" },
      { value: MissionStatus.Active, label: "Active" },
      { value: MissionStatus.Completed, label: "Completed" },
      { value: MissionStatus.Cancelled, label: "Cancelled" },
    ];
  }

  // Pagination methods
  private updatePagination(): void {
    this.totalItems = this.missions.length;
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);

    // Ensure current page is within bounds
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    } else if (this.currentPage === 0 && this.totalPages > 0) {
      this.currentPage = 1;
    } else if (this.totalPages === 0) {
      this.currentPage = 1;
    }

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedMissions = this.missions.slice(startIndex, endIndex);
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(
      1,
      this.currentPage - Math.floor(maxVisiblePages / 2)
    );
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

    // Adjust startPage if we're at the end of the total pages
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  getStartItem(): number {
    if (this.totalItems === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  getEndItem(): number {
    if (this.totalItems === 0) return 0;
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }
}
