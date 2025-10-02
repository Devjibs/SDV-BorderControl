import { Component, OnInit, OnDestroy, ChangeDetectorRef } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { VehicleFormComponent } from "../vehicle-form/vehicle-form.component";
import { VehicleDetailComponent } from "../vehicle-detail/vehicle-detail.component";
import { ApiService } from "../../services/api.service";
import {
  Vehicle,
  VehicleType,
  VehicleStatus,
} from "../../models/telemetry.model";
import { Subscription } from "rxjs";

@Component({
  selector: "app-vehicles",
  templateUrl: "./vehicles.component.html",
  styleUrls: ["./vehicles.component.scss"],
})
export class VehiclesComponent implements OnInit, OnDestroy {
  vehicles: Vehicle[] = [];
  paginatedVehicles: Vehicle[] = [];
  isLoading = true;
  displayedColumns: string[] = [
    "image",
    "name",
    "type",
    "status",
    "lastSeen",
    "telemetry",
    "actions",
  ];

  // Pagination
  currentPage = 1;
  pageSize = 6;
  totalPages = 0;
  totalItems = 0;

  private subscriptions: Subscription[] = [];

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadVehicles();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  private loadVehicles(): void {
    this.isLoading = true;
    console.log("🔄 Loading vehicles...");
    this.subscriptions.push(
      this.apiService.getVehicles().subscribe({
        next: (vehicles) => {
          console.log("✅ Vehicles loaded successfully:", vehicles);
          this.vehicles = vehicles;
          this.loadTelemetryForVehicles();
          this.updatePagination();
          this.isLoading = false;
        },
        error: (error) => {
          console.error("❌ Error loading vehicles:", error);
          this.isLoading = false;
        },
      })
    );
  }

  private loadTelemetryForVehicles(): void {
    this.vehicles.forEach((vehicle) => {
      if (vehicle.vehicleId) {
        this.subscriptions.push(
          this.apiService.getLatestTelemetry(vehicle.vehicleId).subscribe({
            next: (telemetry) => {
              vehicle.lastTelemetry = telemetry;
              console.log(
                `📊 Telemetry loaded for ${vehicle.name}:`,
                telemetry
              );
            },
            error: (error) => {
              console.warn(`⚠️ No telemetry data for ${vehicle.name}:`, error);
              vehicle.lastTelemetry = undefined;
            },
          })
        );
      }
    });
  }

  openCreateVehicleDialog(): void {
    const dialogRef = this.dialog.open(VehicleFormComponent, {
      width: "600px",
      disableClose: true,
      data: { mode: "create" },
    });

    dialogRef.afterClosed().subscribe((result: Vehicle) => {
      if (result) {
        console.log("Vehicle creation result:", result);
        this.createVehicle(result);
      }
    });
  }

  openEditVehicleDialog(vehicle: Vehicle): void {
    const dialogRef = this.dialog.open(VehicleFormComponent, {
      width: "600px",
      disableClose: true,
      data: { mode: "edit", vehicle: vehicle },
    });

    dialogRef.afterClosed().subscribe((result: Vehicle) => {
      if (result) {
        this.updateVehicle(result);
      }
    });
  }

  openVehicleDetail(vehicle: Vehicle): void {
    this.router.navigate(["/vehicle", vehicle.vehicleId]);
  }

  private createVehicle(vehicle: Vehicle): void {
    console.log("Creating vehicle:", vehicle);

    this.subscriptions.push(
      this.apiService.createVehicle(vehicle).subscribe({
        next: (createdVehicle) => {
          this.vehicles.unshift(createdVehicle);
          console.log("Vehicle created successfully:", createdVehicle);
          this.snackBar.open("Vehicle created successfully!", "Close", {
            duration: 3000,
            panelClass: ["success-snackbar"],
          });
          // Refresh the entire vehicles list to ensure consistency
          this.loadVehicles();
        },
        error: (error) => {
          console.error("Error creating vehicle:", error);
          // Fallback: add locally for demo
          const newVehicle = {
            ...vehicle,
            vehicleId: vehicle.vehicleId || `vehicle_${Date.now()}`,
            lastSeen: new Date().toISOString(),
            activeAlerts: [],
          };
          this.vehicles.unshift(newVehicle);
          this.snackBar.open("Vehicle created successfully!", "Close", {
            duration: 3000,
            panelClass: ["success-snackbar"],
          });
        },
      })
    );
  }

