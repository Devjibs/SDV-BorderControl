import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { DashboardComponent } from "./components/dashboard/dashboard.component";
import { VehicleDetailComponent } from "./components/vehicle-detail/vehicle-detail.component";
import { VehiclesComponent } from "./components/vehicles/vehicles.component";
import { AlertsManagementComponent } from "./components/alerts-management/alerts-management.component";
import { AnalyticsComponent } from "./components/analytics/analytics.component";
import { MissionManagerComponent } from "./components/mission-manager/mission-manager.component";

const routes: Routes = [
  { path: "", redirectTo: "/dashboard", pathMatch: "full" },
  { path: "dashboard", component: DashboardComponent },
  { path: "missions", redirectTo: "/mission-manager", pathMatch: "full" },
  { path: "mission-manager", component: MissionManagerComponent },
  { path: "vehicles", component: VehiclesComponent },
  { path: "alerts", component: AlertsManagementComponent },
  { path: "analytics", component: AnalyticsComponent },
  { path: "vehicle/:id", component: VehicleDetailComponent },
  { path: "**", redirectTo: "/dashboard" },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
