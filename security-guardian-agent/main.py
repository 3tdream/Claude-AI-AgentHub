#!/usr/bin/env python3
"""
Security Guardian Agent - Main Entry Point
Interactive CLI for cybersecurity analysis and privacy protection.

This is a DEFENSIVE SECURITY TOOL for analyzing and improving
your system's security posture.
"""

import sys
import os
import argparse
from pathlib import Path

# Add src directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from security_analyzer import SecurityAnalyzer
from privacy_checker import PrivacyChecker
from report_generator import ReportGenerator
from notification_system import NotificationSystem

# Import rich for beautiful CLI output
try:
    from rich.console import Console
    from rich.panel import Panel
    from rich.progress import Progress, SpinnerColumn, TextColumn
    from rich.prompt import Prompt, Confirm
    from rich.table import Table
    RICH_AVAILABLE = True
except ImportError:
    RICH_AVAILABLE = False
    print("Note: Install 'rich' for better output: pip install rich")


class SecurityGuardianCLI:
    """Interactive CLI for Security Guardian Agent."""

    def __init__(self):
        """Initialize the CLI."""
        # Disable Rich on Windows to avoid encoding issues
        import sys
        self.use_rich = RICH_AVAILABLE and sys.platform != 'win32'
        self.console = Console() if self.use_rich else None
        self.config_path = os.path.join(os.path.dirname(__file__), 'config.json')
        self.notifier = NotificationSystem()

    def print_banner(self):
        """Print application banner."""
        banner = """
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║         SECURITY GUARDIAN AGENT                               ║
║         Defensive Cybersecurity Analysis Tool                 ║
║                                                               ║
║         Protecting Your Privacy, One Step at a Time           ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
        """

        if self.use_rich:
            self.console.print(banner, style="bold cyan")
        else:
            print(banner)

    def print_thinking(self, message: str):
        """Print thinking step."""
        if self.use_rich:
            self.console.print(f"[bold yellow]THINKING:[/bold yellow] {message}")
        else:
            print(f"[THINKING] {message}")

    def print_success(self, message: str):
        """Print success message."""
        if self.use_rich:
            self.console.print(f"[bold green]SUCCESS:[/bold green] {message}")
        else:
            print(f"[SUCCESS] {message}")

    def print_warning(self, message: str):
        """Print warning message."""
        if self.use_rich:
            self.console.print(f"[bold yellow]WARNING:[/bold yellow] {message}")
        else:
            print(f"[WARNING] {message}")

    def print_error(self, message: str):
        """Print error message."""
        if self.use_rich:
            self.console.print(f"[bold red]ERROR:[/bold red] {message}")
        else:
            print(f"[ERROR] {message}")

    def show_menu(self) -> str:
        """Show interactive menu."""
        if self.use_rich:
            self.console.print("\n[bold cyan]What would you like to do?[/bold cyan]\n")
            self.console.print("  1. Full Security Scan (Security + Privacy)")
            self.console.print("  2. Security Analysis Only")
            self.console.print("  3. Privacy Analysis Only")
            self.console.print("  4. Custom Scan (choose specific checks)")
            self.console.print("  5. Exit\n")

            choice = Prompt.ask("Enter your choice", choices=["1", "2", "3", "4", "5"])
            return choice
        else:
            print("\nWhat would you like to do?")
            print("  1. Full Security Scan")
            print("  2. Security Analysis Only")
            print("  3. Privacy Analysis Only")
            print("  4. Custom Scan")
            print("  5. Exit")
            return input("\nEnter your choice (1-5): ")

    def run_security_scan(self, show_thinking: bool = True):
        """Run security analysis."""
        self.print_thinking("Initializing security analyzer...")

        # Send notification that scan started
        if self.notifier:
            self.notifier.notify_scan_start()

        analyzer = SecurityAnalyzer(self.config_path)

        print("\n[*] Running security checks...")
        results = analyzer.run_full_scan()

        if show_thinking:
            self.print_thinking("Security scan completed! Analyzing results...")

        # Send notifications for critical/high-risk findings
        if self.notifier:
            for finding in results.get('findings', []):
                if finding['risk_level'] == 'critical':
                    self.notifier.notify_critical_finding(finding)
                elif finding['risk_level'] == 'high':
                    self.notifier.notify_high_risk_finding(finding)

        return results

    def run_privacy_scan(self, show_thinking: bool = True):
        """Run privacy analysis."""
        self.print_thinking("Initializing privacy checker...")

        checker = PrivacyChecker()

        print("\n[*] Running privacy checks...")
        results = checker.run_privacy_scan()

        if show_thinking:
            self.print_thinking("Privacy scan completed!")

        return results

    def run_full_scan(self):
        """Run both security and privacy scans."""
        self.print_thinking("Starting comprehensive security and privacy analysis...")

        # Run security scan
        security_results = self.run_security_scan(show_thinking=False)

        # Run privacy scan
        privacy_results = self.run_privacy_scan(show_thinking=False)

        # Merge results
        combined_results = {
            "system_info": security_results.get("system_info", {}),
            "findings": security_results.get("findings", []) + privacy_results.get("findings", []),
            "thinking_steps": security_results.get("thinking_steps", []) + privacy_results.get("thinking_steps", []),
            "summary": self._merge_summaries(
                security_results.get("summary", {}),
                privacy_results.get("summary", {})
            )
        }

        self.print_success("Comprehensive scan completed!")

        # Send summary notification
        if self.notifier:
            self.notifier.notify_scan_complete(combined_results.get("summary", {}))

        return combined_results

    def _merge_summaries(self, sec_summary: dict, priv_summary: dict) -> dict:
        """Merge security and privacy summaries."""
        merged = {
            "total_checks": sec_summary.get("total_checks", 0) + priv_summary.get("total_checks", 0),
            "risk_distribution": sec_summary.get("risk_distribution", {}),
            "status_distribution": {
                "passed": sec_summary.get("status_distribution", {}).get("passed", 0) +
                         priv_summary.get("passed", 0),
                "failed": sec_summary.get("status_distribution", {}).get("failed", 0),
                "warnings": sec_summary.get("status_distribution", {}).get("warnings", 0) +
                           priv_summary.get("warnings", 0)
            },
            "overall_risk_score": sec_summary.get("overall_risk_score", 0)
        }
        return merged

    def display_results(self, results: dict):
        """Display scan results."""
        generator = ReportGenerator(results)

        # Generate and display console report
        console_report = generator.generate_console_report()

        print(console_report)

        # Ask if user wants to save report
        save_input = input("\nSave report? (y/n): ").lower()
        save = save_input in ['y', 'yes']

        if save:
            self.save_report_dialog(generator)

    def save_report_dialog(self, generator: ReportGenerator):
        """Dialog for saving reports."""
        print("\nSelect report format:")
        print("  1. JSON")
        print("  2. Markdown")
        print("  3. HTML")
        print("  4. All formats")
        format_choice = input("Choose (1-4): ")

        format_map = {
            "1": ["json"],
            "2": ["md"],
            "3": ["html"],
            "4": ["json", "md", "html"]
        }

        formats = format_map.get(format_choice, ["json"])

        for fmt in formats:
            try:
                output_path = generator.save_report(fmt)
                self.print_success(f"Report saved: {output_path}")
            except Exception as e:
                self.print_error(f"Failed to save {fmt} report: {str(e)}")

    def run_interactive(self):
        """Run interactive mode."""
        self.print_banner()

        print("\nWelcome to Security Guardian Agent!")
        print("This tool will analyze your system's security and privacy settings.\n")

        while True:
            choice = self.show_menu()

            if choice == "1":
                results = self.run_full_scan()
                self.display_results(results)

            elif choice == "2":
                results = self.run_security_scan()
                self.display_results(results)

            elif choice == "3":
                results = self.run_privacy_scan()
                self.display_results(results)

            elif choice == "4":
                self.print_warning("Custom scan not yet implemented")

            elif choice == "5":
                self.print_success("Thank you for using Security Guardian Agent!")
                break

            else:
                self.print_error("Invalid choice. Please try again.")

    def run_cli(self, args):
        """Run CLI with arguments."""
        if args.scan_type == "full":
            results = self.run_full_scan()
        elif args.scan_type == "security":
            results = self.run_security_scan()
        elif args.scan_type == "privacy":
            results = self.run_privacy_scan()
        else:
            results = self.run_full_scan()

        # Display results
        generator = ReportGenerator(results)

        if args.output:
            # Save to file
            output_path = generator.save_report(args.format, args.output)
            self.print_success(f"Report saved to: {output_path}")
        else:
            # Print to console
            print(generator.generate_console_report())


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Security Guardian Agent - Defensive Cybersecurity Analysis"
    )

    parser.add_argument(
        "-t", "--scan-type",
        choices=["full", "security", "privacy"],
        default="full",
        help="Type of scan to perform"
    )

    parser.add_argument(
        "-o", "--output",
        help="Output file path for report"
    )

    parser.add_argument(
        "-f", "--format",
        choices=["json", "md", "html"],
        default="json",
        help="Report format (when using --output)"
    )

    parser.add_argument(
        "-i", "--interactive",
        action="store_true",
        help="Run in interactive mode"
    )

    parser.add_argument(
        "--notify",
        action="store_true",
        default=True,
        help="Enable desktop notifications (default: enabled)"
    )

    parser.add_argument(
        "--no-notify",
        action="store_true",
        help="Disable desktop notifications"
    )

    args = parser.parse_args()

    cli = SecurityGuardianCLI()

    # Disable notifications if requested
    if args.no_notify:
        cli.notifier = None

    if args.interactive or len(sys.argv) == 1:
        # Interactive mode
        cli.run_interactive()
    else:
        # CLI mode with arguments
        cli.run_cli(args)


if __name__ == "__main__":
    main()
