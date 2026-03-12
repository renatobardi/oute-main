# Quality Standards - Oute Main

Comprehensive quality standards and guidelines for the oute-main project.

## Table of Contents

1. [Code Quality Standards](#code-quality-standards)
2. [Testing Standards](#testing-standards)
3. [Security Standards](#security-standards)
4. [Documentation Standards](#documentation-standards)
5. [Deployment Standards](#deployment-standards)
6. [Quality Gates Summary](#quality-gates-summary)

---

## Code Quality Standards

### ESLint & Code Style

**Standard**: Zero warnings, zero errors

**Configuration**: `.eslintrc.json` with TypeScript support

**Key Rules**:
- No `any` types → Use `unknown` or specific types
- Strict boolean expressions → Explicit type checks
- No unused variables
- Consistent naming conventions (camelCase for functions, PascalCase for classes)

**Enforcement**:
- ✅ All PRs must pass ESLint
- ✅ Pre-commit hooks recommended
- ✅ Blocking: 0 errors, warnings tracked

**Example**:
```typescript
// ❌ WRONG - uses 'any'
const handler = (req: any) => { }

// ✅ CORRECT - uses 'unknown'
const handler = (req: unknown) => { }
```

### TypeScript

**Standard**: Strict type checking, no implicit `any`

**Configuration**: `tsconfig.json` in each package

**Key Settings**:
- `strict: true` - Enable all strict type checking options
- `noImplicitAny: true` - Disallow implicit any types
- `strictNullChecks: true` - Strict null checks

**Enforcement**:
- ✅ All code must compile without errors
- ✅ Type checking in CI/CD pipeline
- ✅ Pull requests block if type errors exist

### Code Formatting

**Standard**: Prettier for consistent formatting

**Configuration**: `.prettierrc` and `.prettierignore`

**Rules**:
- Line length: 100 characters max
- Indentation: 2 spaces
- Quotes: Single quotes (except JSX)
- Semicolons: Required

**Enforcement**:
- ✅ `npm run format -- --check` in CI/CD
- ✅ Pre-commit hook: `npm run format`

---

## Testing Standards

### Unit Tests

**Standard**: Minimum 80% code coverage

**Framework**: Vitest + Node environment

**Requirements**:
- Lines: ≥ 80%
- Branches: ≥ 75% (pragmatic for complex conditionals)
- Functions: ≥ 80%
- Statements: ≥ 80%

**File Naming**:
- `*.test.ts` for unit tests (included in coverage)
- `*.spec.ts` for E2E tests (excluded from coverage)

**Execution**:
```bash
npm run test                    # Run all tests
npm run test -- --coverage     # With coverage report
```

**Enforcement**:
- ✅ Coverage threshold: 80% minimum
- ✅ Blocks PR if coverage below 80%
- ✅ Reports uploaded as artifacts

**Example**:
```typescript
// Good test - covers normal and edge cases
describe('User validation', () => {
  it('should validate email format', () => {
    expect(validateEmail('test@example.com')).toBe(true);
  });

  it('should reject invalid email', () => {
    expect(validateEmail('invalid')).toBe(false);
  });

  it('should handle empty email', () => {
    expect(validateEmail('')).toBe(false);
  });
});
```

### E2E Tests

**Standard**: 46 test cases covering critical user flows

**Framework**: Playwright

**File Location**: `src/__tests__/e2e/*.spec.ts`

**Coverage Areas**:
- Authentication flow (login, register, logout)
- CRUD operations
- Authorization checks
- Validation and error handling
- Navigation and routing

**Execution**:
```bash
npm run test:e2e              # Run E2E tests
npm run test:e2e -- --headed # Run with browser visible
```

**Enforcement**:
- ✅ All critical flows must have E2E tests
- ✅ Tests run in CI/CD pipeline (separate from unit tests)
- ✅ E2E tests are mandatory before feature release

---

## Security Standards

### Vulnerability Scanning

**Tools Used**:
1. **npm audit** - Dependency vulnerabilities
2. **SAST** - Static Application Security Testing
3. **Trivy** - Container image scanning
4. **License scanning** - Compliance checks
5. **Secrets detection** - API keys, credentials

**Standards**:
- ✅ 0 critical vulnerabilities allowed
- ✅ High vulnerabilities: immediate remediation
- ✅ Medium vulnerabilities: addressed in sprint
- ✅ License compliance: MIT, Apache 2.0, BSD preferred

**Enforcement**:
- ✅ `npm audit` fails PR if critical found
- ✅ Security gates documented in SECURITY_GATES.md
- ✅ Regular dependency updates (weekly)

### Code Review Security

**Requirements**:
- Code review before merge (at least 1 approval)
- Security implications documented
- Dependencies justified if added

---

## Documentation Standards

### Code Documentation

**Standard**: JSDoc comments for public APIs

**Requirements**:
- Every exported function/class documented
- Parameters and return types specified
- Examples provided for complex logic
- Deprecation warnings noted

**Example**:
```typescript
/**
 * Validates email address format
 * @param email - Email address to validate
 * @returns true if valid, false otherwise
 * @example
 * validateEmail('test@example.com') // true
 * validateEmail('invalid') // false
 */
export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
```

### README Files

**Standard**: Every package has README.md

**Contains**:
- Package description
- Installation instructions
- Usage examples
- Configuration options
- API reference (if applicable)

### Commit Messages

**Standard**: Conventional Commits

**Format**: `type(scope): description`

**Types**:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `test:` - Test additions/fixes
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `chore:` - Maintenance tasks

**Example**:
```
feat(auth): implement password reset flow

- Add password reset endpoint
- Add email validation
- Add token expiration (1 hour)

Closes #123
```

### Quality Documentation

**Files**:
- `QUALITY_GATES.md` - All gates overview
- `PHASE1_*.md` through `PHASE7_*.md` - Phase-specific docs
- `DEVELOPMENT.md` - Development workflow
- `SECURITY_GATES.md` - Security details

---

## Deployment Standards

### Build Standards

**Requirement**: Code must build without errors

**Build Command**: `npm run build`

**Deliverables**:
- Compiled JavaScript (dist/)
- Type definitions (.d.ts files)
- Source maps for debugging
- Docker images for deployment

### Environment Variables

**Standard**: Environment variables documented in `.env.example`

**Requirements**:
- All required env vars documented
- Defaults provided where safe
- Secrets never committed
- .env file in .gitignore

### Docker

**Standard**: Multi-stage Dockerfile for minimal images

**Registry**: GitHub Container Registry (ghcr.io)

**Platforms**: linux/amd64, linux/arm64

**Scanning**: Trivy vulnerability scan before push

---

## Quality Gates Summary

### PR Checklist (Before Submission)

```
☐ Code passes ESLint (npm run lint)
☐ Code passes TypeScript (npm run lint)
☐ Code passes Prettier formatting (npm run format)
☐ Tests pass locally (npm run test)
☐ Coverage ≥ 80% (npm run test -- --coverage)
☐ No console.log statements left
☐ No TODO comments without context
☐ Commit message follows Conventional Commits
☐ README updated (if applicable)
```

### Automatic Checks (CI/CD Pipeline)

| Check | Tool | Requirement | Status |
|-------|------|-------------|--------|
| Linting | ESLint | 0 errors | ✅ Blocking |
| Type Checking | TypeScript | No errors | ✅ Blocking |
| Formatting | Prettier | Consistent style | ✅ Blocking |
| Unit Tests | Vitest | All pass | ✅ Blocking |
| Coverage | Vitest coverage | ≥ 80% | ✅ Blocking |
| E2E Tests | Playwright | All pass | ✅ Blocking |
| Security | Multiple tools | No critical CVEs | ✅ Blocking |
| SonarQube | SonarCloud | Grade ≥ A- | ✅ Blocking |
| Docker Build | Docker | Builds successfully | ✅ Blocking |

### Quality Gate Progression

```
Code pushed to PR
    ↓
ESLint Check (Phase 1)
    ├─ PASS: 0 errors ✅
    └─ FAIL: Blocks PR ❌
    ↓
TypeScript Check
    ├─ PASS: No errors ✅
    └─ FAIL: Blocks PR ❌
    ↓
Unit Tests (Phase 2)
    ├─ PASS: All pass ✅
    └─ FAIL: Blocks PR ❌
    ↓
Coverage Gates (Phase 5)
    ├─ PASS: ≥ 80% ✅
    └─ FAIL: Blocks PR ❌
    ↓
E2E Tests (Phase 4)
    ├─ PASS: All pass ✅
    └─ FAIL: Blocks PR ❌
    ↓
Security Gates (Phase 3)
    ├─ PASS: No critical CVEs ✅
    └─ FAIL: Blocks PR ❌
    ↓
SonarQube (Phase 6)
    ├─ PASS: Grade ≥ A- ✅
    └─ FAIL: Blocks PR ❌
    ↓
Docker Build Check
    ├─ PASS: Builds successfully ✅
    └─ FAIL: Blocks PR ❌
    ↓
PR Status Summary
    ├─ All checks passed: PR ready to merge ✅
    └─ Any check failed: PR blocked ❌
```

## Development Workflow

### Local Development Setup

```bash
# Install dependencies
npm install

# Start development server (if applicable)
npm run dev

# Run linting and formatting
npm run lint          # Check for issues
npm run format        # Auto-fix formatting

# Run tests
npm run test          # Run unit tests
npm run test:e2e      # Run E2E tests
npm run test -- --coverage  # With coverage report

# Build for production
npm run build
```

### Before Creating PR

```bash
# 1. Ensure all tests pass
npm run test -- --coverage

# 2. Check code quality
npm run lint

# 3. Format code
npm run format

# 4. Verify build succeeds
npm run build

# 5. Review git diff
git diff

# 6. Create PR with meaningful description
```

---

## Metrics & Targets

### Coverage Targets

| Metric | Target | Enforcement |
|--------|--------|-------------|
| Lines | 80% | PR blocks if below |
| Branches | 75% | PR blocks if below |
| Functions | 80% | PR blocks if below |
| Statements | 80% | PR blocks if below |

### Code Quality Targets

| Metric | Target | Tool |
|--------|--------|------|
| Grade | A- minimum | SonarQube |
| Bugs | 0 critical | SonarQube |
| Vulnerabilities | 0 critical | npm audit, SAST |
| Code smells | B+ max | SonarQube |
| Duplication | < 3% | SonarQube |

### Performance Targets

| Metric | Target |
|--------|--------|
| Build time | < 5 minutes |
| Test run time | < 10 minutes |
| E2E test run time | < 15 minutes |
| Total CI pipeline | < 20 minutes |

---

## Exceptions & Waivers

### When Standards Can Be Waived

**Requirements**:
1. Technical justification documented
2. Team lead approval required
3. Tracked in project board
4. Re-evaluated in next sprint

**Examples**:
- Emergency hotfixes (reduced coverage allowed, must add tests in next PR)
- Legacy code refactoring (gradual improvement timeline)
- Experimental features (marked as experimental, removed before release)

**Process**:
1. Create issue explaining exception
2. Get approval from tech lead
3. Document in PR description
4. Track with "technical-debt" label
5. Plan remediation

---

## Continuous Improvement

### Quarterly Review

- Analyze quality metrics trends
- Identify patterns in failures
- Adjust thresholds if needed
- Team retrospective on standards

### Annual Audit

- Full compliance audit
- Security posture review
- Performance benchmarking
- Standards update meeting

---

## References

- [DEVELOPMENT.md](./DEVELOPMENT.md) - Development workflow
- [QUALITY_GATES.md](./QUALITY_GATES.md) - All gates overview
- [SECURITY_GATES.md](./SECURITY_GATES.md) - Security checks
- [PHASE1_*.md](./PHASE1_QUALITY_ENFORCEMENT.md) through [PHASE7_*.md](./PHASE7_DOCUMENTATION.md) - Phase details
- [E2E_TESTING.md](./E2E_TESTING.md) - E2E testing guide

---

**Last Updated**: 2026-03-09
**Version**: 1.0.0
