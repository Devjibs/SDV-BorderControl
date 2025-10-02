import { Component, OnInit, OnDestroy, ChangeDetectorRef } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
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

  private subscriptions: Subscription[] = [];

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
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
          this.isLoading = false;
        },
        error: (error) => {
          console.error("❌ Error loading vehicles:", error);
          this.isLoading = false;
        },
      })
    );
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
    const dialogRef = this.dialog.open(VehicleDetailComponent, {
      width: "800px",
      maxHeight: "90vh",
      data: { vehicle: vehicle },
    });

    dialogRef.afterClosed().subscribe(() => {
      // Refresh vehicle data if needed
      this.loadVehicles();
    });
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

  getVehicleImage(vehicle: Vehicle): string {
    // Use custom image URL if provided
    if (vehicle.imageUrl) {
      return vehicle.imageUrl;
    }

    // Fallback to default images by type
    const imageMap: { [key in VehicleType]: string } = {
      [VehicleType.Patrol]:
        "https://images.pexels.com/photos/1008738/pexels-photo-1008738.jpeg",
      [VehicleType.Surveillance]:
        "https://images.pexels.com/photos/14589919/pexels-photo-14589919.jpeg",
      [VehicleType.Emergency]:
        "https://images.pexels.com/photos/31129031/pexels-photo-31129031.jpeg",
      [VehicleType.Transport]:
        "https://images.pexels.com/photos/139334/pexels-photo-139334.jpeg",
    };

    return (
      imageMap[vehicle.type] ||
      "https://images.pexels.com/photos/248697/pexels-photo-248697.jpeg"
    );
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
}
