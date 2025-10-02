import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ApiService } from "../../services/api.service";
import {
  Mission,
  CreateMissionRequest,
  UpdateMissionRequest,
} from "../../models/mission.model";
import { Vehicle } from "../../models/telemetry.model";

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
  vehicles: Vehicle[] = [];
  isLoading = false;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<MissionFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MissionFormData,
    private apiService: ApiService,
    private snackBar: MatSnackBar
  ) {
    this.isEditMode = data.mode === "edit";
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadVehicles();
    if (this.isEditMode && this.data.mission) {
      this.populateForm();
    }
  }

  private initializeForm(): void {
    this.missionForm = this.fb.group({
      name: ["", [Validators.required, Validators.minLength(3)]],
      startTime: ["", Validators.required],
      endTime: ["", Validators.required],
      vehicleIds: [[], Validators.required],
      status: [this.isEditMode ? "" : "Pending", Validators.required],
    });

    // Add custom validator for end time
    this.missionForm
      .get("endTime")
      ?.setValidators([
        Validators.required,
        this.endTimeAfterStartTime.bind(this),
      ]);
  }

  private endTimeAfterStartTime(control: any) {
    if (!control || !this.missionForm) return null;

    const startTime = this.missionForm.get("startTime")?.value;
    const endTime = control.value;

    if (startTime && endTime && new Date(endTime) <= new Date(startTime)) {
      return { endTimeBeforeStart: true };
    }

    return null;
  }

  private loadVehicles(): void {
    this.isLoading = true;
    this.apiService.getVehicles().subscribe({
      next: (vehicles) => {
        this.vehicles = vehicles || [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error("Error loading vehicles:", error);
        this.snackBar.open(
          "Error loading vehicles. Please try again.",
          "Close",
          {
            duration: 5000,
            panelClass: ["error-snackbar"],
          }
        );
        this.isLoading = false;
      },
    });
  }

  private populateForm(): void {
    if (this.data.mission) {
      // Convert ISO strings to datetime-local format
      const startTime = this.data.mission.startTime
        ? new Date(this.data.mission.startTime).toISOString().slice(0, 16)
        : "";
      const endTime = this.data.mission.endTime
        ? new Date(this.data.mission.endTime).toISOString().slice(0, 16)
        : "";

      this.missionForm.patchValue({
        name: this.data.mission.name,
        startTime: startTime,
        endTime: endTime,
        vehicleIds: this.data.mission.vehicleIds || [],
        status: this.data.mission.status,
      });
    }
  }

  onSubmit(): void {
    if (this.missionForm.valid && !this.isLoading) {
      this.isLoading = true;

      if (this.isEditMode) {
        this.updateMission();
      } else {
        this.createMission();
      }
    } else if (!this.isLoading) {
      this.markFormGroupTouched();
      this.snackBar.open(
        "Please fill in all required fields correctly.",
        "Close",
        {
          duration: 5000,
          panelClass: ["error-snackbar"],
        }
      );
    }
  }

  private createMission(): void {
    const formData = this.missionForm.value;
    const createRequest: CreateMissionRequest = {
      name: formData.name,
      startTime: new Date(formData.startTime).toISOString(),
      endTime: new Date(formData.endTime).toISOString(),
      vehicleIds: formData.vehicleIds,
    };

    this.apiService.createMission(createRequest).subscribe({
      next: (mission) => {
        this.isLoading = false;
        this.snackBar.open("Mission created successfully!", "Close", {
          duration: 3000,
          panelClass: ["success-snackbar"],
        });
        this.dialogRef.close(mission);
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
        this.isLoading = false;
      },
    });
  }

  private updateMission(): void {
    if (!this.data.mission) return;

    const formData = this.missionForm.value;
    const updateRequest: UpdateMissionRequest = {
      name: formData.name,
      startTime: new Date(formData.startTime).toISOString(),
      endTime: new Date(formData.endTime).toISOString(),
      vehicleIds: formData.vehicleIds,
      status: formData.status,
    };

    this.apiService
      .updateMission(this.data.mission.missionId, updateRequest)
      .subscribe({
        next: (mission) => {
          this.isLoading = false;
          this.snackBar.open("Mission updated successfully!", "Close", {
            duration: 3000,
            panelClass: ["success-snackbar"],
          });
          this.dialogRef.close(mission);
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
          this.isLoading = false;
        },
      });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.missionForm.controls).forEach((key) => {
      const control = this.missionForm.get(key);
      control?.markAsTouched();
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getErrorMessage(fieldName: string): string {
    const control = this.missionForm.get(fieldName);
    if (control?.hasError("required")) {
      return `${this.getFieldDisplayName(fieldName)} is required`;
    }
    if (control?.hasError("minlength")) {
      return `${this.getFieldDisplayName(
        fieldName
      )} must be at least 3 characters`;
    }
    if (control?.hasError("endTimeBeforeStart")) {
      return "End time must be after start time";
    }
    return "";
  }

  private getFieldDisplayName(fieldName: string): string {
    const fieldNames: { [key: string]: string } = {
      name: "Mission Name",
      startTime: "Start Time",
      endTime: "End Time",
      vehicleIds: "Vehicles",
      status: "Status",
    };
    return fieldNames[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.missionForm.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }
}
