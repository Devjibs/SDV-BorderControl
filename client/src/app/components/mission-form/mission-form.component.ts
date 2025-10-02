import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
import { Mission, CreateMissionRequest } from "../../models/mission.model";

@Component({
  selector: "app-mission-form",
  templateUrl: "./mission-form.component.html",
  styleUrls: ["./mission-form.component.scss"],
})
export class MissionFormComponent implements OnInit {
  missionForm: FormGroup;
  availableVehicles = [
    { id: "vehicle_001", name: "Patrol Vehicle 001" },
    { id: "vehicle_002", name: "Patrol Vehicle 002" },
    { id: "vehicle_003", name: "Surveillance Vehicle 003" },
    { id: "vehicle_004", name: "Emergency Vehicle 004" },
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<MissionFormComponent>
  ) {
    this.missionForm = this.fb.group({
      name: ["", Validators.required],
      startTime: ["", Validators.required],
      endTime: ["", Validators.required],
      vehicleIds: [[], Validators.required],
    });
  }

  ngOnInit(): void {
    // Set default start time to now
    const now = new Date();
    this.missionForm.patchValue({
      startTime: now.toISOString().slice(0, 16),
    });
  }

  onSubmit(): void {
    if (this.missionForm.valid) {
      const formValue = this.missionForm.value;
      const mission: CreateMissionRequest = {
        name: formValue.name,
        startTime: new Date(formValue.startTime).toISOString(),
        endTime: new Date(formValue.endTime).toISOString(),
        vehicleIds: formValue.vehicleIds,
      };

      this.dialogRef.close(mission);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}

