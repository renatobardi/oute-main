# OUTE - Modular Monorepo

OUTE é uma aplicação modular construída com **Svelte 5 + SvelteKit**, organizada como um monorepo com múltiplos domínios independentes. A arquitetura suporta escalabilidade, deployment em **GCP Cloud Run** e implementa padrões enterprise de qualidade e segurança.

## 🏗️ Arquitetura

```
packages/
├── design-system/     ← Tailwind 4 + Componentes reutilizáveis
├── 00_dashboard/      ← Interface principal
├── 01_auth-profile/   ← Serviço de autenticação
└── 02_projects/       ← Gerenciamento de projetos

shared/               ← Tipos e utilitários compartilhados
```

## 🚀 Quick Start

### Pré-requisitos
- Node.js 20+ (LTS)
- npm 10+
- Docker & Docker Compose (para desenvolvimento local)

### Setup Local

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/oute.git
cd oute

# Instale dependências (todos os packages)
npm install

# Inicie os serviços em Docker
npm run docker:up

# Ou, para desenvolvimento local sem Docker
npm run dev
```

Serviços rodando:
- **Dashboard**: http://localhost:3000
- **Auth-Profile**: http://localhost:3001
- **Projects**: http://localhost:3002
- **Design System (Storybook)**: http://localhost:6006
- **PostgreSQL**: localhost:5432

## 📦 Packages

### 1. **design-system** (packages/design-system)
Sistema de design modular com Tailwind 4, componentes reutilizáveis e Storybook.

```bash
npm run dev:storybook --workspace=design-system
```

### 2. **00_dashboard** (packages/00_dashboard)
Interface web principal. Acessa auth-profile e projects.

### 3. **01_auth-profile** (packages/01_auth-profile)
Serviço de autenticação que emite JWTs. Todos os outros serviços validam tokens aqui.

### 4. **02_projects** (packages/02_projects)
API de gerenciamento de projetos com CRUD completo.

## 📚 Documentação

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Decisões arquiteturais e fluxos de dados
- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Setup local, debugging, scripts
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deploy em GCP Cloud Run
- **[SUBMODULES.md](./SUBMODULES.md)** - Detalhes de cada domínio

## 🔄 Workflow

### Branches
- **main** → Produção
- **staging** → Pré-produção (homolog)
- **develop** → Desenvolvimento
- **feature/*** → Novas features

### Criar uma feature

```bash
git checkout -b feature/meu-recurso develop
# ... faz mudanças ...
git push origin feature/meu-recurso
# Abre PR para develop
```

## 🛠️ Scripts Principais

```bash
npm run dev           # Todos os packages em dev
npm run build         # Build todos os packages
npm run test          # Rodas testes
npm run lint          # ESLint + TS check
npm run format        # Prettier format

npm run docker:up     # Start Docker services
npm run docker:down   # Stop Docker services
npm run docker:logs   # Ver logs
```

## 🔐 Segurança & Qualidade

- ✅ **TypeScript strict mode**
- ✅ **ESLint + Prettier**
- ✅ **SonarQube** (Community Edition)
- ✅ **Trivy** (container scanning)
- ✅ **Dependabot** (dependency updates)
- ✅ **Pre-commit hooks** (git-secrets, lint, format)

## ☁️ Deployment

Deploy automático em GCP Cloud Run via GitHub Actions:

1. **PR** → Lint, tests, SonarQube checks
2. **develop** → Deploy em preview
3. **staging** → Deploy em homolog
4. **main** → Deploy em produção

Ver [DEPLOYMENT.md](./DEPLOYMENT.md) para detalhes.

## 📦 Stack Técnico

- **Frontend**: Svelte 5, SvelteKit, Tailwind 4
- **Backend**: SvelteKit API routes, Node.js
- **Database**: PostgreSQL (centralizado)
- **Auth**: JWT (JSON Web Token)
- **Cloud**: GCP Cloud Run, Cloud SQL, Artifact Registry, Secret Manager
- **CI/CD**: GitHub Actions
- **Code Quality**: SonarQube, ESLint, TypeScript
- **Containers**: Docker, docker-compose

## 📋 Roadmap

- [ ] v1.0.0 - Setup initial
- [ ] v1.1.0 - Dashboard features
- [ ] v1.2.0 - Projects management
- [ ] v2.0.0 - Real-time updates (WebSockets)

## 🤝 Contributing

1. Create feature branch
2. Commit with message pattern: `type(scope): description`
3. Open PR with description
4. Wait for reviews + status checks

Ver [contributing.md](./contributing.md) para mais detalhes.

## 📝 License

MIT

---

**Made with ❤️ using Svelte 5 + SvelteKit**