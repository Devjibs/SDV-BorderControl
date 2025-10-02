import { Component, OnInit, Inject } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import {
  Vehicle,
  VehicleType,
  VehicleStatus,
} from "../../models/telemetry.model";

export interface VehicleFormData {
  mode: "create" | "edit";
  vehicle?: Vehicle;
}

@Component({
  selector: "app-vehicle-form",
  templateUrl: "./vehicle-form.component.html",
  styleUrls: ["./vehicle-form.component.scss"],
})
export class VehicleFormComponent implements OnInit {
  vehicleForm!: FormGroup;
  isEditMode = false;
  vehicleTypes = Object.values(VehicleType);
  vehicleStatuses = Object.values(VehicleStatus);

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<VehicleFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: VehicleFormData
  ) {
    this.isEditMode = data.mode === "edit";
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.vehicleForm = this.fb.group({
      name: ["", [Validators.required, Validators.minLength(2)]],
      type: [VehicleType.Patrol, Validators.required],
      status: [VehicleStatus.Online, Validators.required],
    });

    if (this.isEditMode && this.data.vehicle) {
      this.vehicleForm.patchValue({
        name: this.data.vehicle.name,
        type: this.data.vehicle.type,
        status: this.data.vehicle.status,
      });
    }
  }

  onSubmit(): void {
    if (this.vehicleForm.valid) {
      const formValue = this.vehicleForm.value;
      const vehicle: Vehicle = {
        vehicleId: this.isEditMode ? this.data.vehicle!.vehicleId : "",
        name: formValue.name,
        type: formValue.type,
        status: formValue.status,
        lastSeen: this.isEditMode
          ? this.data.vehicle!.lastSeen
          : new Date().toISOString(),
        lastTelemetry: this.isEditMode
          ? this.data.vehicle!.lastTelemetry
          : undefined,
        activeAlerts: this.isEditMode ? this.data.vehicle!.activeAlerts : [],
      };

      this.dialogRef.close(vehicle);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getTitle(): string {
    return this.isEditMode ? "Edit Vehicle" : "Add New Vehicle";
  }

  getSubmitButtonText(): string {
    return this.isEditMode ? "Update Vehicle" : "Create Vehicle";
  }
}
