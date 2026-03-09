# Phase 5: Coverage Gates Enforcement

## Overview

Phase 5 implements automated code coverage enforcement in the CI/CD pipeline. All PRs must meet minimum coverage thresholds before merging.

## Coverage Thresholds

| Metric | Target | Status |
|--------|--------|--------|
| Lines | 80% | ✅ Enforced |
| Branches | 75% | ✅ Enforced |
| Functions | 80% | ✅ Enforced |
| Statements | 80% | ✅ Enforced |

## Implementation Details

### 1. Vitest Configuration

All packages have coverage configuration in `vitest.config.ts`:

```typescript
coverage: {
  provider: 'v8',
  reporter: ['text', 'json', 'html', 'lcov'],
  lines: 80,
  branches: 75,
  functions: 80,
  statements: 80,
  exclude: ['node_modules/', 'dist/', 'build/', '**/*.test.ts', '**/*.spec.ts'],
}
```

**Packages covered:**
- `packages/00_dashboard`
- `packages/01_auth-profile`
- `packages/02_projects`
- `packages/design-system`
- `shared`

### 2. CI/CD Workflow Integration

The PR workflow (`1-pull-request.yml`) enforces coverage with:

1. **Test execution with coverage**: `npm run test -- --run --coverage`
2. **Coverage threshold validation**: Parse `coverage/coverage-final.json` and verify:
   - Lines: ≥ 80%
   - Branches: ≥ 75%
   - Functions: ≥ 80%
   - Statements: ≥ 80%
3. **Coverage artifacts**: Reports uploaded for 30 days retention

### 3. Test Coverage Summary

Coverage reports are generated in:
- `coverage/lcov.info` - LCOV format (for SonarQube)
- `coverage/index.html` - HTML report (browser view)
- `coverage/coverage-final.json` - JSON format (for parsing)

## How Coverage Gates Work

### On PR Creation

```
1. Code pushed → PR created
2. GitHub Actions triggered
3. Tests run with coverage collection
4. Coverage thresholds validated
5. If coverage < thresholds → PR blocked ❌
6. If coverage ≥ thresholds → PR allowed ✅
```

### Checking Coverage Locally

Run tests with coverage before pushing:

```bash
npm run test -- --coverage
```

This generates coverage reports and shows summary in terminal.

### View Coverage Report

After running tests:

```bash
open coverage/index.html  # macOS
xdg-open coverage/index.html  # Linux
start coverage/index.html  # Windows
```

## Exclusions

The following files are excluded from coverage calculations:

- `node_modules/`
- `dist/`
- `build/`
- `**/*.test.ts`
- `**/*.spec.ts`
- `**/index.ts` (barrel files)

## Pragmatic Approach

- **80% threshold**: Enforced for critical metrics (lines, functions, statements)
- **75% threshold**: Slightly relaxed for branches (complex conditional logic)
- **Exclusions**: Test and build files not counted (only production code)

## Integration with SonarQube

Coverage reports are also consumed by SonarQube:

- **LCOV report**: `coverage/lcov.info`
- **SonarQube metric**: Lines of Code with coverage
- **Quality gate**: Combines coverage with other metrics

## Troubleshooting

### Coverage reports not generated

```bash
# Ensure coverage is enabled in vitest.config.ts
npm run test -- --coverage --reporter=verbose
```

### Coverage below threshold

1. Analyze the HTML report: `open coverage/index.html`
2. Identify uncovered lines
3. Add tests to cover the code
4. Re-run tests locally to verify

### False positives

If coverage is genuinely low but acceptable:
- Document the reasoning in PR description
- Request review from maintainers
- Consider if code is actually testable

## Next Phases

- **Phase 6**: SonarQube Enforcement (quality gates)
- **Phase 7**: Documentation Standards

## Related Documentation

- [QUALITY_GATES.md](./QUALITY_GATES.md) - All quality gates overview
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Development workflow
- [Testing Guide](./E2E_TESTING.md) - E2E testing
