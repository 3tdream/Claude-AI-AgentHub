---
name: test-plan
description: Create a comprehensive test plan for a feature — unit, integration, e2e, edge cases
argument-hint: <feature name>
---

Test plan for: $ARGUMENTS

## SCOPE
- What's being tested
- What's NOT being tested (out of scope)

## TEST LEVELS

### Unit Tests
| # | Test Case | Input | Expected Output | Priority |
|---|-----------|-------|-----------------|----------|

### Integration Tests
| # | Test Case | Components | Expected Behavior | Priority |

### E2E Tests
| # | Scenario | Steps | Expected Result | Priority |

## EDGE CASES
- Empty/null inputs
- Maximum values
- Concurrent access
- Network failures
- Permission boundaries

## TEST DATA
- Required seed data
- Test accounts/roles needed

## ACCEPTANCE CRITERIA MAPPING
| AC | Test Case # | Coverage |
|----|-----------:|----------|

## ESTIMATED EFFORT
- Unit tests: X hours
- Integration: X hours
- E2E: X hours
