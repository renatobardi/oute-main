# 📚 GitFlow & CI/CD Documentation Index

Complete guide to understanding and working with the project's Git strategy and automated deployment pipeline.

---

## 🎯 Start Here Based on Your Needs

### ❓ **"I want to understand WHY this way works"**
👉 Read: [`GITFLOW_EXPLAINED.md`](./GITFLOW_EXPLAINED.md)
- Explains concepts with analogies
- Shows real-world scenarios
- Answers "why do we need all these steps?"
- 20 min read, very educational

### ⚡ **"I just want the commands!"**
👉 Read: [`QUICK_COMMANDS.md`](./QUICK_COMMANDS.md)
- Copy-paste command sequences
- Common workflows
- CI failure fixes
- 5 min reference

### 📖 **"I need complete, detailed instructions"**
👉 Read: [`GITFLOW_AND_CICD.md`](./GITFLOW_AND_CICD.md)
- Step-by-step workflows
- Branch strategy details
- Quality gates explained
- CI/CD pipeline breakdown
- Troubleshooting guide
- 30 min read, very thorough

### 👥 **"Contributing to the project"**
👉 Read: [`contributing.md`](./contributing.md)
- Code standards
- Testing requirements
- Design system changes
- Branch naming conventions

---

## 📋 Document Relationships

```
                    START HERE
                        ↓
        ┌───────────────────────────────┐
        │ What do you need?             │
        └───────┬───────────────────────┘
                │
        ┌───────┴──────────────────┬────────────────┐
        ▼                          ▼                ▼
    Understand            Quick Reference    Detailed Docs
    Concepts              (Just commands)    (Full details)
        │                        │                │
        ▼                        ▼                ▼
   GITFLOW_           QUICK_              GITFLOW_AND_
   EXPLAINED          COMMANDS            CICD
   (.md)              (.md)               (.md)
   └──────────────────┬──────────────────┘
                      ▼
           Ready to start working!
                      ↓
                  contributing.md
```

---

## 📚 Complete Documentation Map

### **Core GitFlow Documentation**

| Document | Purpose | Audience | Time |
|----------|---------|----------|------|
| [`GITFLOW_EXPLAINED.md`](./GITFLOW_EXPLAINED.md) | **Conceptual understanding** | Everyone (start here!) | 20 min |
| [`GITFLOW_AND_CICD.md`](./GITFLOW_AND_CICD.md) | **Complete technical guide** | Developers | 30 min |
| [`QUICK_COMMANDS.md`](./QUICK_COMMANDS.md) | **Copy-paste commands** | Developers (bookmarks this!) | 5 min |
| [`contributing.md`](./contributing.md) | **Code standards & style** | Contributors | 15 min |

### **Related Documentation**

| Document | Purpose | Related To |
|----------|---------|-----------|
| [`.github/CI_CD_PIPELINE.md`](./.github/CI_CD_PIPELINE.md) | GitHub Actions pipeline details | GITFLOW_AND_CICD.md |
| [`DEVELOPMENT.md`](./DEVELOPMENT.md) | Local dev environment setup | Starting work |
| [`DEPLOYMENT.md`](./DEPLOYMENT.md) | Production deployment guide | CD part of CI/CD |
| [`PRODUCTION_SETUP.md`](./PRODUCTION_SETUP.md) | VM deployment procedures | CD part of CI/CD |

---

## 🎓 Learning Path

### **Level 1: Beginner** (New to the project)
```
1. Read GITFLOW_EXPLAINED.md (understand concepts)
   ↓
2. Read QUICK_COMMANDS.md (learn commands)
   ↓
3. Make your first tiny PR (5 lines)
   ↓
4. Experience GitHub Actions running
   ↓
5. See your code merge and deploy
```
**Goal:** Understand the flow, do one complete cycle

---

### **Level 2: Intermediate** (Working on features)
```
1. Read GITFLOW_AND_CICD.md (all details)
   ↓
2. Bookmark QUICK_COMMANDS.md (use daily)
   ↓
3. Handle your own CI failures (lint, tests)
   ↓
4. Resolve merge conflicts
   ↓
5. Request code reviews confidently
```
**Goal:** Work independently, solve common issues

---

### **Level 3: Advanced** (Team lead, release management)
```
1. Understand hotfix workflows
   ↓
2. Manage release branches
   ↓
3. Sync between main/staging/develop
   ↓
4. Review others' PRs
   ↓
5. Guide team on best practices
```
**Goal:** Help others, manage releases

---

## 🔍 Quick Reference

### **Branch Types at a Glance**

