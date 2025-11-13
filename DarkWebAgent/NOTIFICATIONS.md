# Desktop Notification System

The Security Guardian Agent now includes a comprehensive desktop notification system that alerts you about security findings in real-time!

## Features

### Automatic Notifications

The agent automatically sends desktop notifications for:

1. **Scan Start** - When a security scan begins
2. **Critical Findings** - Immediate alerts for critical security issues
3. **High-Risk Findings** - Warnings for high-risk security problems
4. **Scan Complete** - Summary when scan finishes with overall risk assessment

### Notification Types

#### Critical Alerts (Red Flag)
```
[CRITICAL] CRITICAL Security Issue!
Windows Firewall is disabled!

Enable Windows Firewall immediately...
```

#### High-Risk Warnings
```
[WARNING] High-Risk Security Issue
Found 5 potentially risky open ports

Recommendation: Review and close unnecessary ports...
```

#### Scan Complete (Risk-Based)
```
# Low Risk
[OK] Scan complete! Your system looks secure.

# High Risk
[CRITICAL] CRITICAL: Found 2 critical security issues!

# Medium Risk
[WARNING] 2 High-risk, 1 Medium issues found!
```

## How to Use

### Enable Notifications (Default)

Notifications are **enabled by default**. Just run the agent normally:

```cmd
py main.py -t full
```

### Disable Notifications

If you don't want desktop notifications:

```cmd
py main.py -t full --no-notify
```

### Test Notifications

To test if notifications are working on your system:

```cmd
py test_notifications.py
```

This will send 7 test notifications and show you the notification history.

## Platform Support

### Windows 10/11
- Uses PowerShell toast notifications
- Notifications appear in the Windows Notification Center
- Supports critical, normal, and low urgency levels

### macOS
- Uses AppleScript notifications
- Appears in Notification Center
- Native macOS notification style

### Linux
- Uses `notify-send` (requires libnotify)
- Install if needed: `sudo apt install libnotify-bin`
- Works with most desktop environments (GNOME, KDE, XFCE)

## Notification Examples

### Scan Start
When you run a security scan:
```
Title: Security Guardian Agent
Message: Security scan started...
Urgency: Low
```

### Critical Finding
If firewall is disabled:
```
Title: [CRITICAL] CRITICAL Security Issue!
Message: Windows Firewall is disabled!

Enable Windows Firewall immediately: Control Panel >
System and Security > Windows Defender Firewall > Turn on
Urgency: Critical
```

### High-Risk Finding
If risky ports are detected:
```
Title: [WARNING] High-Risk Security Issue
Message: Found 6 potentially risky open ports

Recommendation: Review and close unnecessary ports using firewall rules
Urgency: Critical
```

### Scan Complete - Secure System
```
Title: Security Scan Complete
Message: [OK] Scan complete! Your system looks secure.
Urgency: Low
```

### Scan Complete - Issues Found
```
Title: Security Scan Complete
Message: [CRITICAL] CRITICAL: Found 2 critical security issues!
Urgency: Critical
```

## Notification History

All notifications are logged and can be reviewed:

```python
from src.notification_system import NotificationSystem

notifier = NotificationSystem()
# ... send notifications ...

history = notifier.get_notification_history()
for notif in history:
    print(f"{notif['title']} - {notif['timestamp']}")
```

## Command-Line Options

```bash
# Run with notifications (default)
py main.py -t full

# Run without notifications
py main.py -t full --no-notify

# Interactive mode (has notifications)
py main.py --interactive
```

## Scheduled Scanning

You can set up automatic daily scans with notifications!

### Windows Scheduled Task

The notification system includes a helper to create scheduled tasks:

```python
from src.notification_system import create_windows_scheduled_task

# Create daily scan at 9 AM
create_windows_scheduled_task()
```

Or manually via Task Scheduler:
1. Open Task Scheduler
2. Create Basic Task
3. Name: "Security Guardian Daily Scan"
4. Trigger: Daily at 9:00 AM
5. Action: Start a program
6. Program: `python`
7. Arguments: `C:\path\to\security-guardian-agent\main.py -t full`

### Linux/macOS Cron Job

Add to crontab (`crontab -e`):

```bash
# Daily scan at 9 AM
0 9 * * * cd /path/to/security-guardian-agent && python3 main.py -t full
```

## Troubleshooting

### Windows: Notifications Not Appearing

1. **Check Focus Assist**: Settings > System > Focus Assist > Off
2. **Enable Notifications**: Settings > System > Notifications
3. **PowerShell Execution Policy**:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

### macOS: Notifications Not Appearing

1. **System Preferences** > Notifications > Terminal > Allow Notifications
2. Grant Terminal notification permissions

### Linux: notify-send not found

Install libnotify:
```bash
# Ubuntu/Debian
sudo apt install libnotify-bin

# Fedora
sudo dnf install libnotify

# Arch
sudo pacman -S libnotify
```

## Security & Privacy

- Notifications contain **summary information only**
- Full details are only in the terminal/report
- Notifications are **local only** - nothing is sent over the network
- No sensitive data (passwords, keys) is ever included in notifications

## Customizing Notifications

Want to customize notification behavior? Edit `src/notification_system.py`:

```python
# Change notification urgency levels
urgency = "low"  # or "normal", "critical"

# Customize messages
message = "Custom security alert message!"

# Send custom notification
notifier.send_notification(
    "Custom Title",
    "Custom message",
    "normal"
)
```

## Benefits

✅ **Immediate awareness** of critical security issues
✅ **Don't miss important findings** - get alerted even if you're away
✅ **Risk-based prioritization** - critical issues get urgent notifications
✅ **Scan completion alerts** - know when long scans finish
✅ **Cross-platform** - works on Windows, macOS, and Linux
✅ **Non-intrusive** - can be disabled if not needed

---

**Stay secure with real-time desktop alerts!** 🔒
