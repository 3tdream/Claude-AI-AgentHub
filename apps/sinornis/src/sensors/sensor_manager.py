"""
Sensor Manager Module

Handles all sensor data collection and monitoring for the poultry alert system.
Supports various sensor types including temperature, humidity, air quality, and level sensors.
"""

import asyncio
import logging
from datetime import datetime
from typing import Dict, List, Any, Optional
from dataclasses import dataclass

try:
    import RPi.GPIO as GPIO
    RASPBERRY_PI = True
except ImportError:
    RASPBERRY_PI = False
    logging.warning("RPi.GPIO not available - running in simulation mode")


@dataclass
class SensorReading:
    """Data class for sensor readings."""
    sensor_id: str
    sensor_type: str
    value: float
    unit: str
    timestamp: datetime
    location: str = "main_coop"


class SensorManager:
    """Manages all sensor operations and data collection."""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.logger = logging.getLogger(__name__)
        self.sensors_config = config.get('sensors', {})
        self.monitoring = False
        self.sensor_readings: List[SensorReading] = []
        self.latest_readings: Dict[str, SensorReading] = {}
        
        # Initialize GPIO if on Raspberry Pi
        if RASPBERRY_PI:
            GPIO.setmode(GPIO.BCM)
            GPIO.setwarnings(False)
    
    async def start_monitoring(self):
        """Start sensor monitoring tasks."""
        self.logger.info("Starting sensor monitoring...")
        self.monitoring = True
        
        # Start monitoring tasks for each sensor type
        tasks = []
        
        if self.sensors_config.get('temperature', {}).get('enabled', True):
            tasks.append(asyncio.create_task(self._monitor_temperature()))
            
        if self.sensors_config.get('humidity', {}).get('enabled', True):
            tasks.append(asyncio.create_task(self._monitor_humidity()))
            
        if self.sensors_config.get('air_quality', {}).get('enabled', True):
            tasks.append(asyncio.create_task(self._monitor_air_quality()))
            
        if self.sensors_config.get('feed_level', {}).get('enabled', True):
            tasks.append(asyncio.create_task(self._monitor_feed_level()))
            
        if self.sensors_config.get('water_level', {}).get('enabled', True):
            tasks.append(asyncio.create_task(self._monitor_water_level()))
        
        # Wait for all monitoring tasks to start
        await asyncio.sleep(1)
        self.logger.info(f"Started {len(tasks)} sensor monitoring tasks")
    
    async def stop(self):
        """Stop sensor monitoring."""
        self.logger.info("Stopping sensor monitoring...")
        self.monitoring = False
        
        # Cleanup GPIO if on Raspberry Pi
        if RASPBERRY_PI:
            GPIO.cleanup()
    
    async def get_latest_data(self) -> Dict[str, SensorReading]:
        """Get the latest sensor readings."""
        return self.latest_readings.copy()
    
    async def get_health_status(self) -> Dict[str, Any]:
        """Get the health status of the sensor system."""
        now = datetime.now()
        healthy_sensors = 0
        total_sensors = len(self.latest_readings)
        
        for sensor_id, reading in self.latest_readings.items():
            # Check if reading is recent (within last 5 minutes)
            if (now - reading.timestamp).total_seconds() < 300:
                healthy_sensors += 1
        
        return {
            'healthy': healthy_sensors == total_sensors and total_sensors > 0,
            'active_sensors': healthy_sensors,
            'total_sensors': total_sensors,
            'monitoring': self.monitoring
        }
    
    async def _monitor_temperature(self):
        """Monitor temperature sensors."""
        sensor_config = self.sensors_config.get('temperature', {})
        interval = sensor_config.get('read_interval', 60)
        sensor_pin = sensor_config.get('gpio_pin', 4)
        
        self.logger.info(f"Starting temperature monitoring (interval: {interval}s)")
        
        while self.monitoring:
            try:
                # Read temperature (simulation if not on Raspberry Pi)
                temperature = await self._read_temperature_sensor(sensor_pin)
                
                reading = SensorReading(
                    sensor_id="temp_001",
                    sensor_type="temperature",
                    value=temperature,
                    unit="°C",
                    timestamp=datetime.now(),
                    location="main_coop"
                )
                
                self._store_reading(reading)
                await asyncio.sleep(interval)
                
            except Exception as e:
                self.logger.error(f"Temperature monitoring error: {e}")
                await asyncio.sleep(10)
    
    async def _monitor_humidity(self):
        """Monitor humidity sensors."""
        sensor_config = self.sensors_config.get('humidity', {})
        interval = sensor_config.get('read_interval', 60)
        sensor_pin = sensor_config.get('gpio_pin', 2)
        
        self.logger.info(f"Starting humidity monitoring (interval: {interval}s)")
        
        while self.monitoring:
            try:
                # Read humidity (simulation if not on Raspberry Pi)
                humidity = await self._read_humidity_sensor(sensor_pin)
                
                reading = SensorReading(
                    sensor_id="humid_001",
                    sensor_type="humidity",
                    value=humidity,
                    unit="%",
                    timestamp=datetime.now(),
                    location="main_coop"
                )
                
                self._store_reading(reading)
                await asyncio.sleep(interval)
                
            except Exception as e:
                self.logger.error(f"Humidity monitoring error: {e}")
                await asyncio.sleep(10)
    
    async def _monitor_air_quality(self):
        """Monitor air quality sensors."""
        sensor_config = self.sensors_config.get('air_quality', {})
        interval = sensor_config.get('read_interval', 120)
        sensor_pin = sensor_config.get('gpio_pin', 22)
        
        self.logger.info(f"Starting air quality monitoring (interval: {interval}s)")
        
        while self.monitoring:
            try:
                # Read air quality (CO2/NH3 levels)
                air_quality = await self._read_air_quality_sensor(sensor_pin)
                
                reading = SensorReading(
                    sensor_id="air_001",
                    sensor_type="air_quality",
                    value=air_quality,
                    unit="ppm",
                    timestamp=datetime.now(),
                    location="main_coop"
                )
                
                self._store_reading(reading)
                await asyncio.sleep(interval)
                
            except Exception as e:
                self.logger.error(f"Air quality monitoring error: {e}")
                await asyncio.sleep(10)
    
    async def _monitor_feed_level(self):
        """Monitor feed level sensors."""
        sensor_config = self.sensors_config.get('feed_level', {})
        interval = sensor_config.get('read_interval', 300)  # 5 minutes
        sensor_pin = sensor_config.get('gpio_pin', 17)
        
        self.logger.info(f"Starting feed level monitoring (interval: {interval}s)")
        
        while self.monitoring:
            try:
                # Read feed level
                feed_level = await self._read_level_sensor(sensor_pin, "feed")
                
                reading = SensorReading(
                    sensor_id="feed_001",
                    sensor_type="feed_level",
                    value=feed_level,
                    unit="%",
                    timestamp=datetime.now(),
                    location="feed_station_1"
                )
                
                self._store_reading(reading)
                await asyncio.sleep(interval)
                
            except Exception as e:
                self.logger.error(f"Feed level monitoring error: {e}")
                await asyncio.sleep(10)
    
    async def _monitor_water_level(self):
        """Monitor water level sensors."""
        sensor_config = self.sensors_config.get('water_level', {})
        interval = sensor_config.get('read_interval', 300)  # 5 minutes
        sensor_pin = sensor_config.get('gpio_pin', 27)
        
        self.logger.info(f"Starting water level monitoring (interval: {interval}s)")
        
        while self.monitoring:
            try:
                # Read water level
                water_level = await self._read_level_sensor(sensor_pin, "water")
                
                reading = SensorReading(
                    sensor_id="water_001",
                    sensor_type="water_level",
                    value=water_level,
                    unit="%",
                    timestamp=datetime.now(),
                    location="water_station_1"
                )
                
                self._store_reading(reading)
                await asyncio.sleep(interval)
                
            except Exception as e:
                self.logger.error(f"Water level monitoring error: {e}")
                await asyncio.sleep(10)
    
    async def _read_temperature_sensor(self, pin: int) -> float:
        """Read temperature from DHT22 or similar sensor."""
        if RASPBERRY_PI:
            try:
                # Actual sensor reading logic would go here
                # For now, return a simulated reading
                import random
                return round(20 + random.uniform(-2, 4), 1)  # 18-24°C range
            except Exception as e:
                self.logger.error(f"Failed to read temperature sensor: {e}")
                raise
        else:
            # Simulation mode
            import random
            return round(20 + random.uniform(-2, 4), 1)
    
    async def _read_humidity_sensor(self, pin: int) -> float:
        """Read humidity from DHT22 or similar sensor."""
        if RASPBERRY_PI:
            try:
                # Actual sensor reading logic would go here
                import random
                return round(60 + random.uniform(-10, 10), 1)  # 50-70% range
            except Exception as e:
                self.logger.error(f"Failed to read humidity sensor: {e}")
                raise
        else:
            # Simulation mode
            import random
            return round(60 + random.uniform(-10, 10), 1)
    
    async def _read_air_quality_sensor(self, pin: int) -> float:
        """Read air quality from MQ-135 or similar sensor."""
        if RASPBERRY_PI:
            try:
                # Actual sensor reading logic would go here
                import random
                return round(400 + random.uniform(-50, 100), 1)  # CO2 ppm
            except Exception as e:
                self.logger.error(f"Failed to read air quality sensor: {e}")
                raise
        else:
            # Simulation mode
            import random
            return round(400 + random.uniform(-50, 100), 1)
    
    async def _read_level_sensor(self, pin: int, sensor_type: str) -> float:
        """Read level from ultrasonic sensor."""
        if RASPBERRY_PI:
            try:
                # Actual ultrasonic sensor reading logic would go here
                import random
                return round(random.uniform(20, 95), 1)  # Percentage level
            except Exception as e:
                self.logger.error(f"Failed to read {sensor_type} level sensor: {e}")
                raise
        else:
            # Simulation mode
            import random
            return round(random.uniform(20, 95), 1)
    
    def _store_reading(self, reading: SensorReading):
        """Store a sensor reading in memory."""
        self.sensor_readings.append(reading)
        self.latest_readings[reading.sensor_id] = reading
        
        # Keep only last 1000 readings to prevent memory issues
        if len(self.sensor_readings) > 1000:
            self.sensor_readings = self.sensor_readings[-1000:]
        
        self.logger.debug(
            f"Stored reading: {reading.sensor_type} = {reading.value}{reading.unit}"
        )