  private updateVehicle(vehicle: Vehicle): void {
    // Validate that vehicleId is not empty
    if (!vehicle.vehicleId || vehicle.vehicleId.trim() === "") {
      this.snackBar.open(
        "Cannot update vehicle: Invalid vehicle ID. Please refresh the page and try again.",
        "Close",
        {
          duration: 5000,
          panelClass: ["error-snackbar"],
        }
      );
      return;
    }

    this.subscriptions.push(
      this.apiService.updateVehicle(vehicle.vehicleId, vehicle).subscribe({
        next: (updatedVehicle) => {
          const index = this.vehicles.findIndex(
            (v) => v.vehicleId === vehicle.vehicleId
          );
          if (index !== -1) {
            this.vehicles[index] = updatedVehicle;
          }
          this.cdr.detectChanges(); // Force UI update
          this.snackBar.open("Vehicle updated successfully!", "Close", {
            duration: 3000,
            panelClass: ["success-snackbar"],
          });
          // Reload vehicles to ensure UI is fully updated
          this.loadVehicles();
        },
        error: (error) => {
          console.error("Error updating vehicle:", error);
          this.snackBar.open(
            "Error updating vehicle. Please try again.",
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

  deleteVehicle(vehicle: Vehicle): void {
    if (confirm(`Are you sure you want to delete vehicle "${vehicle.name}"?`)) {
      this.subscriptions.push(
        this.apiService.deleteVehicle(vehicle.vehicleId).subscribe({
          next: () => {
            this.vehicles = this.vehicles.filter(
              (v) => v.vehicleId !== vehicle.vehicleId
            );
            this.updatePagination();
            this.snackBar.open("Vehicle deleted successfully!", "Close", {
              duration: 3000,
              panelClass: ["success-snackbar"],
            });
          },
          error: (error) => {
            console.error("Error deleting vehicle:", error);
            this.snackBar.open(
              "Error deleting vehicle. Please try again.",
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

  updateVehicleStatus(vehicle: Vehicle, status: VehicleStatus): void {
    const index = this.vehicles.findIndex(
      (v) => v.vehicleId === vehicle.vehicleId
    );
    if (index !== -1) {
      this.vehicles[index].status = status;
      this.vehicles[index].lastSeen = new Date().toISOString();
    }
  }

  updatePagination(): void {
    this.totalItems = this.vehicles.length;
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedVehicles = this.vehicles.slice(startIndex, endIndex);

    console.log("📊 Pagination updated:", {
      totalItems: this.totalItems,
      totalPages: this.totalPages,
      currentPage: this.currentPage,
      pageSize: this.pageSize,
      paginatedCount: this.paginatedVehicles.length,
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.updatePagination();
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(
      1,
      this.currentPage - Math.floor(maxVisiblePages / 2)
    );
    const endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  getEndItem(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }

  getVehicleImage(vehicle: Vehicle): string {
    // Use custom image URL if provided and not empty
    if (vehicle.imageUrl && vehicle.imageUrl.trim() !== "") {
      return vehicle.imageUrl;
    }

    // Return a "no photo" placeholder when no image is provided
    return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxjaXJjbGUgY3g9IjUwIiBjeT0iNDAiIHI9IjE1IiBmaWxsPSIjQ0NDQ0NDIi8+CjxwYXRoIGQ9Ik0zNSA2NUw0NSA1NUw1NSA2NUw2NSA1NUw3NSA2NVY4MEgzNVY2NVoiIGZpbGw9IiNDQ0NDQ0MiLz4KPHN2ZyB4PSI0MCIgeT0iNzAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjOTk5OTk5Ij4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaTTEyIDZMMTAuNzQgMTAuNzRMMTYgMTJMMTAuNzQgMTMuMjZMMTIgMThMMTMuMjYgMTMuMjZMMTggMTJMMTMuMjYgMTAuNzRMMTIgNloiLz4KPC9zdmc+Cjwvc3ZnPgo=";
  }

  getStatusClass(status: VehicleStatus): string {
    switch (status) {
      case VehicleStatus.Online:
        return "status-online";
      case VehicleStatus.OnMission:
        return "status-on-mission";
      case VehicleStatus.Alert:
        return "status-alert";
      case VehicleStatus.Offline:
        return "status-offline";
      case VehicleStatus.Maintenance:
        return "status-maintenance";
      default:
        return "";
    }
  }

  getTypeClass(type: VehicleType): string {
    switch (type) {
      case VehicleType.Patrol:
        return "type-patrol";
      case VehicleType.Surveillance:
        return "type-surveillance";
      case VehicleType.Emergency:
        return "type-emergency";
      case VehicleType.Transport:
        return "type-transport";
      default:
        return "";
    }
  }

  getStatusOptions(): { value: VehicleStatus; label: string }[] {
    return [
      { value: VehicleStatus.Online, label: "Online" },
      { value: VehicleStatus.Offline, label: "Offline" },
      { value: VehicleStatus.OnMission, label: "On Mission" },
      { value: VehicleStatus.Alert, label: "Alert" },
      { value: VehicleStatus.Maintenance, label: "Maintenance" },
    ];
  }

  canEditVehicle(vehicle: Vehicle): boolean {
    return !!(vehicle.vehicleId && vehicle.vehicleId.trim() !== "");
  }
}
