# Documentação dos Submódulos / Packages

## Visão Geral

A OUTE é organizada em 6 packages principais (5 serviços + 1 design system), cada um com uma responsabilidade específica.

```
packages/
├── design-system/    ← Componentes UI compartilhados e tokens
├── 99_home/          ← Landing page pública (marketing)
├── 00_dashboard/     ← Interface web (frontend)
├── 03_interview/     ← Chat interface para entrevistas com IA
├── 01_auth-profile/  ← Serviço de autenticação (API)
└── 02_projects/      ← Gerenciamento de projetos (API)
```

---

## 1. Design System (packages/design-system)

**Propósito**: Design tokens centralizados e componentes reutilizáveis

**Stack Tecnológica**:

- Svelte 5 components
- Tailwind 4
- Storybook para documentação
- TypeScript

**Arquivos Principais**:

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

**Versionamento**: Semantic versioning (v1.0.0, v1.1.0, etc.)

**Publicação**:

- Publicado no GCP Artifact Registry como `@oute/design-system`
- Importado pelo 00_dashboard como dependência

**Exemplo de Uso**:

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

**Propósito**: Landing page pública e marketing

**Tipo**: Frontend (SvelteKit Static)

**Porta**: 3003

**Stack Tecnológica**:

- SvelteKit
- Svelte 5
- @oute/design-system
- Tailwind 4
- TypeScript

**Funcionalidades Principais**:

```
- Hero section: "Olá! Sou seu Arquiteto de Software."
- Search input para descrever projetos
- Call-to-action: "Entrar na Oute" + GitHub OAuth
- Stats section: 57 estimações, 127 arquitetos, ∞ impacto
- Navbar com links (Docs, Pricing), botão signup
- Responsive design com tema dark
```

**Rotas**:

```
/              ← Home/landing page (public)
/docs          ← Documentação (public)
/pricing       ← Planos (public)
```

**Arquivos Principais**:

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

**Variáveis de Ambiente**:

```
VITE_AUTH_SERVICE_URL=http://localhost:3001
VITE_API_TIMEOUT=30000
```

**Fluxo de Exemplo**:

```
1. Usuário acessa http://localhost:3003
2. Vê hero section + search input
3. Clica "Entrar na Oute"
   → Redireciona para GitHub OAuth
   → Cria usuário em 01_auth-profile
   → Redireciona para 00_dashboard
4. Usuário logado + no dashboard
```

---

## 3. 00 Dashboard (packages/00_dashboard)

**Propósito**: Interface web principal para usuários

**Tipo**: Frontend (SvelteKit SSR)

**Porta**: 3000

**Stack Tecnológica**:

- SvelteKit
- Svelte 5
- @oute/design-system
- TypeScript

**Rotas**:

```
/                ← Dashboard home (protegido)
/login           ← Página de login (público)
/profile         ← Perfil do usuário (protegido)
/projects        ← Lista de projetos (protegido)
/projects/:id    ← Detalhe do projeto (protegido)
```

**Arquivos Principais**:

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

**Responsabilidades**:

1. Renderizar páginas
2. Integração de login (chama 01_auth-profile)
3. Listagem de projetos (chama 02_projects)
4. Gerenciamento de sessão JWT
5. Interface do usuário

**Variáveis de Ambiente**:

```
AUTH_SERVICE_URL=http://localhost:3001
PROJECTS_SERVICE_URL=http://localhost:3004
```

**Chamadas de API**:

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

**Propósito**: Interface de chat para entrevistas com IA

**Tipo**: Frontend (SvelteKit SSR)

**Porta**: 3002

**Stack Tecnológica**:

- SvelteKit
- Svelte 5
- @oute/design-system
- Tailwind 4
- TypeScript

**Layout**: Interface de 3 Painéis

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

**Funcionalidades Principais**:

- Chat com mensagens de usuário e IA
- Notas editáveis com salvar/cancelar
- Exportação de notas como .txt
- Métricas de progresso (%, horas, orçamento)
- Tema dark idêntico ao dashboard
- Sidebar com histórico de entrevistas

**Rotas**:

```
/interviews         ← List interviews (protected)
/interviews/:id     ← Interview detail (protected)
```

**Arquivos Principais**:

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

**Variáveis de Ambiente**:

```
VITE_AUTH_SERVICE_URL=http://localhost:3001
VITE_API_TIMEOUT=30000
```

**Fluxo de Exemplo**:

```
1. Usuário acessa http://localhost:3002/interviews
2. Vê lista de entrevistas anteriores (localStorage/DB)
3. Clica em uma entrevista
4. Interface de 3 painéis abre:
   - Esquerda: Histórico de entrevistas
   - Centro: Janela de chat
   - Direita: Notas editáveis
5. Usuário pode:
   - Enviar mensagens
   - Editar notas
   - Salvar/exportar notas
   - Ver métricas atualizarem
```

---

## 5. 01 Auth-Profile (packages/01_auth-profile)

**Propósito**: Serviço de autenticação e perfil de usuário

**Tipo**: Backend API (SvelteKit)

**Porta**: 3001

**Stack Tecnológica**:

- SvelteKit
- Node.js
- PostgreSQL
- JWT (jsonwebtoken)
- bcrypt
- TypeScript

**Rotas**:

```
POST   /auth/login          ← Login do usuário
POST   /auth/logout         ← Logout
POST   /auth/refresh        ← Refresh JWT
GET    /profile             ← Obter usuário atual (protegido)
PATCH  /profile             ← Atualizar perfil (protegido)
POST   /profile/change-password
GET    /profile/verify      ← Verificar JWT
```

