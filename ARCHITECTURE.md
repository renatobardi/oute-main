# Arquitetura OUTE

## Design Principles

1. **Monorepo Simples**: Um repo GitHub com estrutura clara
2. **Modular**: Cada domínio é independente mas compartilha tipos e componentes
3. **Escalável**: Adicione novos packages sem modificar código existente
4. **Type-Safe**: TypeScript strict mode em tudo
5. **Enterprise-Grade**: Qualidade e segurança desde o início

## Estrutura

```
oute/
├── packages/
│   ├── design-system/    (Tokens + Componentes + Storybook)
│   ├── 99_home/          (Landing page pública - Port 3003)
│   ├── 00_dashboard/     (Frontend principal - Port 3000)
│   ├── 03_interview/     (Chat interface para entrevistas - Port 3002)
│   ├── 01_auth-profile/  (Auth API - Port 3001)
│   └── 02_projects/      (Projects API - Port 3004 host / 3002 container)
├── shared/               (Tipos comuns)
├── .github/              (CI/CD workflows)
└── [configs]
```

## Fluxo de Dados

```
99_home (Port 3003) - PUBLIC LANDING PAGE
    └── Hero + CTA → Redireciona para 00_dashboard

00_dashboard (Port 3000) - MAIN APP
    ├── Login → POST /auth/login (01_auth-profile)
    │   └── Recebe JWT
    ├── Dashboard → GET /projects (02_projects)
    │   └── Envia JWT no header
    └── Usa @oute/design-system (componentes)

03_interview (Port 3002) - CHAT INTERVIEWS
    ├── Chat interface com AI
    ├── 3-panel layout (sidebar, chat, notes)
    ├── Editable notes com export
    └── Usa @oute/design-system (tema/cores)

01_auth-profile (Port 3001) - AUTH API
    ├── POST /auth/login → Gera JWT
    ├── POST /auth/logout
    └── GET /profile (protegido)

02_projects (Port 3004 host / 3002 container) - PROJECTS API
    ├── Valida JWT via 01_auth-profile
    ├── GET /projects
    ├── POST /projects
    ├── GET /projects/:id
    ├── PUT /projects/:id
    └── DELETE /projects/:id
```

## Autenticação (JWT)

```
1. User faz login no 00_dashboard
   → POST http://localhost:3001/auth/login
   ← Recebe JWT

2. Dashboard armazena JWT (localStorage/cookie)

3. Para acessar 02_projects
   → GET http://localhost:3002/projects
   → Header: Authorization: Bearer <JWT>

4. 02_projects valida JWT
   ✅ Válido → Retorna dados
   ❌ Inválido → 401 Unauthorized
```

## Database

PostgreSQL centralizado compartilhado por todos os serviços.

**Database**: `oute_db` com 25 tabelas em 7 bounded contexts.

**12 arquivos de migração** cobrindo:
- Extensions, UUID v7, enums, triggers
- IAM (users, organizations, refresh_tokens)
- Projects, interviews, templates
- Estimation, integrations, audit

## Design System (Tokens + Componentes)

```typescript
// Imports
import { Button, Card } from '@oute/design-system';
import { colors, typography } from '@oute/design-system/tokens';

// Uso
<Button variant="primary" size="md">Clique aqui</Button>
<Card title="Meu Card">Conteúdo</Card>
```

## Versionamento

Cada package tem seu próprio `package.json` com versão independente.

**Convenção**:

- Monorepo (raiz): v1.0.0
- design-system: v1.0.0, v1.1.0 (componentes novos)
- 00_dashboard: depende de design-system@^1.0.0
- 01_auth-profile, 02_projects: não dependem de design-system

## Deployment

### Ambiente Local (Docker)

```bash
npm run docker:up
```

Inicia:

- PostgreSQL (5432)
- 99_home (3003) - Landing page
- 00_dashboard (3000) - Main interface
- 03_interview (3002) - Chat interviews
- 01_auth-profile (3001) - Auth API
- design-system/storybook (6006)

### Producao (GCP VM + Docker Compose + Caddy)

Todos os servicos rodam como containers Docker em uma VM GCP:
- oute-home (porta 3003)
- oute-dashboard (porta 3000)
- oute-interview (porta 3002)
- oute-auth-profile (porta 3001)
- oute-projects (porta 3004 host / 3002 container)
- PostgreSQL (porta 5432)

Caddy atua como reverse proxy roteando requisicoes.
Ver VM_DEPLOYMENT.md para detalhes.

## CI/CD

6 workflows GitHub Actions:

1. **1-pull-request.yml** → Lint, typecheck, testes, docker build, SonarCloud
2. **4-e2e-tests.yml** → Testes E2E com Playwright
3. **5-security-scan.yml** → TruffleHog, npm audit, Trivy
4. **6-dependency-check.yml** → OWASP, licencas, npm audit
5. **deploy-to-vm.yml** → Deploy via SSH para VM
6. **diagnose-production.yml** → Diagnostico manual

## Code Quality

| Tool        | Regra                                   |
| ----------- | --------------------------------------- |
| ESLint      | Configuração compartilhada na raiz      |
| Prettier    | Formatacao de codigo                    |
| TypeScript  | strict: true (não null check)           |
| SonarCloud  | Quality gates (80% coverage, ratings A) |
| Trivy       | Container scanning                      |
| TruffleHog  | Detecta secrets em CI (5-security-scan.yml) |

## Segurança

- JWT para autenticação stateless
- Secrets em variaveis de ambiente (.env.production)
- Variáveis de ambiente (dev)
- Trivy para container scanning
- Dependabot para vulnerabilities
- SAST (SonarCloud) para code analysis

## Escalabilidade

### Adicionar novo package

1. Create `packages/NN_novo-servico/`
2. `npm create svelte@latest ...`
3. Extend `tsconfig.json` paths
4. Add Docker service em docker-compose.yml
5. Update CI/CD workflows
6. Document em SUBMODULES.md

### Adicionar novo componente ao design-system

1. Create `packages/design-system/src/components/NovoComponent.svelte`
2. Create `packages/design-system/src/components/NovoComponent.stories.js`
3. Bump version em `packages/design-system/package.json`
4. Update `CHANGELOG.md`
5. `npm publish --workspace=design-system`

## Troubleshooting

### Porta já em uso

```bash
# Kill process na porta (ex: 3000)
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### Docker volume issue

```bash
docker volume prune
npm run docker:down
npm run docker:up
```

### Clean install

```bash
rm -rf node_modules packages/*/node_modules
npm install
```
