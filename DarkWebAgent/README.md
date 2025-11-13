# Security Guardian Agent

**A Defensive Cybersecurity Analysis Tool for Privacy Protection**

Security Guardian Agent is an intelligent cybersecurity tool that analyzes your system's security posture and privacy settings. It provides step-by-step thinking and actionable recommendations to improve your digital security.

## Features

- **Comprehensive Security Analysis**
  - Firewall status checking
  - Open port scanning
  - Sensitive file permission auditing
  - Software vulnerability detection

- **Privacy Protection**
  - Browser privacy analysis
  - Telemetry and data collection detection
  - Environment variable security
  - App permissions review
  - Location services monitoring

- **Transparent AI Thinking**
  - Shows step-by-step reasoning for each finding
  - Explains security risks in plain language
  - Provides context for recommendations

- **Multiple Report Formats**
  - Interactive console output
  - JSON (machine-readable)
  - Markdown (documentation)
  - HTML (web-viewable)

- **Desktop Notifications** 🔔
  - Real-time alerts for security findings
  - Critical, high-risk, and scan completion notifications
  - Works on Windows, macOS, and Linux
  - Can be disabled if not needed

- **Cross-Platform Support**
  - Windows
  - Linux
  - macOS

## Installation

### Prerequisites

- Python 3.8 or higher
- pip package manager

### Setup

1. Clone or download this repository:
```bash
cd security-guardian-agent
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Make the script executable (Linux/macOS):
```bash
chmod +x main.py
```

## Usage

### Interactive Mode (Recommended)

Run the agent in interactive mode for a guided experience:

```bash
python main.py --interactive
```

Or simply:
```bash
python main.py
```

You'll see a menu with options:
1. Full Security Scan (Security + Privacy)
2. Security Analysis Only
3. Privacy Analysis Only
4. Custom Scan
5. Exit

### Command-Line Mode

Run specific scans directly:

```bash
# Full scan
python main.py -t full

# Security scan only
python main.py -t security

# Privacy scan only
python main.py -t privacy
```

### Save Reports

Export results to a file:

```bash
# Save as JSON
python main.py -t full -o report.json -f json

# Save as Markdown
python main.py -t full -o report.md -f md

# Save as HTML
python main.py -t full -o report.html -f html
```

### Desktop Notifications

Enable/disable real-time desktop alerts:

```bash
# With notifications (default)
python main.py -t full

# Without notifications
python main.py -t full --no-notify

# Test notifications
python test_notifications.py
```

For detailed notification documentation, see [NOTIFICATIONS.md](NOTIFICATIONS.md)

## Example Output

```
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║         SECURITY GUARDIAN AGENT                               ║
║         Defensive Cybersecurity Analysis Tool                 ║
║                                                               ║
║         Protecting Your Privacy, One Step at a Time           ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

🤔 Thinking: Starting comprehensive security analysis...

[*] Running System Security Checks...
🤔 Thinking: Checking firewall status to ensure network protection...
✓ Firewall is enabled - good security posture

[*] Running Network Security Checks...
🤔 Thinking: Scanning for open network ports that could be attack vectors...
🤔 Thinking: Found 12 listening ports - analyzing risk level...

================================================================================
  SECURITY GUARDIAN AGENT - SECURITY SCAN REPORT
================================================================================

[SYSTEM INFORMATION]
  OS: Windows 10
  Hostname: USER-PC
  Scan Time: 2025-10-16T14:30:00

[SUMMARY]
  Total Checks: 8
  Critical Issues: 0
  High Risk: 1
  Medium Risk: 3
  Low Risk: 4

  Overall Risk Score: 15
  Risk Level: MEDIUM - Address issues soon

[DETAILED FINDINGS]

[HIGH RISK ISSUES]

  1. Found 2 potentially risky open ports
     Category: network_security
     Status: FAIL
     Recommendation: Review and close unnecessary ports. Use firewall rules to restrict access.
```

## Security Checks Performed

### System Security
- Firewall status and configuration
- Automatic update settings
- Disk encryption status
- User Account Control (UAC) settings

### Network Security
- Open ports and listening services
- Active network connections
- DNS security configuration
- WiFi encryption status

### File Security
- SSH key permissions
- Sensitive configuration file exposure
- Temporary file cleanup
- File permission auditing

### Privacy Settings
- Browser data and cookie analysis
- System telemetry configuration
- Location services status
- App permissions review
- Camera and microphone access

### Software Vulnerabilities
- Outdated software detection
- Python package versions
- Operating system version
- Package manager vulnerabilities

## Configuration

Edit `config.json` to customize security checks:

```json
{
  "security_checks": {
    "system_security": {
      "enabled": true,
      "checks": ["firewall_status", "auto_updates", ...]
    },
    "network_security": {
      "enabled": true,
      "checks": ["open_ports", "active_connections", ...]
    },
    ...
  }
}
```

## Understanding Risk Levels

- **Critical**: Immediate action required (e.g., no firewall, unencrypted disk)
- **High**: Address soon (e.g., outdated OS, risky open ports)
- **Medium**: Important for privacy (e.g., telemetry enabled, many cookies)
- **Low**: Informational or best practices

## Ethical Use

This tool is designed for **DEFENSIVE SECURITY ONLY**:

✅ **Allowed Uses:**
- Analyzing your own systems
- Improving personal security
- Educational purposes
- Security audits with permission

❌ **Prohibited Uses:**
- Scanning systems you don't own
- Credential harvesting
- Malicious activities
- Unauthorized access

## Limitations

- Requires appropriate permissions for some checks
- Some checks may require administrator/root access
- Results are recommendations, not absolute security guarantees
- Should be used as part of a comprehensive security strategy

## Troubleshooting

### Permission Errors

Some checks require elevated privileges:

**Windows:**
```bash
# Run as Administrator
python main.py
```

**Linux/macOS:**
```bash
sudo python3 main.py
```

### Missing Dependencies

If you encounter import errors:

```bash
pip install -r requirements.txt --upgrade
```

### Rich Library Not Found

For basic functionality without colored output:

```bash
python main.py
# Works without 'rich', but output is plain text
```

## Contributing

This is a defensive security tool. Contributions should:
- Focus on defensive security analysis
- Respect privacy and ethical guidelines
- Include clear documentation
- Not enable malicious use

## License

This project is provided for educational and defensive security purposes.

## Disclaimer

This tool provides security recommendations but does not guarantee complete protection. Always follow security best practices and consult with security professionals for critical systems.

## Support

For issues or questions:
- Review the documentation
- Check configuration settings
- Ensure you have appropriate permissions
- Verify Python and dependency versions

## Roadmap

Future enhancements:
- [ ] Custom security rule engine
- [ ] Integration with vulnerability databases
- [ ] Network traffic analysis
- [ ] Enhanced privacy scoring
- [ ] Automated remediation scripts
- [ ] Multi-language support

---

**Remember: Security is a journey, not a destination. Regular scans and updates are essential!**
