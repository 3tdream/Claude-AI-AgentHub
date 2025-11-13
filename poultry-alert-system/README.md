# Poultry Alert System

A smart monitoring and alert system for poultry farming operations that helps farmers maintain optimal conditions and respond quickly to potential issues in their poultry facilities.

## 🐓 Features

- **Real-time Monitoring**: Continuous monitoring of critical parameters
  - Temperature and humidity levels
  - Air quality and ventilation
  - Feed and water levels
  - Bird behavior and health indicators
  
- **Intelligent Alerts**: Smart notification system that triggers alerts for:
  - Temperature/humidity out of range
  - Equipment failures
  - Feed/water shortages
  - Unusual bird behavior patterns
  - Health concerns

- **Multi-channel Notifications**:
  - SMS alerts via Twilio
  - Email notifications
  - Web dashboard alerts
  - Mobile app notifications

- **Data Analytics**:
  - Historical trend analysis
  - Predictive health monitoring
  - Performance metrics and reporting
  - Environmental condition logging

## 🏗️ Architecture

```
poultry-alert-system/
├── src/
│   ├── sensors/          # Sensor data collection modules
│   ├── alerts/           # Alert logic and notification systems
│   ├── analytics/        # Data analysis and reporting
│   ├── dashboard/        # Web interface
│   └── main.py          # Main application entry point
├── config/              # Configuration files
├── tests/               # Unit and integration tests
├── docs/                # Documentation
└── requirements.txt     # Python dependencies
```

## 🚀 Quick Start

### Prerequisites

- Python 3.8 or higher
- Raspberry Pi (recommended for sensor integration) or any compatible hardware
- Temperature/humidity sensors (DHT22, DS18B20, etc.)
- Internet connection for notifications

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd poultry-alert-system
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Configure the system:
```bash
cp config/config_template.yaml config/config.yaml
# Edit config/config.yaml with your settings
```

5. Run the system:
```bash
python src/main.py
```

## ⚙️ Configuration

The system uses YAML configuration files located in the `config/` directory:

- `config.yaml`: Main configuration file
- `sensors_config.yaml`: Sensor-specific settings
- `alerts_config.yaml`: Alert thresholds and notification preferences

### Example Configuration

```yaml
# Temperature monitoring
temperature:
  min_threshold: 18.0  # Celsius
  max_threshold: 24.0  # Celsius
  check_interval: 60   # seconds

# Notifications
notifications:
  email:
    enabled: true
    smtp_server: "smtp.gmail.com"
    port: 587
  sms:
    enabled: true
    provider: "twilio"
```

## 📊 Monitoring Parameters

| Parameter | Description | Typical Range | Alert Conditions |
|-----------|-------------|---------------|------------------|
| Temperature | Coop temperature | 18-24°C | < 15°C or > 27°C |
| Humidity | Relative humidity | 50-70% | < 40% or > 80% |
| Air Quality | CO2/NH3 levels | Low | High concentrations |
| Feed Level | Feed availability | Full | < 20% capacity |
| Water Level | Water availability | Full | < 30% capacity |

## 🔧 Hardware Setup

### Recommended Sensors

- **DHT22**: Temperature and humidity monitoring
- **MQ-135**: Air quality sensor for ammonia and CO2
- **Ultrasonic sensors**: For feed and water level monitoring
- **PIR sensors**: For detecting bird movement and activity
- **Load cells**: For precise weight monitoring of feed containers

### Wiring Diagram

```
Raspberry Pi GPIO Layout:
GPIO 2  (SDA) ──── DHT22 Data
GPIO 4        ──── Temperature Sensor
GPIO 17       ──── Feed Level Sensor
GPIO 27       ──── Water Level Sensor
GPIO 22       ──── Air Quality Sensor
```

## 🚨 Alert System

### Alert Types

1. **Critical Alerts**: Immediate attention required
   - Extreme temperatures
   - Equipment failures
   - Health emergencies

2. **Warning Alerts**: Conditions need monitoring
   - Approaching thresholds
   - Minor equipment issues

3. **Info Alerts**: Routine notifications
   - Daily reports
   - Maintenance reminders

### Notification Channels

- **SMS**: For immediate critical alerts
- **Email**: For detailed reports and warnings
- **Dashboard**: Real-time web interface
- **Logs**: Complete system activity records

## 📈 Analytics and Reporting

- Daily, weekly, and monthly environmental reports
- Bird health and productivity trends
- Equipment performance monitoring
- Cost analysis and optimization suggestions
- Predictive maintenance scheduling

## 🧪 Testing

Run the test suite:
```bash
pytest tests/
```

Run with coverage:
```bash
pytest --cov=src tests/
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, please create an issue in the GitHub repository or contact the development team.

## 🗺️ Roadmap

- [ ] Mobile app development
- [ ] Machine learning for predictive analytics
- [ ] Integration with farm management systems
- [ ] Advanced bird behavior recognition
- [ ] Automated feeding and watering controls
- [ ] Multi-farm management capabilities

---

**Note**: This system is designed to assist poultry farmers in monitoring their facilities. Always consult with veterinary professionals for health-related decisions.