**Arquivos Principais**:

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

**Responsabilidades**:

1. Login de usuário (validar credenciais, emitir JWT)
2. Registro de usuário (hash de senha, armazenar)
3. Validação de JWT
4. Gerenciamento de perfil
5. Refresh de token

**Tabelas do Banco de Dados**:

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

**Variáveis de Ambiente**:

```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
JWT_EXPIRY=24h
```

**Fluxo de Exemplo**:

```
1. POST /auth/login { email: "user@example.com", password: "..." }
2. Hash da senha fornecida, comparar com hash armazenado
3. Se válido, gerar JWT
4. Retornar { token, user: { id, email, name } }
```

---

## 6. 02 Projects (packages/02_projects)

**Propósito**: API de gerenciamento de projetos (CRUD)

**Tipo**: Backend API (SvelteKit)

**Porta**: 3004 (host) / 3002 (container)

**Stack Tecnológica**:

- SvelteKit
- Node.js
- PostgreSQL
- Validação JWT
- TypeScript

**Rotas**:

```
GET    /projects             ← Listar projetos do usuário (protegido)
POST   /projects             ← Criar projeto (protegido)
GET    /projects/:id         ← Detalhe do projeto (protegido)
PATCH  /projects/:id         ← Atualizar projeto (protegido)
DELETE /projects/:id         ← Deletar projeto (protegido)
```

**Arquivos Principais**:

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

**Responsabilidades**:

1. Validar JWT (do 01_auth-profile)
2. Extrair user_id do JWT
3. Buscar projetos do usuário
4. Criar/Atualizar/Deletar projetos

**Tabelas do Banco de Dados**:

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

**Variáveis de Ambiente**:

```
DATABASE_URL=postgresql://...
AUTH_SERVICE_URL=http://localhost:3001
JWT_SECRET=your-secret-key
```

**Fluxo de Exemplo**:

```
1. GET /projects
   Header: Authorization: Bearer <JWT>
2. Validar JWT → Extrair user_id
3. SELECT * FROM projects WHERE user_id = ?
4. Retornar lista de projetos
```

**Middleware de Validação JWT** (lib/auth.ts):

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

## Pacote Compartilhado (shared/)

**Propósito**: Tipos e utilitários compartilhados

**Arquivos**:

```
shared/
├── types.ts       ← Interfaces comuns (User, Project, etc)
├── constants.ts   ← Constantes compartilhadas
└── utils.ts       ← Funções auxiliares
```

**Exemplo** (types.ts):

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

**Importar do shared**:

```typescript
import type { User, Project } from '@oute/shared';
```

---

## Adicionando um Novo Package

Para adicionar um novo package (ex.: `04_notifications`):

1. Criar diretório: `mkdir packages/04_notifications`
2. Criar app SvelteKit: `npm create svelte@latest packages/04_notifications`
3. Atualizar paths no `tsconfig.json` (se necessário)
4. Adicionar serviço no `docker-compose.yml`
5. Atualizar workflows do GitHub Actions
6. Documentar neste arquivo

---

## Matriz de Versões

| Package         | Porta (host) | Porta (container) | Versão | Status        | Arquitetura      |
| --------------- | ------------ | ----------------- | ------ | ------------- | -----------------|
| design-system   | 6006         | 6006              | 1.0.0  | Produção      | Storybook        |
| 99_home         | 3003         | 3003              | 1.0.0  | Produção      | SvelteKit        |
| 00_dashboard    | 3000         | 3000              | 1.0.0  | Refatoração   | SvelteKit        |
| 03_interview    | 3002         | 3002              | 1.0.0  | Produção      | SvelteKit        |
| 01_auth-profile | 3001         | 3001              | 1.0.0  | Produção      | Hexagonal + DDD  |
| 02_projects     | 3004         | 3002              | 1.0.0  | Refatoração   | SvelteKit        |

---

## Fluxo de Comunicação

```
99_home (Port 3003) - LANDING PAGE PÚBLICA
  └─→ CTA "Entrar na Oute"
      └─→ Redireciona para 00_dashboard (with GitHub OAuth)

00_dashboard (Port 3000) - APP PRINCIPAL
  ├─→ POST /auth/login → 01_auth-profile
  │   ← JWT token
  │
  ├─→ GET /projects (with JWT) → 02_projects
  │   ├─→ Valida JWT → 01_auth-profile/profile/verify
  │   ← Dados dos projetos
  │
  └─→ GET /interviews → 03_interview
      └─→ Lista de entrevistas + interface chat

03_interview (Port 3002) - ENTREVISTAS CHAT
  ├─→ Chat com IA (via API)
  ├─→ Salvar notas (to 02_projects/notes)
  └─→ Exportar métricas

01_auth-profile (Port 3001) - API DE AUTENTICAÇÃO
  ├─→ POST /auth/login → Gera JWT
  ├─→ POST /auth/logout
  ├─→ GET /profile (protected)
  └─→ GET /profile/verify (Validação JWT)

02_projects (Port 3004 host / 3002 container) - API DE PROJETOS
  ├─→ Valida JWT via 01_auth-profile
  ├─→ GET /projects
  ├─→ POST /projects
  ├─→ GET /projects/:id
  ├─→ PATCH /projects/:id
  └─→ DELETE /projects/:id
```
