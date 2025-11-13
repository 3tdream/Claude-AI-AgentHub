# Quick Start Guide

## Installation

### Windows

1. **Run the setup script:**
   ```cmd
   setup.bat
   ```

2. **Or install manually:**
   ```cmd
   python -m pip install -r requirements.txt
   ```

### Linux/macOS

```bash
pip3 install -r requirements.txt
```

## Running Your First Scan

### Option 1: Interactive Mode (Easiest)

```bash
python main.py
```

Then select from the menu:
- Press `1` for a full security and privacy scan
- Press `2` for security only
- Press `3` for privacy only

### Option 2: Quick Scan

```bash
# Full scan
python main.py -t full

# Security only
python main.py -t security

# Privacy only
python main.py -t privacy
```

### Option 3: Generate Report

```bash
# Save as HTML report
python main.py -t full -o my_security_report.html -f html

# Save as JSON
python main.py -t full -o report.json -f json

# Save as Markdown
python main.py -t full -o report.md -f md
```

## What the Agent Does

The Security Guardian Agent performs **defensive security analysis** on your system:

### Security Checks
✅ Firewall status
✅ Open network ports
✅ File permissions on SSH keys
✅ Outdated software detection

### Privacy Checks
✅ Browser privacy settings
✅ System telemetry status
✅ Environment variables (credential exposure)
✅ App permissions
✅ Location services

## Understanding the Output

### Risk Levels

- 🔴 **CRITICAL** - Fix immediately (e.g., firewall disabled)
- 🟠 **HIGH** - Address soon (e.g., risky open ports)
- 🟡 **MEDIUM** - Privacy concerns (e.g., telemetry enabled)
- 🔵 **LOW** - Informational (good security practices)

### Thinking Steps

The agent shows its reasoning process:

```
🤔 Thinking: Checking firewall status to ensure network protection...
🤔 Thinking: Firewall is enabled - good security posture
✓ Windows Firewall is enabled
```

This transparency helps you understand WHY each recommendation is made.

## Example Session

```
╔═══════════════════════════════════════════════════════════════╗
║         SECURITY GUARDIAN AGENT                               ║
║         Defensive Cybersecurity Analysis Tool                 ║
╚═══════════════════════════════════════════════════════════════╝

What would you like to do?

  1. Full Security Scan (Security + Privacy)
  2. Security Analysis Only
  3. Privacy Analysis Only
  4. Custom Scan (choose specific checks)
  5. Exit

Enter your choice: 1

🤔 Thinking: Starting comprehensive security analysis...

[*] Running System Security Checks...
🤔 Thinking: Checking firewall status to ensure network protection...
✓ Firewall is enabled - good security posture

[*] Running Network Security Checks...
🤔 Thinking: Scanning for open network ports...
🤔 Thinking: Found 15 listening ports - analyzing risk level...

...

[SUMMARY]
  Total Checks: 12
  Critical Issues: 0
  High Risk: 2
  Medium Risk: 4
  Low Risk: 6

  Overall Risk Score: 20
  Risk Level: MEDIUM - Address issues soon
```

## Common Issues

### "Permission Denied"

Some checks require admin/root privileges:

**Windows:**
```cmd
Right-click Command Prompt → Run as Administrator
python main.py
```

**Linux/macOS:**
```bash
sudo python3 main.py
```

### "Module not found"

Install dependencies:
```bash
python -m pip install -r requirements.txt
```

### "Rich library not found"

The agent works without `rich` but with plain text output. To get colored output:
```bash
pip install rich
```

## Tips for Best Results

1. **Run as Administrator/Root** - Provides complete system access
2. **Run regularly** - Weekly scans catch new issues
3. **Save reports** - Track improvements over time
4. **Act on findings** - Follow the recommendations
5. **Customize config.json** - Enable/disable specific checks

## What's Next?

After your first scan:

1. **Review Critical/High issues** - Fix these immediately
2. **Save a baseline report** - Track your progress
3. **Implement recommendations** - Follow step-by-step guidance
4. **Re-scan** - Verify improvements
5. **Schedule regular scans** - Weekly or monthly

## Need Help?

Check `README.md` for detailed documentation or review the configuration in `config.json` to customize your scans.

---

**Stay secure!** 🔒
