# 📦 OUTE - Packages Overview

## All 6 Packages at a Glance

```
┌─────────────────────────────────────────────────────────────────┐
│                   OUTE Monorepo (6 Packages)                    │
└─────────────────────────────────────────────────────────────────┘

├── 🎨 design-system (Port 6006 - Storybook)
│   ├── Status: ✅ Completed
│   ├── Type: UI Component Library
│   ├── Tech: Svelte 5 + Tailwind 4
│   └── Features: Tokens, Components, Design system
│
├── 🏠 99_home (Port 3003)
│   ├── Status: ✅ Completed
│   ├── Type: Public Landing Page
│   ├── Tech: SvelteKit + Svelte 5
│   └── Features: Hero, CTA, Stats, GitHub OAuth
│
├── 📊 00_dashboard (Port 3000)
│   ├── Status: 🔄 Refactoring
│   ├── Type: Main App Frontend
│   ├── Tech: SvelteKit + Svelte 5
│   └── Features: Dashboard, Projects, Estimations
│
├── 💬 03_interview (Port 3002)
│   ├── Status: ✅ Completed
│   ├── Type: Chat Interface
│   ├── Tech: SvelteKit + Svelte 5
│   └── Features: AI Chat, Notes, Metrics (3-panel layout)
│
├── 🔐 01_auth-profile (Port 3001)
│   ├── Status: ✅ REFACTORED & Production-Ready
│   ├── Type: Auth API
│   ├── Architecture: Hexagonal + DDD + TDD
│   ├── Tests: 178 passing (80%+ coverage)
│   └── Features: Login, JWT, Profile, Authentication
│
└── 📋 02_projects (Port 3004 host / 3002 container)
    ├── Status: 🔄 Refactoring
    ├── Type: Projects API
    ├── Tech: SvelteKit + Node.js
    └── Features: CRUD Projects, Member Management
```

---

## Port Mapping

| Package | Port | Type | Status |
|---------|------|------|--------|
| design-system | 6006 | Storybook | ✅ |
| 99_home | 3003 | Landing Page | ✅ |
| 00_dashboard | 3000 | Frontend | 🔄 |
| 03_interview | 3002 | Frontend | ✅ |
| 01_auth-profile | 3001 | Backend API | ✅ |
| 02_projects | 3004 (host) / 3002 (container) | Backend API | 🔄 |

---

## Status Legend

- ✅ **Completed** - Fully functional, production-ready
- 🔄 **Refactoring** - In progress, following Hexagonal Architecture pattern
- 🚀 **Soon** - Planned for future development

---

## Quick Links to Documentation

### Main Docs
- **[README.md](./README.md)** - Overview and quick start
- **[EXECUTIVE_SUMMARY.md](./EXECUTIVE_SUMMARY.md)** - High-level summary
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Architecture decisions

### Package-Specific
- **[SUBMODULES.md](./SUBMODULES.md)** - Detailed package documentation
- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Local setup and development guide

### Implementation Guides
- **[APPLYING_PATTERN_TO_OTHER_SERVICES.md](./APPLYING_PATTERN_TO_OTHER_SERVICES.md)** - Template for applying Hexagonal Architecture
- **[NEXT_STEPS_CHECKLIST.md](./NEXT_STEPS_CHECKLIST.md)** - Next steps and checklist

### GitHub Actions & CI/CD
- **[.github/CI_CD_PIPELINE.md](./.github/CI_CD_PIPELINE.md)** - CI/CD setup
- **[VM_DEPLOYMENT.md](./VM_DEPLOYMENT.md)** - Guia de deploy em VM

---

## Architecture Overview

### Data Flow

```
99_home (Public Landing)
  ↓ (CTA "Entrar na Oute")
  ↓
00_dashboard (Main App)
  ├→ Login → 01_auth-profile (JWT)
  ├→ Projects → 02_projects (with JWT)
  └→ Chat → 03_interview (with JWT)

01_auth-profile (Auth API)
  └→ PostgreSQL (centralized)

02_projects (Projects API)
  └→ PostgreSQL (centralized)

design-system (Shared Components)
  ├→ Used by: 99_home, 00_dashboard, 03_interview
  ├→ Tokens: Colors, Typography, Spacing
  └→ Components: Button, Card, Input, Modal, etc
```

