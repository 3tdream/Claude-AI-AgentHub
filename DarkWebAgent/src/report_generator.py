"""
Security Guardian Agent - Report Generator Module
Generates comprehensive security reports in multiple formats.
"""

import json
from datetime import datetime
from typing import Dict, List
from pathlib import Path


class ReportGenerator:
    """Generate security reports in various formats."""

    def __init__(self, results: Dict):
        """Initialize report generator with scan results."""
        self.results = results
        self.timestamp = datetime.now()

    def generate_console_report(self) -> str:
        """Generate colorized console report."""
        report = []
        report.append("\n" + "=" * 80)
        report.append("  SECURITY GUARDIAN AGENT - SECURITY SCAN REPORT")
        report.append("=" * 80)

        # System Information
        if 'system_info' in self.results:
            sys_info = self.results['system_info']
            report.append("\n[SYSTEM INFORMATION]")
            report.append(f"  OS: {sys_info.get('os', 'Unknown')} {sys_info.get('os_release', '')}")
            report.append(f"  Hostname: {sys_info.get('hostname', 'Unknown')}")
            report.append(f"  Scan Time: {sys_info.get('scan_time', 'Unknown')}")

        # Summary
        if 'summary' in self.results:
            summary = self.results['summary']
            report.append("\n[SUMMARY]")
            report.append(f"  Total Checks: {summary.get('total_checks', 0)}")

            risk_dist = summary.get('risk_distribution', {})
            report.append(f"  Critical Issues: {risk_dist.get('critical', 0)}")
            report.append(f"  High Risk: {risk_dist.get('high', 0)}")
            report.append(f"  Medium Risk: {risk_dist.get('medium', 0)}")
            report.append(f"  Low Risk: {risk_dist.get('low', 0)}")

            status_dist = summary.get('status_distribution', {})
            report.append(f"\n  Passed: {status_dist.get('passed', 0)}")
            report.append(f"  Failed: {status_dist.get('failed', 0)}")
            report.append(f"  Warnings: {status_dist.get('warnings', 0)}")

            risk_score = summary.get('overall_risk_score', 0)
            report.append(f"\n  Overall Risk Score: {risk_score}")
            if risk_score > 30:
                report.append("  Risk Level: HIGH - Immediate action required!")
            elif risk_score > 15:
                report.append("  Risk Level: MEDIUM - Address issues soon")
            else:
                report.append("  Risk Level: LOW - Good security posture")

        # Detailed Findings
        if 'findings' in self.results:
            report.append("\n" + "=" * 80)
            report.append("[DETAILED FINDINGS]")
            report.append("=" * 80)

            findings = self.results['findings']

            # Group by risk level
            critical = [f for f in findings if f['risk_level'] == 'critical']
            high = [f for f in findings if f['risk_level'] == 'high']
            medium = [f for f in findings if f['risk_level'] == 'medium']
            low = [f for f in findings if f['risk_level'] == 'low']

            if critical:
                report.append("\n[CRITICAL ISSUES] - Immediate Action Required!")
                for i, finding in enumerate(critical, 1):
                    report.append(f"\n  {i}. {finding['description']}")
                    report.append(f"     Category: {finding['category']}")
                    report.append(f"     Status: {finding['status'].upper()}")
                    report.append(f"     Recommendation: {finding['recommendation']}")

            if high:
                report.append("\n[HIGH RISK ISSUES]")
                for i, finding in enumerate(high, 1):
                    report.append(f"\n  {i}. {finding['description']}")
                    report.append(f"     Category: {finding['category']}")
                    report.append(f"     Status: {finding['status'].upper()}")
                    report.append(f"     Recommendation: {finding['recommendation']}")

            if medium:
                report.append("\n[MEDIUM RISK ISSUES]")
                for i, finding in enumerate(medium, 1):
                    report.append(f"\n  {i}. {finding['description']}")
                    report.append(f"     Recommendation: {finding['recommendation']}")

            if low:
                report.append(f"\n[LOW RISK / INFORMATIONAL] ({len(low)} items)")
                for i, finding in enumerate(low[:5], 1):  # Show first 5
                    report.append(f"  {i}. {finding['description']}")

        # Thinking Steps
        if 'thinking_steps' in self.results and self.results['thinking_steps']:
            report.append("\n" + "=" * 80)
            report.append("[AGENT THINKING PROCESS]")
            report.append("=" * 80)

            steps = self.results['thinking_steps']
            for step in steps[:10]:  # Show first 10 steps
                report.append(f"  Step {step['step']}: {step['thought']}")

        report.append("\n" + "=" * 80)
        report.append("End of Report")
        report.append("=" * 80 + "\n")

        return "\n".join(report)

    def generate_json_report(self) -> str:
        """Generate JSON report."""
        report_data = {
            "report_metadata": {
                "generated_at": self.timestamp.isoformat(),
                "report_type": "security_scan",
                "version": "1.0"
            },
            "scan_results": self.results
        }
        return json.dumps(report_data, indent=2)

    def generate_markdown_report(self) -> str:
        """Generate Markdown report."""
        report = []
        report.append("# Security Guardian Agent - Scan Report\n")
        report.append(f"**Generated:** {self.timestamp.strftime('%Y-%m-%d %H:%M:%S')}\n")

        # System Information
        if 'system_info' in self.results:
            sys_info = self.results['system_info']
            report.append("## System Information\n")
            report.append(f"- **OS:** {sys_info.get('os', 'Unknown')} {sys_info.get('os_release', '')}")
            report.append(f"- **Hostname:** {sys_info.get('hostname', 'Unknown')}")
            report.append(f"- **Architecture:** {sys_info.get('architecture', 'Unknown')}")
            report.append(f"- **Scan Time:** {sys_info.get('scan_time', 'Unknown')}\n")

        # Summary
        if 'summary' in self.results:
            summary = self.results['summary']
            report.append("## Executive Summary\n")

            risk_dist = summary.get('risk_distribution', {})
            status_dist = summary.get('status_distribution', {})

            report.append(f"- **Total Checks:** {summary.get('total_checks', 0)}")
            report.append(f"- **Critical Issues:** {risk_dist.get('critical', 0)}")
            report.append(f"- **High Risk:** {risk_dist.get('high', 0)}")
            report.append(f"- **Medium Risk:** {risk_dist.get('medium', 0)}")
            report.append(f"- **Low Risk:** {risk_dist.get('low', 0)}")
            report.append(f"- **Passed Checks:** {status_dist.get('passed', 0)}")
            report.append(f"- **Failed Checks:** {status_dist.get('failed', 0)}\n")

            risk_score = summary.get('overall_risk_score', 0)
            report.append(f"### Overall Risk Score: {risk_score}\n")

        # Detailed Findings
        if 'findings' in self.results:
            report.append("## Detailed Findings\n")

            findings = self.results['findings']

            # Group by risk level
            for risk_level, title in [
                ('critical', '### Critical Issues'),
                ('high', '### High Risk Issues'),
                ('medium', '### Medium Risk Issues'),
                ('low', '### Low Risk / Informational')
            ]:
                level_findings = [f for f in findings if f['risk_level'] == risk_level]

                if level_findings:
                    report.append(f"\n{title}\n")

                    for i, finding in enumerate(level_findings, 1):
                        report.append(f"#### {i}. {finding['description']}\n")
                        report.append(f"- **Category:** {finding['category']}")
                        report.append(f"- **Status:** {finding['status'].upper()}")
                        report.append(f"- **Risk Level:** {finding['risk_level'].upper()}")
                        report.append(f"\n**Recommendation:**")

                        # Split multi-line recommendations
                        for line in finding['recommendation'].split('\n'):
                            if line.strip():
                                report.append(f"{line}")

                        report.append("")  # Empty line

        # Action Items
        if 'findings' in self.results:
            failed = [f for f in self.results['findings'] if f['status'] == 'fail']
            if failed:
                report.append("## Priority Action Items\n")
                for i, finding in enumerate(failed, 1):
                    report.append(f"{i}. **{finding['description']}**")
                    report.append(f"   - {finding['recommendation'].split(chr(10))[0]}\n")

        report.append("\n---\n")
        report.append("*Report generated by Security Guardian Agent*")

        return "\n".join(report)

    def generate_html_report(self) -> str:
        """Generate HTML report."""
        html = []
        html.append("<!DOCTYPE html>")
        html.append("<html lang='en'>")
        html.append("<head>")
        html.append("  <meta charset='UTF-8'>")
        html.append("  <meta name='viewport' content='width=device-width, initial-scale=1.0'>")
        html.append("  <title>Security Guardian Report</title>")
        html.append("  <style>")
        html.append("    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }")
        html.append("    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }")
        html.append("    h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }")
        html.append("    h2 { color: #34495e; margin-top: 30px; }")
        html.append("    .summary { background: #ecf0f1; padding: 20px; border-radius: 5px; margin: 20px 0; }")
        html.append("    .critical { background: #ffebee; border-left: 4px solid #c62828; padding: 15px; margin: 10px 0; }")
        html.append("    .high { background: #fff3e0; border-left: 4px solid #ef6c00; padding: 15px; margin: 10px 0; }")
        html.append("    .medium { background: #fffde7; border-left: 4px solid #f9a825; padding: 15px; margin: 10px 0; }")
        html.append("    .low { background: #e3f2fd; border-left: 4px solid #1976d2; padding: 15px; margin: 10px 0; }")
        html.append("    .finding-title { font-weight: bold; color: #2c3e50; margin-bottom: 8px; }")
        html.append("    .recommendation { margin-top: 10px; color: #555; white-space: pre-line; }")
        html.append("    .meta { color: #7f8c8d; font-size: 0.9em; }")
        html.append("  </style>")
        html.append("</head>")
        html.append("<body>")
        html.append("  <div class='container'>")
        html.append("    <h1>Security Guardian Agent - Scan Report</h1>")
        html.append(f"    <p class='meta'>Generated: {self.timestamp.strftime('%Y-%m-%d %H:%M:%S')}</p>")

        # Summary
        if 'summary' in self.results:
            summary = self.results['summary']
            risk_dist = summary.get('risk_distribution', {})

            html.append("    <div class='summary'>")
            html.append("      <h2>Summary</h2>")
            html.append(f"      <p>Total Checks: <strong>{summary.get('total_checks', 0)}</strong></p>")
            html.append(f"      <p>Critical: <strong>{risk_dist.get('critical', 0)}</strong> | ")
            html.append(f"High: <strong>{risk_dist.get('high', 0)}</strong> | ")
            html.append(f"Medium: <strong>{risk_dist.get('medium', 0)}</strong> | ")
            html.append(f"Low: <strong>{risk_dist.get('low', 0)}</strong></p>")
            html.append(f"      <p>Overall Risk Score: <strong>{summary.get('overall_risk_score', 0)}</strong></p>")
            html.append("    </div>")

        # Findings
        if 'findings' in self.results:
            findings = self.results['findings']

            for risk_level, title, css_class in [
                ('critical', 'Critical Issues', 'critical'),
                ('high', 'High Risk Issues', 'high'),
                ('medium', 'Medium Risk Issues', 'medium'),
                ('low', 'Low Risk / Informational', 'low')
            ]:
                level_findings = [f for f in findings if f['risk_level'] == risk_level]

                if level_findings:
                    html.append(f"    <h2>{title}</h2>")

                    for finding in level_findings:
                        html.append(f"    <div class='{css_class}'>")
                        html.append(f"      <div class='finding-title'>{finding['description']}</div>")
                        html.append(f"      <p><strong>Category:</strong> {finding['category']}</p>")
                        html.append(f"      <div class='recommendation'><strong>Recommendation:</strong><br>{finding['recommendation']}</div>")
                        html.append("    </div>")

        html.append("    <hr>")
        html.append("    <p class='meta'>Report generated by Security Guardian Agent</p>")
        html.append("  </div>")
        html.append("</body>")
        html.append("</html>")

        return "\n".join(html)

    def save_report(self, format_type: str, output_path: str = None) -> str:
        """Save report to file."""
        if output_path is None:
            timestamp_str = self.timestamp.strftime("%Y%m%d_%H%M%S")
            output_path = f"security_report_{timestamp_str}.{format_type}"

        if format_type == "json":
            content = self.generate_json_report()
        elif format_type == "md" or format_type == "markdown":
            content = self.generate_markdown_report()
        elif format_type == "html":
            content = self.generate_html_report()
        else:
            content = self.generate_console_report()

        Path(output_path).write_text(content, encoding='utf-8')
        return output_path
