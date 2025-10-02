import { Component, OnInit, Inject } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ApiService } from "../../services/api.service";
import {
  Mission,
  CreateMissionRequest,
  UpdateMissionRequest,
} from "../../models/mission.model";
import { Vehicle, VehicleType } from "../../models/telemetry.model";

export interface MissionFormData {
  mode: "create" | "edit";
  mission?: Mission;
}

@Component({
  selector: "app-mission-form",
  templateUrl: "./mission-form.component.html",
  styleUrls: ["./mission-form.component.scss"],
})
export class MissionFormComponent implements OnInit {
  missionForm!: FormGroup;
  isEditMode = false;
  selectedVehicles: any[] = [];
  availableVehicles: Vehicle[] = [];
  isLoading = true;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private dialogRef: MatDialogRef<MissionFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MissionFormData
  ) {
    this.isEditMode = data.mode === "edit";
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadVehicles();

    // Set default start time to now
    const now = new Date();
    this.missionForm.patchValue({
      startTime: now.toISOString().slice(0, 16),
    });

    // Watch for vehicle selection changes
    this.missionForm.get("vehicleIds")?.valueChanges.subscribe((vehicleIds) => {
      this.selectedVehicles = this.availableVehicles.filter((v) =>
        vehicleIds.includes(v.vehicleId)
      );
    });
  }

  private loadVehicles(): void {
    this.isLoading = true;
    this.apiService.getVehicles().subscribe({
      next: (vehicles) => {
        this.availableVehicles = vehicles;
        this.isLoading = false;
        this.updateSelectedVehicles();
      },
      error: (error) => {
        console.error("Error loading vehicles:", error);
        // Fallback to mock data
        this.availableVehicles = [
          {
            vehicleId: "vehicle_001",
            name: "Patrol Vehicle 001",
            type: VehicleType.Patrol,
            status: "Online" as any,
            activeAlerts: [],
          },
          {
            vehicleId: "vehicle_002",
            name: "Patrol Vehicle 002",
            type: VehicleType.Patrol,
            status: "Online" as any,
            activeAlerts: [],
          },
        ];
        this.isLoading = false;
        this.updateSelectedVehicles();
      },
    });
  }

  private updateSelectedVehicles(): void {
    if (this.isEditMode && this.data.mission) {
      this.selectedVehicles = this.availableVehicles.filter((v) =>
        this.data.mission!.vehicleIds.includes(v.vehicleId)
      );
    }
  }

  private initializeForm(): void {
    this.missionForm = this.fb.group({
      name: ["", [Validators.required, Validators.minLength(3)]],
      startTime: ["", Validators.required],
      endTime: ["", Validators.required],
      vehicleIds: [[], Validators.required],
    });

    if (this.isEditMode && this.data.mission) {
      this.missionForm.patchValue({
        name: this.data.mission.name,
        startTime: new Date(this.data.mission.startTime)
          .toISOString()
          .slice(0, 16),
        endTime: new Date(this.data.mission.endTime).toISOString().slice(0, 16),
        vehicleIds: this.data.mission.vehicleIds,
      });
    }
  }

  onSubmit(): void {
    if (this.missionForm.valid) {
      const formValue = this.missionForm.value;

      if (this.isEditMode) {
        const mission: UpdateMissionRequest = {
          name: formValue.name,
          startTime: new Date(formValue.startTime).toISOString(),
          endTime: new Date(formValue.endTime).toISOString(),
          vehicleIds: formValue.vehicleIds,
          status: this.data.mission!.status,
        };
        this.dialogRef.close(mission);
      } else {
        const mission: CreateMissionRequest = {
          name: formValue.name,
          startTime: new Date(formValue.startTime).toISOString(),
          endTime: new Date(formValue.endTime).toISOString(),
          vehicleIds: formValue.vehicleIds,
        };
        this.dialogRef.close(mission);
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  removeVehicle(vehicleId: string): void {
    const currentIds = this.missionForm.get("vehicleIds")?.value || [];
    const updatedIds = currentIds.filter((id: string) => id !== vehicleId);
    this.missionForm.patchValue({ vehicleIds: updatedIds });
  }

  getVehicleIcon(type: VehicleType): string {
    switch (type) {
      case VehicleType.Patrol:
        return "local_police";
      case VehicleType.Surveillance:
        return "visibility";
      case VehicleType.Emergency:
        return "emergency";
      case VehicleType.Transport:
        return "local_shipping";
      default:
        return "directions_car";
    }
  }

  getTitle(): string {
    return this.isEditMode ? "Edit Mission" : "Create New Mission";
  }

  getSubmitButtonText(): string {
    return this.isEditMode ? "Update Mission" : "Create Mission";
  }
}
