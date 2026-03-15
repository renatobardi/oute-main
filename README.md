# oute-main

Frontend monorepo da plataforma **Oute** — interface de estimativa de software assistida por IA.

Este repositório contém exclusivamente as interfaces SvelteKit. O backend, banco de dados de produção, orquestrador e IA estão no repositório [`oute-mind`](https://github.com/oute-mind/oute-mind).

---

## Packages

| Package | Porta (dev) | Descrição |
|---|---|---|
| `design-system` | 6006 | Componentes base + tema Tailwind (Storybook) |
| `99_home` | 3003 | Landing page |
| `00_dashboard` | 3000 | Dashboard principal |
| `01_auth-profile` | 3001 | Autenticação e perfil |
| `02_projects` | 3005 | Gestão de projetos |
| `03_interview` | 3002 | Chat de entrevista com IA |
| `98_oops` | 3004 | Página de erro (fallback 404) |
| `97_admin` | — | Painel admin (em desenvolvimento) |

---

## Desenvolvimento local

**Pré-requisitos:** Node.js 20, npm 10+, Docker

```bash
# 1. Instalar dependências
npm install --legacy-peer-deps

# 2. Subir o banco de dados
docker compose up -d postgres

# 3. Aplicar migrations e seeds
npm run db:migrate
npm run db:seed

# 4. Rodar todos os packages em paralelo
npm run dev
```

Para rodar um package individualmente:

```bash
npm run dev -w packages/03_interview
```

Para rodar o stack completo em containers:

```bash
npm run docker:build
npm run docker:up
npm run docker:logs
```

### Banco de dados (utilitários)

```bash
npm run db:migrate          # Aplicar migrations pendentes
npm run db:migrate:status   # Ver status das migrations
npm run db:migrate:rollback # Reverter última migration
npm run db:seed             # Inserir dados de desenvolvimento
npm run db:reset            # Reset completo (cuidado)
npm run db:validate         # Validar schema
```

---

## Stack tecnológica

| Camada | Tecnologia | Versão |
|---|---|---|
| Runtime | Node.js | 20 |
| Framework | SvelteKit | 2 |
| UI | Svelte | 5 |
| Linguagem | TypeScript | 5 |
| Estilização | Tailwind CSS | 4 |
| Build | Vite | 5 |
| Banco (dev) | PostgreSQL | 15 (Docker) |
| Auth | Firebase | 11 |
| JWT | jose / jsonwebtoken | 5 / 9 |
| Testes unitários | Vitest | 1 |
| Testes E2E | Playwright | 1.45 |
| Lint / Format | ESLint + Prettier | 8 / 3 |

---

## CI/CD

O deploy é acionado automaticamente em cada push para `main`.

Pipeline: GitHub Actions → `gcloud compute ssh` via IAP → GCP VM `oute-mind` (projeto `oute-mind`) → `docker compose build --no-cache` + `docker compose up -d`.

Para diagnóstico manual de produção, acione o workflow `Diagnose Production Issues` no GitHub Actions.

---

## Documentação

```
docs/
├── adr/          # Decisões de arquitetura (o "porquê")
└── architecture/ # Diagramas e fluxos (o "como")
```
