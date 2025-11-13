"""
Test script for desktop notifications.
"""

import sys
import os

# Add src directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from notification_system import NotificationSystem

def test_notifications():
    """Test desktop notification system."""
    print("Testing Desktop Notification System...")
    print("=" * 60)

    notifier = NotificationSystem()

    # Test 1: Basic notification
    print("\n[Test 1] Sending basic notification...")
    notifier.send_notification(
        "Security Guardian Test",
        "Testing desktop notification system!",
        "normal"
    )
    print("[OK] Basic notification sent")

    # Test 2: Scan start notification
    print("\n[Test 2] Sending scan start notification...")
    notifier.notify_scan_start()
    print("[OK] Scan start notification sent")

    # Test 3: Critical finding notification
    print("\n[Test 3] Sending critical finding notification...")
    test_finding = {
        "description": "Windows Firewall is disabled!",
        "recommendation": "Enable Windows Firewall immediately in Control Panel > System and Security"
    }
    notifier.notify_critical_finding(test_finding)
    print("[OK] Critical finding notification sent")

    # Test 4: High-risk finding notification
    print("\n[Test 4] Sending high-risk finding notification...")
    test_finding = {
        "description": "Found 5 potentially risky open ports",
        "recommendation": "Review and close unnecessary ports using firewall rules"
    }
    notifier.notify_high_risk_finding(test_finding)
    print("[OK] High-risk finding notification sent")

    # Test 5: Scan complete notification (low risk)
    print("\n[Test 5] Sending scan complete notification (low risk)...")
    summary = {
        "overall_risk_score": 5,
        "risk_distribution": {
            "critical": 0,
            "high": 0,
            "medium": 1,
            "low": 3
        }
    }
    notifier.notify_scan_complete(summary)
    print("[OK] Scan complete notification sent")

    # Test 6: Scan complete notification (high risk)
    print("\n[Test 6] Sending scan complete notification (high risk)...")
    summary_high_risk = {
        "overall_risk_score": 35,
        "risk_distribution": {
            "critical": 2,
            "high": 3,
            "medium": 2,
            "low": 1
        }
    }
    notifier.notify_scan_complete(summary_high_risk)
    print("[OK] High-risk scan complete notification sent")

    # Test 7: Summary notification
    print("\n[Test 7] Sending summary notification...")
    test_findings = [
        {"risk_level": "high"},
        {"risk_level": "high"},
        {"risk_level": "medium"},
        {"risk_level": "low"}
    ]
    notifier.send_summary_notification(test_findings)
    print("[OK] Summary notification sent")

    # Show notification history
    print("\n" + "=" * 60)
    print("Notification History:")
    print("=" * 60)
    history = notifier.get_notification_history()
    for i, notif in enumerate(history, 1):
        print(f"\n{i}. {notif['title']}")
        print(f"   Message: {notif['message']}")
        print(f"   Urgency: {notif['urgency']}")
        print(f"   Time: {notif['timestamp']}")

    print("\n" + "=" * 60)
    print(f"Total notifications sent: {len(history)}")
    print("=" * 60)

    print("\n[OK] All notification tests completed!")
    print("\nCheck your desktop for notification popups.")
    print("On Windows 10/11, they should appear in the notification center.")

if __name__ == "__main__":
    test_notifications()
