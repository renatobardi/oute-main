# Submodules / Packages Documentation

## Overview

OUTE is organized into 6 main packages (5 services + 1 design system), each with a specific responsibility.

```
packages/
├── design-system/    ← Shared UI components & tokens
├── 99_home/          ← Landing page pública (marketing)
├── 00_dashboard/     ← Web interface (frontend)
├── 03_interview/     ← Chat interface para entrevistas com IA
├── 01_auth-profile/  ← Authentication service (API)
└── 02_projects/      ← Project management (API)
```

---

## 1. Design System (packages/design-system)

**Purpose**: Centralized design tokens and reusable components

**Tech Stack**:

- Svelte 5 components
- Tailwind 4
- Storybook for documentation
- TypeScript

**Key Files**:

```
src/
├── tokens/           ← Design tokens
│   ├── colors.ts
│   ├── typography.ts
│   └── spacing.ts
├── components/       ← Reusable components
│   ├── Button.svelte
│   ├── Card.svelte
│   ├── Input.svelte
│   └── Modal.svelte
└── index.ts
```

**Version**: Semantic versioning (v1.0.0, v1.1.0, etc.)

**Publishing**:

- Published to GCP Artifact Registry as `@oute/design-system`
- Imported by 00_dashboard as dependency

**Example Usage**:

```typescript
import { Button, Card } from '@oute/design-system';
import { colors } from '@oute/design-system/tokens';

<Button variant="primary">Click me</Button>
```

**Storybook**:

```bash
npm run dev:storybook --workspace=design-system
# http://localhost:6006
```

---

## 2. 99 Home (packages/99_home)

**Purpose**: Public landing page and marketing

**Type**: Frontend (SvelteKit Static)

**Port**: 3003

**Tech Stack**:

- SvelteKit
- Svelte 5
- @oute/design-system
- Tailwind 4
- TypeScript

**Key Features**:

```
- Hero section: "Olá! Sou seu Arquiteto de Software."
- Search input para descrever projetos
- Call-to-action: "Entrar na Oute" + GitHub OAuth
- Stats section: 57 estimações, 127 arquitetos, ∞ impacto
- Navbar com links (Docs, Pricing), signup button
- Responsive design com tema dark
```

**Routes**:

```
/              ← Home/landing page (public)
/docs          ← Documentação (public)
/pricing       ← Planos (public)
```

**Key Files**:

```
src/
├── routes/
│   ├── +page.svelte         ← Home landing
│   ├── docs/+page.svelte
│   └── pricing/+page.svelte
├── lib/
│   ├── components/
│   │   ├── Hero.svelte
│   │   ├── Stats.svelte
│   │   └── Navbar.svelte
│   └── config.ts
└── app.html
```

**Environment**:

```
VITE_AUTH_SERVICE_URL=http://localhost:3001
VITE_API_TIMEOUT=30000
```

**Example Flow**:

```
1. User lands on http://localhost:3003
2. Sees hero section + search input
3. Clicks "Entrar na Oute"
   → Redirects to GitHub OAuth flow
   → Creates user in 01_auth-profile
   → Redirects to 00_dashboard
4. User logged in + on dashboard
```

---

## 3. 00 Dashboard (packages/00_dashboard)

**Purpose**: Main web interface for users

**Type**: Frontend (SvelteKit SSR)

**Port**: 3000

**Tech Stack**:

- SvelteKit
- Svelte 5
- @oute/design-system
- TypeScript

**Routes**:

```
/                ← Dashboard home (protected)
/login           ← Login page (public)
/profile         ← User profile (protected)
/projects        ← List projects (protected)
/projects/:id    ← Project detail (protected)
```

**Key Files**:

```
src/
├── routes/
│   ├── +page.svelte          ← Dashboard home
│   ├── login/+page.svelte    ← Login form
│   ├── profile/+page.svelte
│   └── projects/
│       ├── +page.svelte      ← Projects list
│       └── [id]/+page.svelte ← Project detail
├── lib/
│   ├── auth.ts               ← JWT handling
│   └── api.ts                ← API calls
└── app.html
```

**Responsibilities**:

1. Render pages
2. Login integration (calls 01_auth-profile)
3. Projects listing (calls 02_projects)
4. JWT session management
5. User-facing UI

**Environment**:

```
AUTH_SERVICE_URL=http://localhost:3001
PROJECTS_SERVICE_URL=http://localhost:3002
```

**API Calls**:

