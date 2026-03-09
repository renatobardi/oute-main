# Phase 6: SonarQube Enforcement - Quality Gates (A- Minimum)

## Overview

Phase 6 implements mandatory SonarQube quality gates in the CI/CD pipeline. All PRs must achieve a **minimum A- grade** before merging.

## Quality Gate Metrics

| Metric | Target | Requirement |
|--------|--------|-------------|
| **Overall Grade** | **A-** | MANDATORY |
| Reliability Rating | A | 0 bugs |
| Security Rating | A | 0 vulnerabilities |
| Maintainability Rating | B+ | Code smells < threshold |
| Code Coverage | 80% | From Phase 5 |
| Duplicated Lines | < 3% | Code deduplication |

## Implementation Details

### 1. Configuration Files

#### `sonar-project.properties`
Root-level configuration for SonarQube analysis:
- Project identification and versioning
- Source/test/exclusion patterns
- Coverage report paths
- Language-specific settings

#### `.sonarcloud.yml`
SonarCloud configuration with quality gate rules:
- Metrics thresholds
- Grade requirements (A- minimum)
- Duplicated code limits
- Coverage requirements

### 2. Quality Gate Requirements

**All metrics must pass:**

```
✅ Reliability: 0 bugs allowed (A rating)
✅ Security: 0 vulnerabilities allowed (A rating)
✅ Maintainability: Code smells within limit (B+ rating = A- overall)
✅ Coverage: 80% minimum (from Phase 5)
✅ Duplication: Less than 3% of code
```

### 3. CI/CD Integration

The PR workflow enforces SonarQube as MANDATORY:

1. **Tests execute** with coverage collection (Phase 5)
2. **SonarQube scan** analyzes code quality
3. **Quality gate check**: Grade must be A- or better
4. **If FAILED**: PR blocked ❌ - Merge button disabled
5. **If PASSED**: PR allowed ✅ - Merge button enabled

Key flag: `-Dsonar.qualitygate.wait=true` ensures workflow waits for quality gate result.

## SonarQube Dashboard

Access the dashboard (requires SonarCloud account):

```
https://sonarcloud.io/project/overview?id=oute-main
```

**Dashboard shows:**
- Overall grade (target: A-)
- Grade history (trending)
- Quality gate status (pass/fail)
- Metric breakdown:
  - Bugs (target: 0)
  - Vulnerabilities (target: 0)
  - Code smells (A- max)
  - Coverage (80% target)
  - Duplications (< 3%)

## How Quality Gates Block PRs

### Scenario 1: Grade A- ✅ (PASS)
```
Code pushed → Tests run → Coverage 85% ✅
→ SonarQube scan → Grade: A- ✅
→ All metrics pass ✅
→ PR merge allowed ✅
```

### Scenario 2: Grade B (FAIL)
```
Code pushed → Tests run → Coverage 85% ✅
→ SonarQube scan → Grade: B ❌
→ Too many code smells ❌
→ PR merge BLOCKED ❌
```

## Metrics Explained

### Reliability Rating
- **Measure**: Bugs detected by SonarQube
- **A rating**: 0 bugs (REQUIRED)
- **How to fix**: Address all reported bugs

### Security Rating
- **Measure**: Security vulnerabilities
- **A rating**: 0 vulnerabilities (REQUIRED)
- **How to fix**: Fix all security issues (SAST)

### Maintainability Rating
- **Measure**: Code smells (complexity, duplication, etc.)
- **B+ rating**: Code smells within acceptable threshold
- **Combined with other ratings → A- overall**
- **How to fix**: Refactor complex code, reduce duplication

### Code Coverage
- **Measure**: % of code covered by tests
- **80% target**: Enforced by Phase 5
- **SonarQube integration**: Consumes LCOV reports
- **How to fix**: Add more unit/E2E tests

### Duplicated Lines
- **Measure**: % of duplicated code
- **< 3% target**: Pragmatic threshold
- **How to fix**: Extract common functions, use utilities

## Troubleshooting

### PR shows "SonarQube Quality Gate Failed"

1. **Check the dashboard**: https://sonarcloud.io/project/overview?id=oute-main
2. **Identify failing metric**: Bugs? Vulnerabilities? Code smells? Coverage?
3. **Fix the issues**:
   - Bugs: Review SonarQube findings and fix them
   - Vulnerabilities: Address security issues
   - Code smells: Refactor complex code
   - Coverage: Add tests
4. **Push fix** → SonarQube re-scans → Grade improves

### Grade is A but still shows "Failed"

This might be due to:
- Coverage below 80% (Phase 5)
- Duplicated code > 3%
- New bugs/vulnerabilities

Check SonarQube dashboard for exact metrics.

### How to check grade locally?

You cannot run SonarQube locally without the SonarCloud token. The grade is only available in:
- Pull Request comments (SonarQube bot)
- SonarQube dashboard
- GitHub Actions workflow logs

## Integration with Other Phases

**Phase 5 (Coverage)**:
- Provides `coverage/lcov.info`
- SonarQube consumes it
- Both must pass for PR approval

**Phase 4 (E2E Tests)**:
- Ensures application works end-to-end
- Works alongside unit test coverage

**Overall Quality Stack**:
```
ESLint (Phase 1) → Unit Tests (Phase 2) → E2E Tests (Phase 4)
        ↓              ↓                         ↓
    0 warnings    Coverage 80%           46 tests pass
        ↓              ↓                         ↓
        └─────────────→ SonarQube (Phase 6) ←────┘
                       Grade: A- minimum
                       (mandatory, blocks PR)
```

## SonarQube vs SonarCloud

- **SonarCloud**: Free cloud service (used here)
- **SonarQube**: Self-hosted version (requires server)

For this project, using **SonarCloud** with:
- GitHub integration (free for public repos)
- Automatic PR comments with results
- Dashboard access

## Best Practices

1. **Fix issues early**: Run sonar locally won't work, so check GitHub Actions logs
2. **Address security first**: 0 vulnerabilities is non-negotiable
3. **Reduce complexity**: Keep functions under 15 lines when possible
4. **Improve coverage incrementally**: 80% is the minimum, aim for 85%+
5. **Document exclusions**: If code must be excluded, add comment

## Next Phases

- **Phase 7**: Documentation Standards (QUALITY_STANDARDS.md)

## Related Documentation

- [PHASE5_COVERAGE_GATES.md](./PHASE5_COVERAGE_GATES.md) - Coverage thresholds
- [QUALITY_GATES.md](./QUALITY_GATES.md) - All gates overview
- [SECURITY_GATES.md](./SECURITY_GATES.md) - Security checks
- [E2E_TESTING.md](./E2E_TESTING.md) - End-to-end tests
