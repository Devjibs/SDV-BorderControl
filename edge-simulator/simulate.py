#!/usr/bin/env python3
"""
SDV Edge Simulator
Simulates vehicle telemetry and alerts for the SDV Border Control Platform
"""

import argparse
import json
import random
import time
import requests
import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict, Any
import logging
from dataclasses import dataclass
import math
import os

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@dataclass
class VehicleConfig:
    vehicle_id: str
    name: str
    start_lat: float
    start_lon: float
    patrol_radius: float = 0.01  # ~1km radius
    max_speed: float = 80.0  # km/h
    normal_speed: float = 50.0  # km/h
    temperature_base: float = 25.0  # Celsius
    temperature_variance: float = 5.0

class TelemetryGenerator:
    def __init__(self, config: VehicleConfig):
        self.config = config
        self.current_lat = config.start_lat
        self.current_lon = config.start_lon
        self.current_speed = 0.0
        self.current_heading = random.uniform(0, 360)
        self.current_temperature = config.temperature_base
        
    def generate_telemetry(self) -> Dict[str, Any]:
        """Generate a single telemetry record"""
        # Simulate movement in a patrol pattern
        self._update_position()
        self._update_speed()
        self._update_temperature()
        
        return {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "latitude": self.current_lat,
            "longitude": self.current_lon,
            "speed": self.current_speed,
            "temperature": self.current_temperature,
            "altitude": random.uniform(100, 200),
            "heading": self.current_heading,
            "additionalData": {
                "engineStatus": "running",
                "fuelLevel": random.uniform(0.3, 1.0),
                "batteryLevel": random.uniform(0.7, 1.0)
            }
        }
    
    def _update_position(self):
        """Update vehicle position using a patrol pattern"""
        # Move in a circular patrol pattern
        angle_step = random.uniform(-10, 10)  # degrees
        self.current_heading = (self.current_heading + angle_step) % 360
        
        # Calculate distance based on speed (convert km/h to degrees)
        distance_km = (self.current_speed / 3600) * 0.1  # 0.1 second intervals
        distance_deg = distance_km / 111.0  # Approximate km per degree
        
        # Update position
        lat_offset = distance_deg * math.cos(math.radians(self.current_heading))
        lon_offset = distance_deg * math.sin(math.radians(self.current_heading))
        
        self.current_lat += lat_offset
        self.current_lon += lon_offset
        
        # Keep within patrol radius
        center_lat, center_lon = self.config.start_lat, self.config.start_lon
        distance_from_center = math.sqrt(
            (self.current_lat - center_lat)**2 + (self.current_lon - center_lon)**2
        )
        
        if distance_from_center > self.config.patrol_radius:
            # Move back towards center
            angle_to_center = math.atan2(center_lon - self.current_lon, center_lat - self.current_lat)
            self.current_heading = math.degrees(angle_to_center)
    
    def _update_speed(self):
        """Update vehicle speed with realistic patterns"""
        if random.random() < 0.1:  # 10% chance to change speed significantly
            if random.random() < 0.5:
                # Speed up
                self.current_speed = min(self.current_speed + random.uniform(5, 15), self.config.max_speed)
            else:
                # Slow down
                self.current_speed = max(self.current_speed - random.uniform(5, 15), 0)
        else:
            # Small random variation
            self.current_speed += random.uniform(-2, 2)
            self.current_speed = max(0, min(self.current_speed, self.config.max_speed))
    
    def _update_temperature(self):
        """Update temperature with realistic variation"""
        temp_change = random.uniform(-0.5, 0.5)
        self.current_temperature += temp_change
        self.current_temperature = max(
            self.config.temperature_base - self.config.temperature_variance,
            min(self.current_temperature, self.config.temperature_base + self.config.temperature_variance)
        )

class AlertGenerator:
    def __init__(self, vehicle_id: str):
        self.vehicle_id = vehicle_id
        self.alert_types = [
            ("Overspeed", "medium"),
            ("TemperatureHigh", "high"),
            ("FuelLow", "medium"),
            ("BatteryLow", "low"),
            ("EngineFault", "critical"),
            ("GeofenceBreach", "high")
        ]
    
    def should_generate_alert(self, telemetry: Dict[str, Any]) -> bool:
        """Determine if an alert should be generated based on telemetry"""
        # Check for overspeed
        if telemetry["speed"] > 80:
            return True
        
        # Check for high temperature
        if telemetry["temperature"] > 35:
            return True
        
        # Check for low fuel
        if telemetry["additionalData"]["fuelLevel"] < 0.2:
            return True
        
        # Check for low battery
        if telemetry["additionalData"]["batteryLevel"] < 0.3:
            return True
        
        # Random alerts (5% chance)
        if random.random() < 0.05:
            return True
        
        return False
    
    def generate_alert(self, telemetry: Dict[str, Any]) -> Dict[str, Any]:
        """Generate an alert based on telemetry conditions"""
        alert_type, severity = random.choice(self.alert_types)
        
        messages = {
            "Overspeed": f"Vehicle speed {telemetry['speed']:.1f} km/h exceeds limit",
            "TemperatureHigh": f"Engine temperature {telemetry['temperature']:.1f}°C is high",
            "FuelLow": f"Fuel level {telemetry['additionalData']['fuelLevel']:.1%} is low",
            "BatteryLow": f"Battery level {telemetry['additionalData']['batteryLevel']:.1%} is low",
            "EngineFault": "Engine fault detected",
            "GeofenceBreach": "Vehicle has left designated patrol area"
        }
        
        # Convert severity string to enum value
        severity_map = {
            "Low": 0,
            "Medium": 1, 
            "High": 2,
            "Critical": 3
        }
        
        return {
            "vehicleId": self.vehicle_id,
            "type": alert_type,
            "message": messages[alert_type],
            "severity": severity_map.get(severity, 1),  # Default to Medium if not found
            "additionalData": {
                "telemetrySnapshot": telemetry,
                "location": {
                    "latitude": telemetry["latitude"],
                    "longitude": telemetry["longitude"]
                }
            }
        }

