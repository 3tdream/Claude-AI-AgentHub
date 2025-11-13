"""
Security Guardian Agent - Privacy Checker Module
Analyzes privacy settings and potential data exposure.
"""

import os
import platform
import subprocess
import glob
from typing import Dict, List
from datetime import datetime


class PrivacyChecker:
    """Privacy analysis and recommendations engine."""

    def __init__(self):
        """Initialize the privacy checker."""
        self.findings = []
        self.thinking_steps = []

    def think(self, step: str):
        """Record thinking step for transparency."""
        self.thinking_steps.append({
            "step": len(self.thinking_steps) + 1,
            "thought": step,
            "timestamp": datetime.now().isoformat()
        })

    def add_finding(self, category: str, check: str, status: str,
                    risk_level: str, description: str,
                    recommendation: str, details: dict = None):
        """Add a privacy finding."""
        finding = {
            "category": category,
            "check": check,
            "status": status,
            "risk_level": risk_level,
            "description": description,
            "recommendation": recommendation,
            "details": details or {},
            "timestamp": datetime.now().isoformat()
        }
        self.findings.append(finding)

    def check_browser_privacy(self) -> None:
        """Check browser privacy settings (basic analysis)."""
        self.think("Analyzing browser data and privacy configurations...")

        os_type = platform.system()
        browser_data_found = []

        # Common browser profile locations
        home = os.path.expanduser("~")

        browser_paths = {
            "Chrome": {
                "Windows": os.path.join(home, "AppData", "Local", "Google", "Chrome", "User Data"),
                "Linux": os.path.join(home, ".config", "google-chrome"),
                "Darwin": os.path.join(home, "Library", "Application Support", "Google", "Chrome")
            },
            "Firefox": {
                "Windows": os.path.join(home, "AppData", "Roaming", "Mozilla", "Firefox", "Profiles"),
                "Linux": os.path.join(home, ".mozilla", "firefox"),
                "Darwin": os.path.join(home, "Library", "Application Support", "Firefox")
            },
            "Edge": {
                "Windows": os.path.join(home, "AppData", "Local", "Microsoft", "Edge", "User Data"),
                "Linux": os.path.join(home, ".config", "microsoft-edge"),
                "Darwin": os.path.join(home, "Library", "Application Support", "Microsoft Edge")
            }
        }

        for browser, paths in browser_paths.items():
            browser_path = paths.get(os_type)
            if browser_path and os.path.exists(browser_path):
                self.think(f"Found {browser} browser data at {browser_path}")
                browser_data_found.append({
                    "browser": browser,
                    "path": browser_path,
                    "exists": True
                })

                # Check for cookie files (just count, don't read contents)
                try:
                    cookie_files = glob.glob(os.path.join(browser_path, "**", "Cookies*"), recursive=True)
                    if cookie_files:
                        self.think(f"Found {len(cookie_files)} cookie database(s) in {browser}")
                except Exception:
                    pass

        if browser_data_found:
            self.add_finding(
                "privacy_settings", "browser_privacy", "info", "medium",
                f"Found {len(browser_data_found)} browser(s) with stored data",
                "Review browser privacy settings:\n"
                "1. Clear cookies regularly\n"
                "2. Enable 'Do Not Track'\n"
                "3. Use privacy-focused extensions\n"
                "4. Configure automatic cookie deletion\n"
                "5. Review and limit site permissions",
                {"browsers": browser_data_found}
            )
        else:
            self.add_finding(
                "privacy_settings", "browser_privacy", "pass", "low",
                "No major browser data directories found",
                "Continue using privacy-conscious browsing practices",
                {}
            )

    def check_environment_variables(self) -> None:
        """Check for sensitive data in environment variables."""
        self.think("Scanning environment variables for exposed credentials...")

        sensitive_patterns = [
            'PASSWORD', 'SECRET', 'TOKEN', 'API_KEY', 'APIKEY',
            'AWS_SECRET', 'PRIVATE_KEY', 'CREDENTIAL'
        ]

        exposed_vars = []

        for key, value in os.environ.items():
            for pattern in sensitive_patterns:
                if pattern in key.upper():
                    self.think(f"Found potentially sensitive env var: {key}")
                    exposed_vars.append({
                        "variable": key,
                        "value_length": len(value),
                        "pattern_matched": pattern
                    })
                    break

        if exposed_vars:
            self.add_finding(
                "privacy_settings", "environment_variables", "warning", "medium",
                f"Found {len(exposed_vars)} environment variables with sensitive-looking names",
                "Review environment variables:\n"
                "1. Avoid storing secrets in environment variables\n"
                "2. Use secure secret management tools\n"
                "3. Never commit .env files to version control\n"
                "4. Consider using encrypted vaults (e.g., HashiCorp Vault, AWS Secrets Manager)",
                {"exposed_count": len(exposed_vars), "variables": [v["variable"] for v in exposed_vars]}
            )
        else:
            self.add_finding(
                "privacy_settings", "environment_variables", "pass", "low",
                "No obvious credentials found in environment variables",
                "Continue following secure credential management practices",
                {}
            )

    def check_telemetry_settings(self) -> None:
        """Check for system telemetry and data collection settings."""
        self.think("Analyzing system telemetry and diagnostic data collection...")

        os_type = platform.system()

        if os_type == "Windows":
            try:
                # Check Windows telemetry level
                result = subprocess.run(
                    ["reg", "query",
                     "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection",
                     "/v", "AllowTelemetry"],
                    capture_output=True, text=True, timeout=5
                )

                if result.returncode == 0:
                    if "0x0" in result.stdout:
                        self.add_finding(
                            "privacy_settings", "telemetry", "pass", "low",
                            "Windows telemetry is disabled (Security level)",
                            "Telemetry is at minimum level",
                            {"level": "Security (0)"}
                        )
                    else:
                        self.think("Windows telemetry is enabled - privacy concern")
                        self.add_finding(
                            "privacy_settings", "telemetry", "warning", "medium",
                            "Windows telemetry is enabled",
                            "Reduce telemetry:\n"
                            "1. Settings > Privacy > Diagnostics & feedback\n"
                            "2. Set to 'Required diagnostic data' only\n"
                            "3. Disable optional telemetry\n"
                            "4. Review app-specific telemetry settings",
                            {"registry_output": result.stdout[:200]}
                        )
                else:
                    self.add_finding(
                        "privacy_settings", "telemetry", "info", "low",
                        "Unable to determine telemetry settings",
                        "Manually check: Settings > Privacy > Diagnostics & feedback",
                        {}
                    )
            except Exception as e:
                self.add_finding(
                    "privacy_settings", "telemetry", "info", "low",
                    f"Could not check telemetry settings: {str(e)}",
                    "Manually verify privacy settings in Windows Settings",
                    {"error": str(e)}
                )

        elif os_type == "Darwin":  # macOS
            self.think("Checking macOS privacy settings...")
            self.add_finding(
                "privacy_settings", "telemetry", "info", "medium",
                "macOS privacy settings should be reviewed manually",
                "Check macOS privacy:\n"
                "1. System Preferences > Security & Privacy > Privacy\n"
                "2. System Preferences > Security & Privacy > Analytics & Improvements\n"
                "3. Disable 'Share Mac Analytics'\n"
                "4. Review Location Services permissions",
                {}
            )

        else:  # Linux
            self.add_finding(
                "privacy_settings", "telemetry", "pass", "low",
                "Linux typically has minimal telemetry by default",
                "Review distribution-specific telemetry (Ubuntu: ubuntu-report)",
                {}
            )

    def check_app_permissions(self) -> None:
        """Check application permissions (basic analysis)."""
        self.think("Reviewing application permissions and access controls...")

        os_type = platform.system()

        if os_type == "Windows":
            self.add_finding(
                "privacy_settings", "app_permissions", "info", "medium",
                "Windows app permissions should be reviewed",
                "Review app permissions:\n"
                "1. Settings > Privacy > App permissions\n"
                "2. Check Camera, Microphone, Location access\n"
                "3. Remove permissions from unused apps\n"
                "4. Review background app access",
                {}
            )

        elif os_type == "Darwin":
            self.add_finding(
                "privacy_settings", "app_permissions", "info", "medium",
                "macOS app permissions should be reviewed",
                "Review permissions:\n"
                "1. System Preferences > Security & Privacy > Privacy tab\n"
                "2. Check Camera, Microphone, Files and Folders\n"
                "3. Review Full Disk Access permissions\n"
                "4. Audit Accessibility permissions",
                {}
            )

        else:  # Linux
            self.add_finding(
                "privacy_settings", "app_permissions", "pass", "low",
                "Linux uses traditional permission model",
                "Follow principle of least privilege for all applications",
                {}
            )

    def check_location_services(self) -> None:
        """Check location services status."""
        self.think("Checking location services and geolocation tracking...")

        os_type = platform.system()

        if os_type == "Windows":
            try:
                result = subprocess.run(
                    ["reg", "query",
                     "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\CapabilityAccessManager\\ConsentStore\\location",
                     "/v", "Value"],
                    capture_output=True, text=True, timeout=5
                )

                if "Deny" in result.stdout:
                    self.add_finding(
                        "privacy_settings", "location_services", "pass", "low",
                        "Location services are disabled",
                        "Location privacy is protected",
                        {}
                    )
                else:
                    self.add_finding(
                        "privacy_settings", "location_services", "warning", "medium",
                        "Location services may be enabled",
                        "Disable location if not needed: Settings > Privacy > Location",
                        {}
                    )
            except Exception:
                self.add_finding(
                    "privacy_settings", "location_services", "info", "low",
                    "Check location services manually",
                    "Review: Settings > Privacy > Location",
                    {}
                )
        else:
            self.add_finding(
                "privacy_settings", "location_services", "info", "low",
                "Check location services in system settings",
                "Disable location services if not required",
                {}
            )

    def run_privacy_scan(self) -> Dict:
        """Run all privacy checks."""
        self.think("Starting comprehensive privacy analysis...")

        print("\n[*] Checking Browser Privacy...")
        self.check_browser_privacy()

        print("[*] Checking Environment Variables...")
        self.check_environment_variables()

        print("[*] Checking Telemetry Settings...")
        self.check_telemetry_settings()

        print("[*] Checking App Permissions...")
        self.check_app_permissions()

        print("[*] Checking Location Services...")
        self.check_location_services()

        self.think("Privacy scan completed!")

        return {
            "findings": self.findings,
            "thinking_steps": self.thinking_steps,
            "summary": self._generate_summary()
        }

    def _generate_summary(self) -> Dict:
        """Generate privacy summary."""
        total = len(self.findings)
        warnings = sum(1 for f in self.findings if f['status'] == 'warning')
        passed = sum(1 for f in self.findings if f['status'] == 'pass')

        return {
            "total_checks": total,
            "warnings": warnings,
            "passed": passed,
            "privacy_score": max(0, 100 - (warnings * 15))
        }
