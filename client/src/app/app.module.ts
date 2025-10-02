import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { HttpClientModule } from "@angular/common/http";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { CommonModule, DatePipe } from "@angular/common";

import { MatToolbarModule } from "@angular/material/toolbar";
import { MatButtonModule } from "@angular/material/button";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatIconModule } from "@angular/material/icon";
import { MatListModule } from "@angular/material/list";
import { MatCardModule } from "@angular/material/card";
import { MatTableModule } from "@angular/material/table";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule } from "@angular/material/core";
import { MatChipsModule } from "@angular/material/chips";
import { MatBadgeModule } from "@angular/material/badge";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatDialogModule } from "@angular/material/dialog";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatTabsModule } from "@angular/material/tabs";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatTooltipModule } from "@angular/material/tooltip";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { DashboardComponent } from "./components/dashboard/dashboard.component";
import { MissionsComponent } from "./components/missions/missions.component";
import { MissionFormComponent } from "./components/mission-form/mission-form.component";
import { VehicleMapComponent } from "./components/vehicle-map/vehicle-map.component";
import { AlertsComponent } from "./components/alerts/alerts.component";
import { VehicleDetailComponent } from "./components/vehicle-detail/vehicle-detail.component";
import { NavigationComponent } from "./components/navigation/navigation.component";
import { NotificationDrawerComponent } from "./components/notification-drawer/notification-drawer.component";
import { VehiclesComponent } from "./components/vehicles/vehicles.component";
import { VehicleFormComponent } from "./components/vehicle-form/vehicle-form.component";
import { AlertsManagementComponent } from "./components/alerts-management/alerts-management.component";

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    MissionsComponent,
    MissionFormComponent,
    VehicleMapComponent,
    AlertsComponent,
    VehicleDetailComponent,
    NavigationComponent,
    NotificationDrawerComponent,
    VehiclesComponent,
    VehicleFormComponent,
    AlertsManagementComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatBadgeModule,
    MatSnackBarModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatExpansionModule,
    MatTooltipModule,
  ],
  providers: [DatePipe],
  bootstrap: [AppComponent],
})
export class AppModule {}
