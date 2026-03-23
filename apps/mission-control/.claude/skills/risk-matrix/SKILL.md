---
name: risk-matrix
description: Project risk assessment matrix — probability, impact, mitigation for each risk
argument-hint: <project or feature name>
---

Risk matrix for: $ARGUMENTS

| # | Risk | Probability | Impact | Score | Mitigation | Owner |
|---|------|-------------|--------|-------|------------|-------|
| R1 | | L/M/H | L/M/H | 1-9 | | |

Score = Probability x Impact (L=1, M=2, H=3)

Categories to assess:
- **Technical** — scalability, integration, data loss
- **Security** — auth bypass, data breach, injection
- **Business** — scope creep, missed deadline, wrong market
- **Operational** — deployment failure, monitoring gaps
- **Dependencies** — third-party API changes, vendor lock-in

For risks scoring 6+: detailed mitigation plan with specific actions.
