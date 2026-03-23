---
name: threat-model
description: STRIDE threat model for a new feature before implementation — attack surfaces, threat actors, mitigations
argument-hint: <feature name>
---

Threat model for: $ARGUMENTS

## 1. SYSTEM CONTEXT
- What does this feature do?
- What data does it handle?
- Who are the users?
- What external services does it connect to?

## 2. ATTACK SURFACE
| Entry Point | Protocol | Auth | Data Exposed |
|-------------|----------|------|-------------|

## 3. THREAT ACTORS
| Actor | Motivation | Capability | Likelihood |
|-------|-----------|------------|------------|
| External attacker | | | |
| Malicious insider | | | |
| Automated bot | | | |

## 4. STRIDE ANALYSIS
| Threat | Category | Impact | Mitigation |
|--------|----------|--------|------------|
| | Spoofing | | |
| | Tampering | | |
| | Repudiation | | |
| | Info Disclosure | | |
| | Denial of Service | | |
| | Elevation of Privilege | | |

## 5. PRIORITIZED MITIGATIONS
| # | Mitigation | Effort | Risk Reduced |
Ordered by risk-reduced/effort ratio.

Read actual code to find real attack surfaces — don't hypothesize.
