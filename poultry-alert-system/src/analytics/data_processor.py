"""
Data Processing Module

Handles data analysis, storage, and analytics for the poultry alert system.
"""

import asyncio
import logging
from typing import Dict, List, Any
from datetime import datetime, timedelta

from src.sensors.sensor_manager import SensorReading


class DataProcessor:
    """Processes and analyzes sensor data."""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.logger = logging.getLogger(__name__)
        self.processing = False
        self.data_buffer: List[SensorReading] = []
    
    async def start_processing(self):
        """Start data processing tasks."""
        self.logger.info("Starting data processing...")
        self.processing = True
        
        # Start background data processing task
        asyncio.create_task(self._process_data_buffer())
        
        self.logger.info("Data processing started")
    
    async def stop(self):
        """Stop data processing."""
        self.logger.info("Stopping data processing...")
        self.processing = False
    
    async def get_health_status(self) -> Dict[str, Any]:
        """Get the health status of the data processor."""
        return {
            'healthy': self.processing,
            'buffer_size': len(self.data_buffer),
            'processing': self.processing
        }
    
    async def process_sensor_data(self, sensor_data: Dict[str, SensorReading]):
        """Process incoming sensor data."""
        for reading in sensor_data.values():
            self.data_buffer.append(reading)
            
        # Keep buffer size manageable
        if len(self.data_buffer) > 10000:
            self.data_buffer = self.data_buffer[-5000:]
    
    async def _process_data_buffer(self):
        """Background task to process data buffer."""
        while self.processing:
            try:
                if self.data_buffer:
                    # Process data analytics here
                    self.logger.debug(f"Processing {len(self.data_buffer)} sensor readings")
                
                await asyncio.sleep(300)  # Process every 5 minutes
                
            except Exception as e:
                self.logger.error(f"Error in data processing: {e}")
                await asyncio.sleep(60)