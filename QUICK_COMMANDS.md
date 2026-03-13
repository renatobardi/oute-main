# ⚡ Quick Commands - Gitflow & CI/CD

Copy-paste commands for common workflows. For detailed explanations, see [`GITFLOW_AND_CICD.md`](./GITFLOW_AND_CICD.md).

---

## 🆕 Starting a New Feature

```bash
# Update local develop
git checkout develop && git pull origin develop

# Create feature branch
git checkout -b feature/add-user-auth

# Make changes...
code src/auth.ts

# Test locally
npm run lint && npm run format && npm run test && npm run build

# Stage and commit
git add .
git commit -m "feat(auth): add user authentication module"

# Push to remote
git push -u origin feature/add-user-auth

# Open PR on GitHub to develop
# Wait for CI checks, address feedback, merge when approved
```

---

## 🐛 Fixing a Bug

```bash
# Update develop
git checkout develop && git pull origin develop

# Create fix branch
git checkout -b fix/dashboard-null-pointer

# Make changes...
code src/dashboard.ts

# Test
npm run lint && npm run format && npm run test

# Commit
git add .
git commit -m "fix(dashboard): handle null user data in profile card"

# Push
git push -u origin fix/dashboard-null-pointer

# Open PR to develop, wait for approval and merge
```

---

## 🚨 Critical Hotfix (Production Bug)

```bash
# Create hotfix from main (not develop)
git checkout main && git pull origin main
git checkout -b fix/critical-payment-bug

# Fix the issue
code src/payment.ts

# Test thoroughly
npm run test

# Commit
git add .
git commit -m "fix(payment): prevent duplicate charges on retry"

# Push
git push -u origin fix/critical-payment-bug

# Open PR to MAIN (not develop)
# Fast-track review, merge, auto-deploys to production

# Then sync back to develop
git checkout develop && git pull origin develop
git merge main --no-edit
git push origin develop
```

---

## ✅ After Your PR is Merged

```bash
# Update develop
git checkout develop && git pull origin develop

# Delete local branch
git branch -d feature/add-user-auth

# Delete remote branch
git push origin --delete feature/add-user-auth

# Confirm cleanup
git branch -a  # Should not show your old branch
```

---

## 🔧 Fixing CI/CD Failures

### ESLint or Prettier Failed

```bash
npm run lint         # View linting errors
npm run lint -- --fix  # Auto-fix
npm run format       # Auto-format

git add . && git commit -m "fix: resolve linting errors"
git push
```

### Tests Failed

```bash
npm run test         # Run tests
npm run test -- --coverage  # Check coverage (need 70%+)

# Add missing tests or fix broken ones
code src/__tests__/auth.test.ts

git add . && git commit -m "test: add missing auth module tests"
git push
```

### TypeScript Errors

```bash
npm run build  # See type errors

# Fix types manually in code
code src/auth.ts

git add . && git commit -m "fix: resolve TypeScript errors"
git push
```

### npm Audit Failed (Vulnerable Dependencies)

```bash
npm audit         # See vulnerabilities
npm audit fix     # Auto-fix if possible

git add package*.json
git commit -m "fix: update vulnerable dependencies"
git push
```

---

## 📊 Checking CI Status

```bash
# List recent workflows
gh run list --repo renatobardi/oute-main --limit 10

# View specific run details
gh run view <RUN_ID>

# View run logs
gh run view <RUN_ID> --log

# Watch run in real-time
gh run watch <RUN_ID>

# Cancel a run
gh run cancel <RUN_ID>
```

---

## 🚀 Deploying to Production

### Option 1: Automatic (Recommended)
```bash
# Merge to main
git checkout main && git pull origin main
git merge develop --no-ff
git push origin main

# GitHub Actions automatically deploys!
# Check status: gh run list --limit 1
```

### Option 2: Manual Workflow Dispatch
```bash
gh workflow run deploy-to-vm.yml --repo renatobardi/oute-main

# Check status
gh run list --limit 1
```

---

## 📌 Branch Protection Rules

These are automatically enforced:

```bash
# ✅ Must pass before merging to main/develop:
- All CI checks (lint, test, build)
- At least 1 code review approval
- Branches must be up to date with base

# ❌ Not allowed:
- Force push to main/develop
- Merge without approvals
- Merge with failing checks
```

---

## 🔄 Handling Merge Conflicts

```bash
# Fetch latest
git fetch origin

# Merge develop into your feature branch
git merge origin/develop

# Resolve conflicts manually
code src/conflicted-file.ts

# Mark as resolved
git add src/conflicted-file.ts

# Complete merge
git commit -m "fix: resolve merge conflicts with develop"
git push
```

---

## 📝 Commit Message Format

```bash
# Short, clear commits
git commit -m "feat(scope): add new feature"
git commit -m "fix(scope): resolve bug"
git commit -m "docs: update readme"

# With detailed explanation (optional)
git commit -m "feat(auth): add JWT refresh token

- Implement /refresh endpoint
- Add token to localStorage
- Auto-refresh before expiration

Closes #42"
```

---

## 🧹 Cleanup

```bash
# Delete all merged local branches
git branch --merged | grep -v "^\*\|main\|develop\|staging" | xargs -n 1 git branch -d

# Delete all merged remote branches
git branch -r --merged origin/develop | grep -v "main\|develop\|staging" | sed 's/origin\///' | xargs -n 1 git push --delete origin

# See what you're deleting first
git branch --merged
git branch -r --merged origin/develop
```

---

## 🎯 Daily Workflow Summary

```bash
# Morning: start work on new feature
git checkout develop && git pull origin develop
git checkout -b feature/new-thing

# Work...
code src/feature.ts

# Before end of day: commit and push
npm run lint && npm run format && npm run test
git add . && git commit -m "feat(scope): work in progress"
git push -u origin feature/new-thing

# Open PR when ready for review
# GitHub Actions runs checks automatically

# After approval: merge and deploy
# (via GitHub UI or git merge + git push)
```

---

## 📚 Full Documentation

- **Detailed Guide**: [`GITFLOW_AND_CICD.md`](./GITFLOW_AND_CICD.md)
- **Contributing**: [`contributing.md`](./contributing.md)
- **Development Setup**: [`DEVELOPMENT.md`](./DEVELOPMENT.md)
- **CI/CD Pipeline**: [`.github/CI_CD_PIPELINE.md`](./.github/CI_CD_PIPELINE.md)

---

**Tip**: Bookmark this file for quick reference! 📌