```
Permanent Branches:
├─ main          → Production (auto-deploys)
├─ develop       → Integration (all PRs go here)
└─ staging       → Pre-production (optional)

Temporary Branches:
├─ feature/*     → New features
├─ fix/*         → Bug fixes
├─ docs/*        → Documentation
├─ refactor/*    → Code refactoring
├─ test/*        → Test additions
├─ chore/*       → Maintenance
├─ ci/*          → CI improvements
└─ sec/*         → Security fixes
```

### **PR Quality Gates**

```
✓ ESLint (code style)
✓ Prettier (formatting)
✓ TypeScript (types)
✓ Unit Tests (70%+ coverage)
✓ E2E Tests (critical paths)
✓ Security Scan (secrets, vulns)
✓ npm Audit (dependency vulns)
✓ License Check (approved licenses)
✓ Docker Build (image builds)
✓ SonarCloud (code quality A-)
```

**All must pass before merge.**

### **Auto-Deploy Trigger**

```
When: Push to main branch
What: GitHub Actions workflow "deploy-to-vm.yml"
How:  1. Build Docker image
      2. Push to GCP Artifact Registry
      3. Deploy to VM via gcloud SSH
      4. Health checks
      5. Create release tag
Time: ~7 minutes
```

---

## 💬 Common Questions

### **Q: Which branch do I push to?**
**A:** Your feature branch! Then open PR to `develop`.
→ See [`QUICK_COMMANDS.md`](./QUICK_COMMANDS.md) "Starting a New Feature"

### **Q: How do I fix a CI/CD failure?**
**A:** Depends on what failed!
→ See [`GITFLOW_AND_CICD.md`](./GITFLOW_AND_CICD.md) "Troubleshooting"

### **Q: Can I push directly to main?**
**A:** Technically yes, but branch protection should prevent it.
→ Always use PR workflow instead

### **Q: What if I accidentally push to main?**
**A:** Deploy happens automatically (5-7 min later). See [`GITFLOW_EXPLAINED.md`](./GITFLOW_EXPLAINED.md) "Scenário 1"

### **Q: How do I revert a bad deployment?**
**A:** See [`GITFLOW_AND_CICD.md`](./GITFLOW_AND_CICD.md) "Rollback"
→ `git revert <commit>` + `git push main`

### **Q: Where's my code now?**
**A:** Check branch status:
```bash
git branch -a              # See all branches
gh run list --limit 5      # See recent deployments
```

---

## 🚀 Common Workflows

### **I want to add a feature**
```
Read: QUICK_COMMANDS.md → "Starting a New Feature"
Steps: 5 (edit → test → commit → push → PR)
Time:  30 min to hours depending on feature
```

### **I want to fix a bug**
```
Read: QUICK_COMMANDS.md → "Fixing a Bug"
Steps: Same as feature (5 steps)
Time:  15 min to 1 hour
```

### **Production is broken!**
```
Read: QUICK_COMMANDS.md → "Critical Hotfix"
Steps: 6 (special workflow)
Time:  20 min (fast-track)
```

### **I need to understand the flow**
```
Read: GITFLOW_EXPLAINED.md → All sections
Time:  20 min
```

### **I'm stuck with an error**
```
Read: GITFLOW_AND_CICD.md → "Troubleshooting"
Steps: Follow diagnostic steps
Time:  10 min
```

---

## 📊 Key Statistics

| Metric | Value |
|--------|-------|
| Total PR checks | 10+ automated |
| Average CI time | 5-10 minutes |
| Auto-deploy time | 7 minutes |
| Branch protection | Yes (main/develop) |
| Review requirement | 1 approval |
| Code coverage minimum | 70% |
| SonarCloud grade target | A- or better |

---

## 🎯 Success Metrics

Your team is using this well when:

- ✅ PRs take 10-15 min to review
- ✅ Deployments happen 2-3x per day
- ✅ Zero hot-fixes in production (fixed in next PR)
- ✅ All CI checks pass on first or second try
- ✅ Developers understand the flow
- ✅ Code review cycle is fast
- ✅ Rollbacks are rare (< 1 per month)

---

## 📞 Need Help?

1. **Understanding concepts?** → [`GITFLOW_EXPLAINED.md`](./GITFLOW_EXPLAINED.md)
2. **Forgot a command?** → [`QUICK_COMMANDS.md`](./QUICK_COMMANDS.md)
3. **Need details?** → [`GITFLOW_AND_CICD.md`](./GITFLOW_AND_CICD.md)
4. **Code standards?** → [`contributing.md`](./contributing.md)
5. **Something's broken?** → Troubleshooting sections in docs
6. **Still stuck?** → Slack your team lead 💬

---

## 📅 Document Status

- **Last Updated:** 2026-03-12
- **Version:** 1.0
- **Maintainer:** Development Team

---

**Bookmark this page for quick reference! 📌**

[Back to Root README](./README.md)
