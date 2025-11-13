"""
Security Guardian Agent - Notification System
Desktop alerts for security findings and scan results.
"""

import platform
import subprocess
from typing import List, Dict
from datetime import datetime


class NotificationSystem:
    """Cross-platform desktop notification system."""

    def __init__(self):
        """Initialize notification system."""
        self.os_type = platform.system()
        self.notifications_sent = []

    def send_notification(self, title: str, message: str, urgency: str = "normal"):
        """
        Send a desktop notification.

        Args:
            title: Notification title
            message: Notification message
            urgency: low, normal, critical
        """
        notification = {
            "title": title,
            "message": message,
            "urgency": urgency,
            "timestamp": datetime.now().isoformat()
        }

        self.notifications_sent.append(notification)

        if self.os_type == "Windows":
            self._send_windows_notification(title, message, urgency)
        elif self.os_type == "Darwin":  # macOS
            self._send_macos_notification(title, message)
        else:  # Linux
            self._send_linux_notification(title, message, urgency)

    def _send_windows_notification(self, title: str, message: str, urgency: str):
        """Send notification on Windows using PowerShell."""
        try:
            # Using Windows 10/11 toast notifications
            ps_script = f"""
[Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
[Windows.UI.Notifications.ToastNotification, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
[Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] | Out-Null

$APP_ID = 'SecurityGuardianAgent'

$template = @"
<toast>
    <visual>
        <binding template="ToastText02">
            <text id="1">{title}</text>
            <text id="2">{message}</text>
        </binding>
    </visual>
</toast>
"@

$xml = New-Object Windows.Data.Xml.Dom.XmlDocument
$xml.LoadXml($template)
$toast = New-Object Windows.UI.Notifications.ToastNotification $xml
[Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier($APP_ID).Show($toast)
"""

            subprocess.run(
                ["powershell", "-Command", ps_script],
                capture_output=True,
                timeout=5
            )
        except Exception as e:
            # Fallback to simpler notification
            try:
                self._send_windows_balloon(title, message)
            except Exception:
                print(f"[NOTIFICATION] {title}: {message}")

    def _send_windows_balloon(self, title: str, message: str):
        """Fallback Windows notification using msg command."""
        try:
            # Use msg command for simple notification
            subprocess.run(
                ["msg", "*", f"{title}\n\n{message}"],
                capture_output=True,
                timeout=2
            )
        except Exception:
            pass

    def _send_macos_notification(self, title: str, message: str):
        """Send notification on macOS using osascript."""
        try:
            script = f'display notification "{message}" with title "{title}"'
            subprocess.run(
                ["osascript", "-e", script],
                capture_output=True,
                timeout=5
            )
        except Exception as e:
            print(f"[NOTIFICATION] {title}: {message}")

    def _send_linux_notification(self, title: str, message: str, urgency: str):
        """Send notification on Linux using notify-send."""
        try:
            subprocess.run(
                ["notify-send", "-u", urgency, title, message],
                capture_output=True,
                timeout=5
            )
        except Exception as e:
            print(f"[NOTIFICATION] {title}: {message}")

    def notify_scan_start(self):
        """Notify that security scan has started."""
        self.send_notification(
            "Security Guardian Agent",
            "Security scan started...",
            "low"
        )

    def notify_scan_complete(self, summary: Dict):
        """Notify scan completion with summary."""
        risk_score = summary.get("overall_risk_score", 0)
        critical = summary.get("risk_distribution", {}).get("critical", 0)
        high = summary.get("risk_distribution", {}).get("high", 0)

        if critical > 0:
            urgency = "critical"
            message = f"[CRITICAL] CRITICAL: Found {critical} critical security issues!"
        elif high > 0:
            urgency = "critical"
            message = f"[WARNING] Found {high} high-risk security issues!"
        elif risk_score > 15:
            urgency = "normal"
            message = f"Found {risk_score} security concerns. Review recommended."
        else:
            urgency = "low"
            message = "[OK] Scan complete! Your system looks secure."

        self.send_notification(
            "Security Scan Complete",
            message,
            urgency
        )

    def notify_critical_finding(self, finding: Dict):
        """Send immediate notification for critical findings."""
        self.send_notification(
            "[CRITICAL] CRITICAL Security Issue!",
            f"{finding['description']}\n\n{finding['recommendation'][:100]}...",
            "critical"
        )

    def notify_high_risk_finding(self, finding: Dict):
        """Send notification for high-risk findings."""
        self.send_notification(
            "[WARNING] High-Risk Security Issue",
            f"{finding['description']}\n\nRecommendation: {finding['recommendation'][:80]}...",
            "critical"
        )

    def send_daily_reminder(self):
        """Send daily security reminder."""
        self.send_notification(
            "Security Guardian Agent",
            "Daily reminder: Run your security scan to stay protected!",
            "low"
        )

    def send_summary_notification(self, findings: List[Dict]):
        """Send comprehensive summary notification."""
        critical_count = sum(1 for f in findings if f['risk_level'] == 'critical')
        high_count = sum(1 for f in findings if f['risk_level'] == 'high')
        medium_count = sum(1 for f in findings if f['risk_level'] == 'medium')

        if critical_count > 0:
            message = f"[CRITICAL] {critical_count} Critical, {high_count} High, {medium_count} Medium issues found!"
            urgency = "critical"
        elif high_count > 0:
            message = f"[WARNING] {high_count} High-risk, {medium_count} Medium issues found!"
            urgency = "critical"
        elif medium_count > 0:
            message = f"[INFO] {medium_count} Medium-risk issues found. Review recommended."
            urgency = "normal"
        else:
            message = "[OK] All security checks passed! Your system is secure."
            urgency = "low"

        self.send_notification(
            "Security Guardian - Scan Results",
            message,
            urgency
        )

    def get_notification_history(self) -> List[Dict]:
        """Get history of sent notifications."""
        return self.notifications_sent