---

## Database

**PostgreSQL 15** - Centralized, shared by all services

### 25 Tables in 7 Bounded Contexts

```
1. IAM (4 tables)
   - users, orgs, org_members, refresh_tokens

2. PROJECT (4 tables)
   - projects, proj_members, tags, project_tags

3. INTERVIEW (3 tables)
   - interviews, messages, int_notes

4. TEMPLATE ENGINE (5 tables)
   - sdlc_templates, template_milestones, template_epics, template_issues, template_checklists

5. ESTIMATION ENGINE (5 tables)
   - estimation_sessions, estimation_milestone_statuses, estimation_responses,
   - estimation_checklist_results, estimation_outputs

6. INTEGRATIONS (3 tables)
   - integration_connections, export_sessions, export_mappings

7. AUDIT (1 table)
   - audit_log (append-only, immutable)
```

See [docs/database/README.md](./docs/database/README.md) for full schema.

---

## Development Commands

### All Services
```bash
npm run dev          # Start all packages in dev mode
npm run build        # Build all packages
npm run test         # Test all packages
npm run lint         # Lint all packages
npm run format       # Format all packages
```

### Docker
```bash
npm run docker:up    # Start all services in Docker
npm run docker:down  # Stop Docker services
npm run docker:logs  # View Docker logs
```

### Individual Services
```bash
cd packages/99_home && npm run dev
cd packages/00_dashboard && npm run dev
cd packages/03_interview && npm run dev
cd packages/01_auth-profile && npm run dev
cd packages/02_projects && npm run dev
```

---

## Architecture Patterns

### ✅ 01_auth-profile (Complete Refactoring)

**Hexagonal Architecture (Ports & Adapters)**

```
Presentation Layer (HTTP)
    ↓
Application Layer (Use Cases)
    ↓
Infrastructure Layer (Adapters)
    ↓
Domain Layer (Business Logic - Isolated)
```

- **178 Tests** - All layers tested
- **80%+ Coverage** - Comprehensive test coverage
- **DDD Principles** - Domain-driven design
- **Clean Code** - SOLID principles

**Available as Template** - See `APPLYING_PATTERN_TO_OTHER_SERVICES.md`

---

## Next Steps

### Short Term (Next 2-4 weeks)
1. ✅ Update all documentation with 6 packages
2. Refactor 02_projects (follow 01_auth-profile pattern)
3. Refactor 00_dashboard (follow 01_auth-profile pattern)

### Medium Term (Months 2-3)
1. Complete refactoring of all services
2. Add cross-service integration tests
3. Production deployment preparation

### Long Term
1. CI/CD pipeline optimization
2. Performance monitoring
3. Continuous improvement

---

## Contributing

See [contributing.md](./contributing.md) for guidelines.

Branch strategy:
- `main` → Production
- `staging` → Pre-production
- `develop` → Development
- `feature/*` → Feature branches

---

## Deployment

### Local Development
See [DEVELOPMENT.md](./DEVELOPMENT.md)

### Producao (GCP VM + Docker Compose + Caddy)
Ver [VM_DEPLOYMENT.md](./VM_DEPLOYMENT.md)

---

## Useful Resources

- **[EXECUTIVE_SUMMARY.md](./EXECUTIVE_SUMMARY.md)** - 5-min overview
- **[REFACTORING_COMPLETION.md](./REFACTORING_COMPLETION.md)** - Complete reference
- **[REFACTORING_COMPLETION.md](./REFACTORING_COMPLETION.md)** - Detalhes de todas as fases da refatoracao
- **[E2E Testing Guide](./packages/01_auth-profile/src/__tests__/e2e/README.md)** - Testing patterns

---

## Status Dashboard

| Item | Status |
|------|--------|
| **Packages** | 6/6 implemented |
| **Tests (01_auth-profile)** | 178/178 passing ✅ |
| **Coverage (01_auth-profile)** | 80%+ ✅ |
| **Documentation** | Complete ✅ |
| **Refactoring (02_projects)** | In Progress 🔄 |
| **Refactoring (00_dashboard)** | In Progress 🔄 |

---

**Last Updated**: March 12, 2026
**Quality Level**: 🏆 Gold Standard
**Status**: Production Ready (partially)

