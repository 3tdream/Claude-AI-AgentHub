"""
Notification Services

Implements various notification channels for sending alerts.
"""

import logging
from typing import Dict, Any
from abc import ABC, abstractmethod


class BaseNotifier(ABC):
    """Base class for notification services."""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.logger = logging.getLogger(f"{__name__}.{self.__class__.__name__}")
    
    @abstractmethod
    async def send_notification(self, alert):
        """Send a notification for an alert."""
        pass


class EmailNotifier(BaseNotifier):
    """Email notification service."""
    
    async def send_notification(self, alert):
        """Send email notification."""
        # Email implementation would go here
        self.logger.info(f"Email notification sent: {alert.title}")


class SMSNotifier(BaseNotifier):
    """SMS notification service via Twilio."""
    
    async def send_notification(self, alert):
        """Send SMS notification."""
        # Twilio SMS implementation would go here
        self.logger.info(f"SMS notification sent: {alert.title}")


class WebNotifier(BaseNotifier):
    """Web dashboard notification service."""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.pending_notifications = []
    
    async def send_notification(self, alert):
        """Send web notification."""
        self.pending_notifications.append(alert)
        self.logger.info(f"Web notification queued: {alert.title}")
    
    async def send_alert_resolution(self, alert):
        """Notify web dashboard of alert resolution."""
        self.logger.info(f"Alert resolution notification: {alert.alert_id}")