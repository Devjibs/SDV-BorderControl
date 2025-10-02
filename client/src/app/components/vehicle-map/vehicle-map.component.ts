import { Component, Input, OnInit, OnDestroy } from "@angular/core";
import * as L from "leaflet";

@Component({
  selector: "app-vehicle-map",
  templateUrl: "./vehicle-map.component.html",
  styleUrls: ["./vehicle-map.component.scss"],
})
export class VehicleMapComponent implements OnInit, OnDestroy {
  @Input() vehicles: any[] = [];

  private map: L.Map | undefined;
  private markers: L.Marker[] = [];

  ngOnInit(): void {
    this.initMap();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap(): void {
    // Default center (New York City)
    const defaultCenter: [number, number] = [40.7128, -74.006];

    this.map = L.map("map").setView(defaultCenter, 10);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(this.map);

    this.updateMarkers();
  }

  private updateMarkers(): void {
    if (!this.map) return;

    // Clear existing markers
    this.markers.forEach((marker) => this.map?.removeLayer(marker));
    this.markers = [];

    // Add new markers
    this.vehicles.forEach((vehicle) => {
      if (vehicle.position) {
        const marker = L.marker([vehicle.position.lat, vehicle.position.lng], {
          icon: this.getVehicleIcon(vehicle.status),
        }).addTo(this.map!);

        marker.bindPopup(`
          <div>
            <h3>${vehicle.name}</h3>
            <p><strong>Status:</strong> ${vehicle.status}</p>
            <p><strong>Last Seen:</strong> ${new Date(
              vehicle.lastSeen
            ).toLocaleString()}</p>
          </div>
        `);

        this.markers.push(marker);
      }
    });
  }

  private getVehicleIcon(status: string): L.DivIcon {
    const iconColor = this.getStatusColor(status);

    return L.divIcon({
      className: "vehicle-marker",
      html: `<div style="
        background-color: ${iconColor};
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  }

  private getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case "online":
        return "#4caf50";
      case "offline":
        return "#f44336";
      case "onmission":
        return "#2196f3";
      case "alert":
        return "#ff9800";
      default:
        return "#9e9e9e";
    }
  }

  ngOnChanges(): void {
    if (this.map) {
      this.updateMarkers();
    }
  }
}
