#!/usr/bin/env python3
"""
Poultry Alert System - Main Application Entry Point

This module initializes and runs the poultry monitoring and alert system.
It coordinates sensor monitoring, alert processing, and notification services.
"""

import asyncio
import logging
import signal
import sys
from pathlib import Path
from typing import Dict, Any

# Add project root to path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from src.sensors.sensor_manager import SensorManager
from src.alerts.alert_manager import AlertManager
from src.analytics.data_processor import DataProcessor
from src.dashboard.web_server import WebServer
from config.config_loader import ConfigLoader


class PoultryAlertSystem:
    """Main application class that orchestrates all system components."""
    
    def __init__(self):
        self.config = ConfigLoader().load_config()
        self.setup_logging()
        
        # Initialize system components
        self.sensor_manager = SensorManager(self.config)
        self.alert_manager = AlertManager(self.config)
        self.data_processor = DataProcessor(self.config)
        self.web_server = WebServer(self.config)
        
        self.running = False
        
    def setup_logging(self):
        """Configure logging for the application."""
        log_level = self.config.get('logging', {}).get('level', 'INFO')
        log_format = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        
        logging.basicConfig(
            level=getattr(logging, log_level),
            format=log_format,
            handlers=[
                logging.FileHandler('poultry_system.log'),
                logging.StreamHandler(sys.stdout)
            ]
        )
        
        self.logger = logging.getLogger(__name__)
        self.logger.info("Poultry Alert System starting up...")
    
    async def start_system(self):
        """Start all system components."""
        try:
            self.logger.info("Initializing system components...")
            
            # Start sensor monitoring
            await self.sensor_manager.start_monitoring()
            self.logger.info("Sensor monitoring started")
            
            # Start alert processing
            await self.alert_manager.start_processing()
            self.logger.info("Alert processing started")
            
            # Start data processing
            await self.data_processor.start_processing()
            self.logger.info("Data processing started")
            
            # Start web dashboard
            await self.web_server.start()
            self.logger.info("Web dashboard started")
            
            self.running = True
            self.logger.info("Poultry Alert System fully operational!")
            
        except Exception as e:
            self.logger.error(f"Failed to start system: {e}")
            await self.shutdown()
            raise
    
    async def run_main_loop(self):
        """Main application loop."""
        while self.running:
            try:
                # Check system health
                await self.health_check()
                
                # Process any pending tasks
                await self.process_tasks()
                
                # Wait before next iteration
                await asyncio.sleep(self.config.get('main_loop_interval', 10))
                
            except KeyboardInterrupt:
                self.logger.info("Received shutdown signal")
                break
            except Exception as e:
                self.logger.error(f"Error in main loop: {e}")
                await asyncio.sleep(5)  # Brief pause before retrying
    
    async def health_check(self):
        """Perform system health checks."""
        components_status = {
            'sensors': await self.sensor_manager.get_health_status(),
            'alerts': await self.alert_manager.get_health_status(),
            'data_processor': await self.data_processor.get_health_status(),
            'web_server': await self.web_server.get_health_status()
        }
        
        # Log any unhealthy components
        for component, status in components_status.items():
            if not status.get('healthy', False):
                self.logger.warning(f"Component {component} is unhealthy: {status}")
    
    async def process_tasks(self):
        """Process any pending system tasks."""
        # Get latest sensor data
        sensor_data = await self.sensor_manager.get_latest_data()
        
        # Process data and check for alerts
        if sensor_data:
            await self.data_processor.process_sensor_data(sensor_data)
            await self.alert_manager.check_for_alerts(sensor_data)
    
    async def shutdown(self):
        """Gracefully shutdown all system components."""
        self.logger.info("Shutting down Poultry Alert System...")
        self.running = False
        
        try:
            # Stop components in reverse order
            await self.web_server.stop()
            await self.data_processor.stop()
            await self.alert_manager.stop()
            await self.sensor_manager.stop()
            
            self.logger.info("System shutdown complete")
            
        except Exception as e:
            self.logger.error(f"Error during shutdown: {e}")
    
    def setup_signal_handlers(self):
        """Set up signal handlers for graceful shutdown."""
        def signal_handler(signum, frame):
            self.logger.info(f"Received signal {signum}")
            asyncio.create_task(self.shutdown())
        
        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)


async def main():
    """Main application entry point."""
    system = PoultryAlertSystem()
    
    try:
        # Set up signal handlers
        system.setup_signal_handlers()
        
        # Start the system
        await system.start_system()
        
        # Run main loop
        await system.run_main_loop()
        
    except KeyboardInterrupt:
        system.logger.info("Received keyboard interrupt")
    except Exception as e:
        system.logger.error(f"Unexpected error: {e}")
    finally:
        await system.shutdown()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\\nPoultry Alert System stopped by user")
    except Exception as e:
        print(f"Fatal error: {e}")
        sys.exit(1)