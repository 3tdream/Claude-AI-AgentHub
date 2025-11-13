"""
Security Guardian Agent - Security Analyzer Module
Performs defensive security analysis on system configurations.
"""

import os
import sys
import platform
import subprocess
import psutil
import json
from typing import Dict, List, Tuple
from datetime import datetime


class SecurityAnalyzer:
    """Main security scanning engine with step-by-step analysis."""

    def __init__(self, config_path: str = "config.json"):
        """Initialize the security analyzer."""
        self.config = self._load_config(config_path)
        self.findings = []
        self.system_info = self._gather_system_info()
        self.thinking_steps = []

    def _load_config(self, config_path: str) -> dict:
        """Load configuration from JSON file."""
        try:
            with open(config_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"Config file not found: {config_path}")
            return {}

    def _gather_system_info(self) -> dict:
        """Gather basic system information."""
        return {
            "os": platform.system(),
            "os_version": platform.version(),
            "os_release": platform.release(),
            "architecture": platform.machine(),
            "hostname": platform.node(),
            "python_version": platform.python_version(),
            "scan_time": datetime.now().isoformat()
        }

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
        """Add a security finding."""
        finding = {
            "category": category,
            "check": check,
            "status": status,  # pass, fail, warning, info
            "risk_level": risk_level,  # critical, high, medium, low
            "description": description,
            "recommendation": recommendation,
            "details": details or {},
            "timestamp": datetime.now().isoformat()
        }
        self.findings.append(finding)

    def check_firewall_status(self) -> None:
        """Check if system firewall is enabled."""
        self.think("Checking firewall status to ensure network protection...")

        os_type = platform.system()

        if os_type == "Windows":
            try:
                result = subprocess.run(
                    ["netsh", "advfirewall", "show", "allprofiles", "state"],
                    capture_output=True, text=True, timeout=5
                )

                if "ON" in result.stdout:
                    self.think("Firewall is enabled - good security posture")
                    self.add_finding(
                        "system_security", "firewall_status", "pass", "low",
                        "Windows Firewall is enabled",
                        "Continue monitoring firewall status regularly",
                        {"status": "enabled", "output": result.stdout[:200]}
                    )
                else:
                    self.think("CRITICAL: Firewall is disabled - major security risk")
                    self.add_finding(
                        "system_security", "firewall_status", "fail", "critical",
                        "Windows Firewall is disabled or not configured",
                        "Enable Windows Firewall immediately: Control Panel > System and Security > Windows Defender Firewall > Turn on",
                        {"status": "disabled"}
                    )
            except Exception as e:
                self.add_finding(
                    "system_security", "firewall_status", "warning", "medium",
                    f"Unable to check firewall status: {str(e)}",
                    "Manually verify firewall is enabled",
                    {"error": str(e)}
                )

        elif os_type == "Linux":
            # Check for ufw, iptables, or firewalld
            firewall_tools = ["ufw", "iptables", "firewalld"]
            firewall_found = False

            for tool in firewall_tools:
                try:
                    result = subprocess.run(
                        ["which", tool],
                        capture_output=True, timeout=2
                    )
                    if result.returncode == 0:
                        firewall_found = True
                        self.think(f"Found {tool} firewall - checking status...")

                        if tool == "ufw":
                            status_result = subprocess.run(
                                ["sudo", "ufw", "status"],
                                capture_output=True, text=True, timeout=5
                            )
                            if "active" in status_result.stdout.lower():
                                self.add_finding(
                                    "system_security", "firewall_status", "pass", "low",
                                    f"UFW firewall is active",
                                    "Continue monitoring firewall rules",
                                    {"tool": tool, "status": "active"}
                                )
                            else:
                                self.add_finding(
                                    "system_security", "firewall_status", "fail", "high",
                                    "UFW firewall is installed but not active",
                                    "Enable UFW: sudo ufw enable",
                                    {"tool": tool, "status": "inactive"}
                                )
                        break
                except Exception:
                    continue

            if not firewall_found:
                self.add_finding(
                    "system_security", "firewall_status", "fail", "high",
                    "No firewall detected on Linux system",
                    "Install and enable UFW: sudo apt install ufw && sudo ufw enable",
                    {"available_tools": firewall_tools}
                )

        else:  # macOS
            try:
                result = subprocess.run(
                    ["defaults", "read", "/Library/Preferences/com.apple.alf", "globalstate"],
                    capture_output=True, text=True, timeout=5
                )
                state = result.stdout.strip()

                if state == "1" or state == "2":
                    self.add_finding(
                        "system_security", "firewall_status", "pass", "low",
                        "macOS firewall is enabled",
                        "Continue monitoring firewall settings",
                        {"state": state}
                    )
                else:
                    self.add_finding(
                        "system_security", "firewall_status", "fail", "critical",
                        "macOS firewall is disabled",
                        "Enable firewall: System Preferences > Security & Privacy > Firewall",
                        {"state": state}
                    )
            except Exception as e:
                self.add_finding(
                    "system_security", "firewall_status", "warning", "medium",
                    f"Unable to check macOS firewall: {str(e)}",
                    "Manually verify firewall in System Preferences",
                    {"error": str(e)}
                )

    def check_open_ports(self) -> None:
        """Check for open network ports."""
        self.think("Scanning for open network ports that could be attack vectors...")

        connections = psutil.net_connections(kind='inet')
        listening_ports = []

        for conn in connections:
            if conn.status == 'LISTEN' and conn.laddr:
                listening_ports.append({
                    "port": conn.laddr.port,
                    "address": conn.laddr.ip,
                    "pid": conn.pid
                })

        self.think(f"Found {len(listening_ports)} listening ports - analyzing risk level...")

        # Common safe ports
        common_safe = {22, 80, 443, 3000, 5000, 8000, 8080}
        # Potentially risky ports
        risky_ports = {21, 23, 135, 139, 445, 3389, 5900}

        high_risk_found = []
        for port_info in listening_ports:
            port = port_info['port']
            if port in risky_ports:
                high_risk_found.append(port_info)

        if high_risk_found:
            self.think("ALERT: Found potentially risky ports exposed!")
            self.add_finding(
                "network_security", "open_ports", "fail", "high",
                f"Found {len(high_risk_found)} potentially risky open ports",
                "Review and close unnecessary ports. Use firewall rules to restrict access.",
                {
                    "risky_ports": high_risk_found,
                    "total_listening": len(listening_ports)
                }
            )
        else:
            self.add_finding(
                "network_security", "open_ports", "pass", "low",
                f"Scanned {len(listening_ports)} open ports - no high-risk ports detected",
                "Regularly monitor open ports for unauthorized services",
                {"listening_ports": listening_ports[:10]}  # Limit to first 10
            )

    def check_sensitive_file_permissions(self) -> None:
        """Check permissions on sensitive files (defensive only)."""
        self.think("Checking permissions on SSH keys and sensitive configuration files...")

        sensitive_locations = []

        # Only check in user's home directory (defensive)
        home = os.path.expanduser("~")
        ssh_dir = os.path.join(home, ".ssh")

        if os.path.exists(ssh_dir):
            try:
                for filename in os.listdir(ssh_dir):
                    filepath = os.path.join(ssh_dir, filename)
                    if os.path.isfile(filepath):
                        stat_info = os.stat(filepath)
                        mode = oct(stat_info.st_mode)[-3:]

                        # Check if private key has too permissive settings
                        if filename.endswith(('id_rsa', 'id_ecdsa', 'id_ed25519')) and mode != '600':
                            self.think(f"Found overly permissive SSH key: {filename} ({mode})")
                            sensitive_locations.append({
                                "file": filepath,
                                "current_permissions": mode,
                                "recommended": "600"
                            })
            except Exception as e:
                self.think(f"Error scanning SSH directory: {str(e)}")

        if sensitive_locations:
            self.add_finding(
                "file_security", "sensitive_file_permissions", "fail", "high",
                f"Found {len(sensitive_locations)} files with overly permissive permissions",
                "Restrict permissions on SSH keys: chmod 600 ~/.ssh/id_*",
                {"files": sensitive_locations}
            )
        else:
            self.add_finding(
                "file_security", "sensitive_file_permissions", "pass", "low",
                "SSH key permissions are properly configured",
                "Continue protecting sensitive files",
                {}
            )

    def check_outdated_software(self) -> None:
        """Check for outdated software versions."""
        self.think("Analyzing system software versions for known vulnerabilities...")

        os_type = platform.system()
        outdated_items = []

        # Check Python version
        python_version = sys.version_info
        if python_version.major < 3 or (python_version.major == 3 and python_version.minor < 8):
            self.think(f"Python version {python_version.major}.{python_version.minor} is outdated")
            outdated_items.append({
                "software": "Python",
                "current_version": f"{python_version.major}.{python_version.minor}.{python_version.micro}",
                "recommendation": "Upgrade to Python 3.9 or higher"
            })

        # Check OS version (basic)
        if os_type == "Windows":
            release = platform.release()
            if release in ["7", "8", "8.1"]:
                self.think(f"Windows {release} is no longer supported!")
                outdated_items.append({
                    "software": "Windows",
                    "current_version": release,
                    "recommendation": "Upgrade to Windows 10 or 11 immediately"
                })

        if outdated_items:
            self.add_finding(
                "software_vulnerabilities", "outdated_software", "fail", "high",
                f"Found {len(outdated_items)} outdated software components",
                "Update software to latest supported versions",
                {"outdated": outdated_items}
            )
        else:
            self.add_finding(
                "software_vulnerabilities", "outdated_software", "pass", "low",
                "Core system software appears up to date",
                "Continue regular software updates",
                {}
            )

    def run_full_scan(self) -> Dict:
        """Run all security checks."""
        self.think("Starting comprehensive security analysis...")

        print("\n[*] Running System Security Checks...")
        self.check_firewall_status()

        print("[*] Running Network Security Checks...")
        self.check_open_ports()

        print("[*] Running File Security Checks...")
        self.check_sensitive_file_permissions()

        print("[*] Running Software Vulnerability Checks...")
        self.check_outdated_software()

        self.think("Security scan completed - compiling results...")

        return {
            "system_info": self.system_info,
            "findings": self.findings,
            "thinking_steps": self.thinking_steps,
            "summary": self._generate_summary()
        }

    def _generate_summary(self) -> Dict:
        """Generate summary statistics."""
        total = len(self.findings)
        critical = sum(1 for f in self.findings if f['risk_level'] == 'critical')
        high = sum(1 for f in self.findings if f['risk_level'] == 'high')
        medium = sum(1 for f in self.findings if f['risk_level'] == 'medium')
        low = sum(1 for f in self.findings if f['risk_level'] == 'low')

        passed = sum(1 for f in self.findings if f['status'] == 'pass')
        failed = sum(1 for f in self.findings if f['status'] == 'fail')
        warnings = sum(1 for f in self.findings if f['status'] == 'warning')

        return {
            "total_checks": total,
            "risk_distribution": {
                "critical": critical,
                "high": high,
                "medium": medium,
                "low": low
            },
            "status_distribution": {
                "passed": passed,
                "failed": failed,
                "warnings": warnings
            },
            "overall_risk_score": (critical * 10 + high * 7 + medium * 4 + low * 1)
        }