class EdgeSimulator:
    def __init__(self, api_url: str, vehicle_config: VehicleConfig):
        self.api_url = api_url.rstrip('/')
        self.vehicle_config = vehicle_config
        self.telemetry_generator = TelemetryGenerator(vehicle_config)
        self.alert_generator = AlertGenerator(vehicle_config.vehicle_id)
        self.session = requests.Session()
        self.session.headers.update({'Content-Type': 'application/json'})
    
    def send_telemetry(self, telemetry_data: List[Dict[str, Any]]) -> bool:
        """Send telemetry data to the API"""
        try:
            url = f"{self.api_url}/api/telemetry/{self.vehicle_config.vehicle_id}"
            response = self.session.post(url, json=telemetry_data)
            response.raise_for_status()
            return True
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to send telemetry: {e}")
            return False
    
    def send_alert(self, alert_data: Dict[str, Any]) -> bool:
        """Send alert to the API"""
        try:
            url = f"{self.api_url}/api/alerts"
            response = self.session.post(url, json=alert_data)
            response.raise_for_status()
            return True
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to send alert: {e}")
            return False
    
    def get_mission(self) -> Dict[str, Any]:
        """Get mission assignment for this vehicle"""
        try:
            url = f"{self.api_url}/api/missions/vehicle/{self.vehicle_config.vehicle_id}"
            response = self.session.get(url)
            response.raise_for_status()
            missions = response.json()
            return missions[0] if missions else {}
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to get mission: {e}")
            return {}
    
    def run_simulation(self, duration_minutes: int = 60, interval_seconds: float = 1.0):
        """Run the vehicle simulation"""
        logger.info(f"Starting simulation for vehicle {self.vehicle_config.vehicle_id}")
        logger.info(f"Duration: {duration_minutes} minutes, Interval: {interval_seconds} seconds")
        
        start_time = datetime.now()
        end_time = start_time + timedelta(minutes=duration_minutes)
        
        # Get initial mission
        mission = self.get_mission()
        if mission:
            logger.info(f"Assigned to mission: {mission.get('name', 'Unknown')}")
        
        telemetry_buffer = []
        
        while datetime.now() < end_time:
            # Generate telemetry
            telemetry = self.telemetry_generator.generate_telemetry()
            telemetry_buffer.append(telemetry)
            
            # Send telemetry in batches
            if len(telemetry_buffer) >= 10:
                if self.send_telemetry(telemetry_buffer):
                    logger.debug(f"Sent {len(telemetry_buffer)} telemetry records")
                telemetry_buffer = []
            
            # Check for alerts
            if self.alert_generator.should_generate_alert(telemetry):
                alert = self.alert_generator.generate_alert(telemetry)
                if self.send_alert(alert):
                    logger.info(f"Generated alert: {alert['type']} - {alert['message']}")
            
            # Wait for next interval
            time.sleep(interval_seconds)
        
        # Send remaining telemetry
        if telemetry_buffer:
            self.send_telemetry(telemetry_buffer)
        
        logger.info("Simulation completed")

def main():
    parser = argparse.ArgumentParser(description='SDV Edge Simulator')
    parser.add_argument('--mission', required=True, help='Mission ID to simulate')
    parser.add_argument('--server', help='API server URL (default: from API_BASE_URL env var)')
    parser.add_argument('--vehicle-id', default=None, help='Vehicle ID (default: auto-generated)')
    parser.add_argument('--duration', type=int, default=60, help='Simulation duration in minutes')
    parser.add_argument('--interval', type=float, default=1.0, help='Telemetry interval in seconds')
    parser.add_argument('--lat', type=float, default=40.7128, help='Starting latitude')
    parser.add_argument('--lon', type=float, default=-74.0060, help='Starting longitude')
    
    args = parser.parse_args()
    
    # Get server URL from environment variable or argument
    server_url = args.server or os.getenv('API_BASE_URL', 'http://localhost:5001')
    
    # Create vehicle configuration
    vehicle_id = args.vehicle_id or f"vehicle_{random.randint(1000, 9999)}"
    vehicle_config = VehicleConfig(
        vehicle_id=vehicle_id,
        name=f"Patrol Vehicle {vehicle_id}",
        start_lat=args.lat,
        start_lon=args.lon
    )
    
    # Create and run simulator
    simulator = EdgeSimulator(server_url, vehicle_config)
    
    try:
        simulator.run_simulation(
            duration_minutes=args.duration,
            interval_seconds=args.interval
        )
    except KeyboardInterrupt:
        logger.info("Simulation interrupted by user")
    except Exception as e:
        logger.error(f"Simulation error: {e}")

if __name__ == "__main__":
    main()

