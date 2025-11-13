# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Setup and Installation
```bash
# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/macOS

# Install dependencies
pip install -r requirements.txt

# Copy and configure settings
cp config/config_template.yaml config/config.yaml
# Edit config/config.yaml with appropriate sensor pins and thresholds
```

### Running the System
```bash
# Start the main application
python src/main.py

# Run in development mode (if needed)
python -m src.main
```

### Testing
```bash
# Run all tests
pytest tests/

# Run with coverage report
pytest --cov=src tests/

# Run specific test file
pytest tests/test_sensor_manager.py
```

### Code Quality
```bash
# Format code with black
black src/ tests/ config/

# Lint with flake8
flake8 src/ tests/ config/

# Type checking with mypy
mypy src/
```

## Architecture Overview

### System Components
The poultry alert system follows an async, component-based architecture with four main modules:

1. **SensorManager** (`src/sensors/`) - Handles all sensor data collection
   - Supports temperature, humidity, air quality, feed level, and water level sensors
   - Runs continuous monitoring tasks for each sensor type
   - Automatically detects Raspberry Pi GPIO availability, falls back to simulation mode
   - Configurable sensor intervals and GPIO pins

2. **AlertManager** (`src/alerts/`) - Processes sensor data against thresholds
   - Multi-level alert system (INFO, WARNING, CRITICAL)
   - Threshold-based alert detection with configurable ranges
   - Notification cooldown system to prevent spam
   - Auto-resolution of old alerts

3. **DataProcessor** (`src/analytics/`) - Handles data storage and analytics
   - Buffers sensor readings for analysis
   - Background processing tasks
   - Maintains data history with size limits

4. **WebServer** (`src/dashboard/`) - Provides web dashboard interface
   - Real-time system monitoring
   - Alert visualization and management
   - System health status display

### Key Design Patterns

**Async/Await Pattern**: All components use asyncio for non-blocking operations. Each component has `start()`, `stop()`, and `get_health_status()` methods.

**Configuration-Driven**: System behavior controlled through YAML config files loaded by `ConfigLoader`. Supports default values with override capability.

**Modular Notification System**: Alert notifications use a plugin-based approach with `BaseNotifier` abstract class. Currently supports Email, SMS (Twilio), and Web notifications.

**Hardware Abstraction**: Sensor management automatically detects Raspberry Pi GPIO availability and falls back to simulation mode for development.

## Configuration System

### Primary Config Structure
- `config/config_loader.py` - Loads YAML configuration with defaults
- `config/config.yaml` - Runtime configuration (create from template)
- Configuration covers sensors, alert thresholds, notifications, and dashboard settings

### Key Configuration Sections
- `sensors`: GPIO pins, read intervals, enable/disable sensors
- `alerts.thresholds`: Min/max values and critical thresholds for each sensor type
- `notifications`: Enable/disable email, SMS, web notifications
- `dashboard`: Web server port and settings

## Development Considerations

### Hardware Integration
- Designed for Raspberry Pi deployment with GPIO sensors
- Graceful fallback to simulation mode for development
- Sensor readings use standardized `SensorReading` dataclass

### Error Handling
- Each component logs errors and continues operation
- Health check system monitors component status
- Graceful shutdown handling with signal handlers

### Data Management
- In-memory data storage with configurable limits
- Alert history maintained with automatic cleanup
- Sensor reading buffers prevent memory growth

### Adding New Sensor Types
1. Add sensor config to `config_loader.py` defaults
2. Create monitoring method in `SensorManager._monitor_<sensor_type>()`
3. Add threshold checking logic in `AlertManager._check_sensor_thresholds()`
4. Update GPIO pin assignments as needed

### Alert System Extension
- New alert levels can be added to `AlertLevel` enum
- Notification rules configured in `alerts.notification_rules`
- Custom notifiers implement `BaseNotifier` abstract class

## Testing Notes

Currently tests/ directory exists but is empty. When writing tests:
- Use pytest for async test support
- Mock GPIO operations for hardware-independent testing  
- Test both normal operation and error conditions
- Include configuration validation tests
- Test alert threshold logic with boundary values