class AlertScheduler:
    """Schedule periodic security alerts."""

    def __init__(self, notifier: NotificationSystem):
        """Initialize alert scheduler."""
        self.notifier = notifier
        self.last_scan_time = None

    def check_and_alert(self, hours_since_last_scan: int = 24):
        """Check if it's time to send a reminder."""
        if self.last_scan_time is None:
            self.notifier.send_daily_reminder()
            return True

        # Calculate hours since last scan
        now = datetime.now()
        if self.last_scan_time:
            time_diff = (now - self.last_scan_time).total_seconds() / 3600

            if time_diff >= hours_since_last_scan:
                self.notifier.send_daily_reminder()
                return True

        return False

    def update_scan_time(self):
        """Update last scan timestamp."""
        self.last_scan_time = datetime.now()


def create_windows_scheduled_task():
    """Create Windows scheduled task for daily security scans."""
    ps_script = """
$action = New-ScheduledTaskAction -Execute 'python' -Argument 'C:\\Users\\Ro050\\Desktop\\ai-projects\\security-guardian-agent\\main.py -t full'
$trigger = New-ScheduledTaskTrigger -Daily -At 9am
$principal = New-ScheduledTaskPrincipal -UserId (Get-CimInstance -ClassName Win32_ComputerSystem | Select-Object -expand UserName)
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
$task = New-ScheduledTask -Action $action -Principal $principal -Trigger $trigger -Settings $settings
Register-ScheduledTask 'SecurityGuardianDailyScan' -InputObject $task
"""

    try:
        subprocess.run(
            ["powershell", "-Command", ps_script],
            capture_output=True,
            timeout=10
        )
        print("[SUCCESS] Daily security scan scheduled!")
        return True
    except Exception as e:
        print(f"[ERROR] Failed to create scheduled task: {e}")
        return False