```typescript
// Login
POST /auth/login { email, password }
← JWT token

// Get projects
GET /projects
Header: Authorization: Bearer <JWT>
← Projects list
```

---

## 4. 03 Interview (packages/03_interview)

**Purpose**: Chat interface for AI-powered interviews

**Type**: Frontend (SvelteKit SSR)

**Port**: 3002

**Tech Stack**:

- SvelteKit
- Svelte 5
- @oute/design-system
- Tailwind 4
- TypeScript

**Layout**: 3-Panel Interface

```
┌─────────────────────────────────────┐
│            NAVBAR                   │
├──────────┬────────────┬─────────────┤
│ Sidebar  │    Chat    │    Notes    │
│ (Left)   │  (Center)  │   (Right)   │
│          │            │             │
│ • Hist 1 │ User:      │ Notes:      │
│ • Hist 2 │ "Hello"    │ • Point 1   │
│ • Hist 3 │            │ • Point 2   │
│          │ AI:        │             │
│          │ "Hi there" │ [Save]      │
│          │            │ [Export]    │
└──────────┴────────────┴─────────────┘
```

**Key Features**:

- Chat com mensagens de usuário e IA
- Editable notes com save/cancel
- Export de notas como .txt
- Métricas de progresso (%, horas, orçamento)
- Tema dark idêntico ao dashboard
- Interview history sidebar

**Routes**:

```
/interviews         ← List interviews (protected)
/interviews/:id     ← Interview detail (protected)
```

**Key Files**:

```
src/
├── routes/
│   ├── interviews/+page.svelte
│   └── interviews/[id]/+page.svelte
├── lib/
│   ├── components/
│   │   ├── ChatPanel.svelte
│   │   ├── NotesPanel.svelte
│   │   ├── Sidebar.svelte
│   │   └── Metrics.svelte
│   ├── api.ts
│   └── types.ts
└── app.html
```

**Environment**:

```
VITE_AUTH_SERVICE_URL=http://localhost:3001
VITE_API_TIMEOUT=30000
```

**Example Flow**:

```
1. User lands on http://localhost:3002/interviews
2. Sees list of past interviews (from localStorage/DB)
3. Clicks on interview
4. 3-panel interface opens:
   - Left: Interview history
   - Center: Chat window
   - Right: Editable notes
5. User can:
   - Send messages
   - Edit notes
   - Save/export notes
   - See metrics update
```

---

## 5. 01 Auth-Profile (packages/01_auth-profile)

**Purpose**: Authentication & user profile service

**Type**: Backend API (SvelteKit)

**Port**: 3001

**Tech Stack**:

- SvelteKit
- Node.js
- PostgreSQL
- JWT (jsonwebtoken)
- bcrypt
- TypeScript

**Routes**:

```
POST   /auth/login          ← Login user
POST   /auth/logout         ← Logout
POST   /auth/refresh        ← Refresh JWT
GET    /profile             ← Get current user (protected)
PATCH  /profile             ← Update profile (protected)
POST   /profile/change-password
GET    /profile/verify      ← Verify JWT
```

**Key Files**:

```
src/
├── routes/
│   ├── auth/
│   │   ├── login/+server.ts
│   │   ├── logout/+server.ts
│   │   └── refresh/+server.ts
│   └── profile/
│       ├── +server.ts
│       └── verify/+server.ts
├── lib/
│   ├── jwt.ts               ← JWT generation/validation
│   ├── password.ts          ← bcrypt hashing
│   ├── db.ts                ← Database queries
│   └── types.ts             ← Type definitions
└── app.ts                   ← SvelteKit hooks
```

**Responsibilities**:

1. User login (validate credentials, issue JWT)
2. User registration (hash password, store)
3. JWT validation
4. User profile management
5. Token refresh

**Database Tables**:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE,
  password_hash VARCHAR,
  created_at TIMESTAMP
);

