import { Component, OnInit } from "@angular/core";
import { ApiService } from "../../services/api.service";

@Component({
  selector: "app-mission-manager-debug",
  template: `
    <div style="padding: 20px;">
      <h2>Mission Manager Debug</h2>
      <button (click)="testApi()">Test API</button>
      <div *ngIf="loading">Loading...</div>
      <div *ngIf="error" style="color: red;">Error: {{ error }}</div>
      <div *ngIf="data">
        <h3>API Response:</h3>
        <pre>{{ data | json }}</pre>
      </div>
    </div>
  `,
})
export class MissionManagerDebugComponent implements OnInit {
  loading = false;
  error: string | null = null;
  data: any = null;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.testApi();
  }

  testApi(): void {
    this.loading = true;
    this.error = null;
    this.data = null;

    console.log("Testing API...");

    this.apiService.getMissions().subscribe({
      next: (response) => {
        console.log("API Response:", response);
        this.data = response;
        this.loading = false;
      },
      error: (error) => {
        console.error("API Error:", error);
        this.error = error.message || "Unknown error";
        this.loading = false;
      },
    });
  }
}
