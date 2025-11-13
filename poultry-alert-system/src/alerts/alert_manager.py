"""
Alert Manager Module

Handles alert detection, processing, and notification dispatch for the poultry alert system.
Monitors sensor data against configured thresholds and triggers appropriate notifications.
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, field
from enum import Enum

from src.sensors.sensor_manager import SensorReading
from src.alerts.notifiers import EmailNotifier, SMSNotifier, WebNotifier


class AlertLevel(Enum):
    """Alert severity levels."""
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"


@dataclass
class Alert:
    """Data class for system alerts."""
    alert_id: str
    level: AlertLevel
    title: str
    message: str
    sensor_data: SensorReading
    timestamp: datetime
    acknowledged: bool = False
    resolved: bool = False
    notified_channels: List[str] = field(default_factory=list)


class AlertManager:
    """Manages alert detection, processing, and notifications."""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.logger = logging.getLogger(__name__)
        self.alerts_config = config.get('alerts', {})
        self.processing = False
        
        # Alert storage
        self.active_alerts: Dict[str, Alert] = {}
        self.alert_history: List[Alert] = []
        
        # Alert thresholds
        self.thresholds = self.alerts_config.get('thresholds', {})
        
        # Notification cooldowns (to prevent spam)
        self.notification_cooldowns: Dict[str, datetime] = {}
        
        # Initialize notifiers
        self.notifiers = {}
        self._initialize_notifiers()
    
    def _initialize_notifiers(self):
        """Initialize notification services."""
        notifications_config = self.config.get('notifications', {})
        
        # Email notifier
        if notifications_config.get('email', {}).get('enabled', False):
            self.notifiers['email'] = EmailNotifier(notifications_config['email'])
            
        # SMS notifier
        if notifications_config.get('sms', {}).get('enabled', False):
            self.notifiers['sms'] = SMSNotifier(notifications_config['sms'])
            
        # Web notifier (always enabled)
        self.notifiers['web'] = WebNotifier(notifications_config.get('web', {}))
        
        self.logger.info(f"Initialized {len(self.notifiers)} notification services")
    
    async def start_processing(self):
        """Start alert processing tasks."""
        self.logger.info("Starting alert processing...")
        self.processing = True
        
        # Start background tasks
        asyncio.create_task(self._process_alert_queue())
        asyncio.create_task(self._cleanup_old_alerts())
        
        self.logger.info("Alert processing started")
    
    async def stop(self):
        """Stop alert processing."""
        self.logger.info("Stopping alert processing...")
        self.processing = False
    
    async def get_health_status(self) -> Dict[str, Any]:
        """Get the health status of the alert system."""
        active_critical = sum(1 for alert in self.active_alerts.values() 
                            if alert.level == AlertLevel.CRITICAL)
        
        return {
            'healthy': active_critical == 0,
            'active_alerts': len(self.active_alerts),
            'critical_alerts': active_critical,
            'processing': self.processing,
            'notifiers_active': len(self.notifiers)
        }
    
    async def check_for_alerts(self, sensor_data: Dict[str, SensorReading]):
        """Check sensor data against thresholds and create alerts if needed."""
        for sensor_id, reading in sensor_data.items():
            await self._check_sensor_thresholds(reading)
    
    async def _check_sensor_thresholds(self, reading: SensorReading):
        """Check a single sensor reading against configured thresholds."""
        sensor_type = reading.sensor_type
        threshold_config = self.thresholds.get(sensor_type, {})
        
        if not threshold_config:
            return  # No thresholds configured for this sensor type
        
        alert_triggered = False
        alert_level = AlertLevel.INFO
        alert_message = ""
        
        # Check temperature thresholds
        if sensor_type == "temperature":
            min_temp = threshold_config.get('min', -999)
            max_temp = threshold_config.get('max', 999)
            critical_min = threshold_config.get('critical_min', -999)
            critical_max = threshold_config.get('critical_max', 999)
            
            if reading.value <= critical_min or reading.value >= critical_max:
                alert_triggered = True
                alert_level = AlertLevel.CRITICAL
                alert_message = f"Critical temperature: {reading.value}°C (normal range: {min_temp}-{max_temp}°C)"
            elif reading.value <= min_temp or reading.value >= max_temp:
                alert_triggered = True
                alert_level = AlertLevel.WARNING
                alert_message = f"Temperature out of range: {reading.value}°C (normal: {min_temp}-{max_temp}°C)"
        
        # Check humidity thresholds
        elif sensor_type == "humidity":
            min_humidity = threshold_config.get('min', 0)
            max_humidity = threshold_config.get('max', 100)
            critical_min = threshold_config.get('critical_min', 0)
            critical_max = threshold_config.get('critical_max', 100)
            
            if reading.value <= critical_min or reading.value >= critical_max:
                alert_triggered = True
                alert_level = AlertLevel.CRITICAL
                alert_message = f"Critical humidity: {reading.value}% (normal range: {min_humidity}-{max_humidity}%)"
            elif reading.value <= min_humidity or reading.value >= max_humidity:
                alert_triggered = True
                alert_level = AlertLevel.WARNING
                alert_message = f"Humidity out of range: {reading.value}% (normal: {min_humidity}-{max_humidity}%)"
        
        # Check air quality thresholds
        elif sensor_type == "air_quality":
            max_co2 = threshold_config.get('max_co2', 1000)
            critical_co2 = threshold_config.get('critical_co2', 2000)
            
            if reading.value >= critical_co2:
                alert_triggered = True
                alert_level = AlertLevel.CRITICAL
                alert_message = f"Critical air quality: {reading.value}ppm CO2 (max safe: {max_co2}ppm)"
            elif reading.value >= max_co2:
                alert_triggered = True
                alert_level = AlertLevel.WARNING
                alert_message = f"Poor air quality: {reading.value}ppm CO2 (recommended max: {max_co2}ppm)"
        
        # Check feed level thresholds
        elif sensor_type == "feed_level":
            low_level = threshold_config.get('low_threshold', 20)
            critical_level = threshold_config.get('critical_threshold', 5)
            
            if reading.value <= critical_level:
                alert_triggered = True
                alert_level = AlertLevel.CRITICAL
                alert_message = f"Feed critically low: {reading.value}% remaining"
            elif reading.value <= low_level:
                alert_triggered = True
                alert_level = AlertLevel.WARNING
                alert_message = f"Feed level low: {reading.value}% remaining"
        
        # Check water level thresholds
        elif sensor_type == "water_level":
            low_level = threshold_config.get('low_threshold', 30)
            critical_level = threshold_config.get('critical_threshold', 10)
            
            if reading.value <= critical_level:
                alert_triggered = True
                alert_level = AlertLevel.CRITICAL
                alert_message = f"Water critically low: {reading.value}% remaining"
            elif reading.value <= low_level:
                alert_triggered = True
                alert_level = AlertLevel.WARNING
                alert_message = f"Water level low: {reading.value}% remaining"
        
        # Create alert if threshold breached
        if alert_triggered:
            await self._create_alert(
                level=alert_level,
                title=f"{sensor_type.replace('_', ' ').title()} Alert",
                message=alert_message,
                sensor_data=reading
            )
    
    async def _create_alert(self, level: AlertLevel, title: str, message: str, 
                          sensor_data: SensorReading):
        """Create and process a new alert."""
        # Generate unique alert ID
        alert_id = f"{sensor_data.sensor_id}_{level.value}_{int(datetime.now().timestamp())}"
        
        # Check if similar alert exists and is recent (avoid duplicates)
        similar_alert_key = f"{sensor_data.sensor_id}_{level.value}"
        if (similar_alert_key in self.notification_cooldowns and 
            datetime.now() - self.notification_cooldowns[similar_alert_key] < timedelta(minutes=15)):
            return  # Skip duplicate alert within cooldown period
        
        # Create alert
        alert = Alert(
            alert_id=alert_id,
            level=level,
            title=title,
            message=message,
            sensor_data=sensor_data,
            timestamp=datetime.now()
        )
        
        # Store alert
        self.active_alerts[alert_id] = alert
        self.alert_history.append(alert)
        
        # Set notification cooldown
        self.notification_cooldowns[similar_alert_key] = datetime.now()
        
        # Log alert
        self.logger.warning(f"Alert created: {title} - {message}")
        
        # Send notifications
        await self._send_notifications(alert)
    
    async def _send_notifications(self, alert: Alert):
        """Send notifications for an alert based on its level and configuration."""
        notification_config = self.alerts_config.get('notification_rules', {})
        level_config = notification_config.get(alert.level.value, {})
        
        # Determine which channels to notify
        channels_to_notify = []
        
        if alert.level == AlertLevel.CRITICAL:
            # Critical alerts go to all available channels
            channels_to_notify = list(self.notifiers.keys())
        elif alert.level == AlertLevel.WARNING:
            # Warning alerts go to web and email (if configured)
            channels_to_notify = ['web']
            if 'email' in self.notifiers:
                channels_to_notify.append('email')
        else:
            # Info alerts only go to web dashboard
            channels_to_notify = ['web']
        
        # Send notifications
        for channel in channels_to_notify:
            if channel in self.notifiers:
                try:
                    await self.notifiers[channel].send_notification(alert)
                    alert.notified_channels.append(channel)
                    self.logger.info(f"Sent {alert.level.value} alert via {channel}")
                except Exception as e:
                    self.logger.error(f"Failed to send notification via {channel}: {e}")
    
    async def _process_alert_queue(self):
        """Background task to process alerts."""
        while self.processing:
            try:
                # Check for alerts that need auto-resolution
                await self._check_alert_resolution()
                
                # Wait before next check
                await asyncio.sleep(30)  # Check every 30 seconds
                
            except Exception as e:
                self.logger.error(f"Error in alert queue processing: {e}")
                await asyncio.sleep(5)
    
    async def _check_alert_resolution(self):
        """Check if any active alerts can be automatically resolved."""
        alerts_to_resolve = []
        
        for alert_id, alert in self.active_alerts.items():
            # Auto-resolve alerts older than configured time
            auto_resolve_time = self.alerts_config.get('auto_resolve_hours', 24)
            if (datetime.now() - alert.timestamp).total_seconds() > (auto_resolve_time * 3600):
                alerts_to_resolve.append(alert_id)
        
        # Resolve old alerts
        for alert_id in alerts_to_resolve:
            await self.resolve_alert(alert_id, auto_resolved=True)
    
    async def resolve_alert(self, alert_id: str, auto_resolved: bool = False):
        """Mark an alert as resolved."""
        if alert_id in self.active_alerts:
            alert = self.active_alerts[alert_id]
            alert.resolved = True
            
            # Remove from active alerts
            del self.active_alerts[alert_id]
            
            resolution_type = "automatically" if auto_resolved else "manually"
            self.logger.info(f"Alert {alert_id} resolved {resolution_type}")
            
            # Notify web dashboard of resolution
            if 'web' in self.notifiers:
                await self.notifiers['web'].send_alert_resolution(alert)
    
    async def acknowledge_alert(self, alert_id: str):
        """Mark an alert as acknowledged."""
        if alert_id in self.active_alerts:
            self.active_alerts[alert_id].acknowledged = True
            self.logger.info(f"Alert {alert_id} acknowledged")
    
    async def get_active_alerts(self) -> List[Alert]:
        """Get all active (unresolved) alerts."""
        return list(self.active_alerts.values())
    
    async def get_alert_history(self, limit: int = 100) -> List[Alert]:
        """Get recent alert history."""
        return self.alert_history[-limit:]
    
    async def _cleanup_old_alerts(self):
        """Background task to clean up old alert history."""
        while self.processing:
            try:
                # Keep only last 1000 alerts in history
                if len(self.alert_history) > 1000:
                    self.alert_history = self.alert_history[-1000:]
                
                # Clean up old notification cooldowns
                cutoff_time = datetime.now() - timedelta(hours=1)
                expired_cooldowns = [
                    key for key, timestamp in self.notification_cooldowns.items()
                    if timestamp < cutoff_time
                ]
                for key in expired_cooldowns:
                    del self.notification_cooldowns[key]
                
                # Wait before next cleanup
                await asyncio.sleep(3600)  # Clean up every hour
                
            except Exception as e:
                self.logger.error(f"Error in alert cleanup: {e}")
                await asyncio.sleep(300)  # Wait 5 minutes on error