CREATE TABLE sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  token VARCHAR,
  expires_at TIMESTAMP
);
```

**Environment**:

```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
JWT_EXPIRY=24h
```

**Example Flow**:

```
1. POST /auth/login { email: "user@example.com", password: "..." }
2. Hash provided password, compare with stored hash
3. If valid, generate JWT
4. Return { token, user: { id, email, name } }
```

---

## 6. 02 Projects (packages/02_projects)

**Purpose**: Project management API (CRUD)

**Type**: Backend API (SvelteKit)

**Port**: 3002

**Tech Stack**:

- SvelteKit
- Node.js
- PostgreSQL
- JWT validation
- TypeScript

**Routes**:

```
GET    /projects             ← List user's projects (protected)
POST   /projects             ← Create project (protected)
GET    /projects/:id         ← Get project detail (protected)
PATCH  /projects/:id         ← Update project (protected)
DELETE /projects/:id         ← Delete project (protected)
```

**Key Files**:

```
src/
├── routes/
│   └── projects/
│       ├── +server.ts       ← GET/POST
│       └── [id]/+server.ts  ← GET/PATCH/DELETE
├── lib/
│   ├── auth.ts              ← JWT validation
│   ├── db.ts                ← Database queries
│   └── validation.ts        ← Input validation
└── app.ts
```

**Responsibilities**:

1. Validate JWT (from 01_auth-profile)
2. Get user_id from JWT
3. Fetch projects for that user
4. Create/Update/Delete projects

**Database Tables**:

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name VARCHAR,
  description TEXT,
  status VARCHAR,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Environment**:

```
DATABASE_URL=postgresql://...
AUTH_SERVICE_URL=http://localhost:3001
JWT_SECRET=your-secret-key
```

**Example Flow**:

```
1. GET /projects
   Header: Authorization: Bearer <JWT>
2. Validate JWT → Extract user_id
3. SELECT * FROM projects WHERE user_id = ?
4. Return projects list
```

**JWT Validation Middleware** (lib/auth.ts):

```typescript
export async function validateJWT(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { valid: true, userId: decoded.sub };
  } catch {
    return { valid: false, error: 'Invalid token' };
  }
}
```

---

## Shared Package (shared/)

**Purpose**: Shared types and utilities

**Files**:

```
shared/
├── types.ts       ← Common interfaces (User, Project, etc)
├── constants.ts   ← Shared constants
└── utils.ts       ← Helper functions
```

**Example** (types.ts):

```typescript
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  description: string;
  status: 'active' | 'archived';
}

export interface JWTPayload {
  sub: string; // user_id
  email: string;
  iat: number;
  exp: number;
}
```

**Import from shared**:

```typescript
import type { User, Project } from '@oute/shared';
```

---

## Adding a New Package

To add a new package (e.g., `03_notifications`):

1. Create directory: `mkdir packages/03_notifications`
2. Create SvelteKit app: `npm create svelte@latest packages/03_notifications`
3. Update `tsconfig.json` paths (if needed)
4. Add service in `docker-compose.yml`
5. Update GitHub Actions workflows
6. Document in this file

---

## Version Matrix

| Package         | Port | Current | Status        | Architecture      |
| --------------- | ---- | ------- | ------------- | ------------------|
| design-system   | 6006 | 1.0.0   | ✅ Production | Storybook        |
| 99_home         | 3003 | 1.0.0   | ✅ Production | SvelteKit        |
| 00_dashboard    | 3000 | 1.0.0   | 🔄 Refactoring| SvelteKit        |
| 03_interview    | 3002 | 1.0.0   | ✅ Production | SvelteKit        |
| 01_auth-profile | 3001 | 1.0.0   | ✅ Production | Hexagonal + DDD  |
| 02_projects     | 3002 | 1.0.0   | 🔄 Refactoring| SvelteKit        |

---

## Communication Flow

```
99_home (Port 3003) - PUBLIC LANDING PAGE
  └─→ CTA "Entrar na Oute"
      └─→ Redirects to 00_dashboard (with GitHub OAuth)

00_dashboard (Port 3000) - MAIN APP
  ├─→ POST /auth/login → 01_auth-profile
  │   ← JWT token
  │
  ├─→ GET /projects (with JWT) → 02_projects
  │   ├─→ Validates JWT → 01_auth-profile/profile/verify
  │   ← Projects data
  │
  └─→ GET /interviews → 03_interview
      └─→ Interview list + chat interface

03_interview (Port 3002) - CHAT INTERVIEWS
  ├─→ Chat with AI (via API)
  ├─→ Save notes (to 02_projects/notes)
  └─→ Export metrics

01_auth-profile (Port 3001) - AUTH API
  ├─→ POST /auth/login → Generates JWT
  ├─→ POST /auth/logout
  ├─→ GET /profile (protected)
  └─→ GET /profile/verify (JWT validation)

02_projects (Port 3002) - PROJECTS API
  ├─→ Validates JWT via 01_auth-profile
  ├─→ GET /projects
  ├─→ POST /projects
  ├─→ GET /projects/:id
  ├─→ PATCH /projects/:id
  └─→ DELETE /projects/:id
```
