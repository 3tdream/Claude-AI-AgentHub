"""
Configuration Loader

Handles loading and managing configuration for the poultry alert system.
"""

import os
import yaml
import logging
from typing import Dict, Any
from pathlib import Path


class ConfigLoader:
    """Loads and manages system configuration."""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.config_dir = Path(__file__).parent
    
    def load_config(self) -> Dict[str, Any]:
        """Load configuration from YAML files."""
        # Default configuration
        config = {
            'logging': {
                'level': 'INFO'
            },
            'main_loop_interval': 10,
            'sensors': {
                'temperature': {'enabled': True, 'read_interval': 60, 'gpio_pin': 4},
                'humidity': {'enabled': True, 'read_interval': 60, 'gpio_pin': 2},
                'air_quality': {'enabled': True, 'read_interval': 120, 'gpio_pin': 22},
                'feed_level': {'enabled': True, 'read_interval': 300, 'gpio_pin': 17},
                'water_level': {'enabled': True, 'read_interval': 300, 'gpio_pin': 27}
            },
            'alerts': {
                'thresholds': {
                    'temperature': {
                        'min': 18.0, 'max': 24.0,
                        'critical_min': 15.0, 'critical_max': 27.0
                    },
                    'humidity': {
                        'min': 50.0, 'max': 70.0,
                        'critical_min': 40.0, 'critical_max': 80.0
                    },
                    'air_quality': {
                        'max_co2': 1000, 'critical_co2': 2000
                    },
                    'feed_level': {
                        'low_threshold': 20, 'critical_threshold': 5
                    },
                    'water_level': {
                        'low_threshold': 30, 'critical_threshold': 10
                    }
                },
                'auto_resolve_hours': 24
            },
            'notifications': {
                'email': {'enabled': False},
                'sms': {'enabled': False},
                'web': {'enabled': True}
            },
            'dashboard': {
                'port': 8080
            }
        }
        
        # Try to load custom configuration
        config_file = self.config_dir / 'config.yaml'
        if config_file.exists():
            try:
                with open(config_file, 'r') as f:
                    custom_config = yaml.safe_load(f)
                    if custom_config:
                        # Merge custom config with defaults
                        config.update(custom_config)
                        self.logger.info("Loaded custom configuration")
            except Exception as e:
                self.logger.error(f"Error loading config file: {e}")
        
        return config