# Guia de Desenvolvimento

## Setup Local

### 1. Pre-requisitos

- Node.js 20+
- npm 10+
- Docker & Docker Compose
- Git

### 2. Instalacao

```bash
# Clonar repositorio
git clone https://github.com/seu-usuario/oute.git
cd oute

# Instalar todas as dependencias (workspaces)
npm install

# Copiar template de env
cp .env.example .env.local
```

### 3. Iniciar Desenvolvimento

**Opcao A: Com Docker (Recomendado)**

```bash
npm run docker:up
```

Servicos disponiveis:

- Home (Landing Page): http://localhost:3003
- Dashboard: http://localhost:3000
- Interview (Chat): http://localhost:3002
- Auth API: http://localhost:3001
- PostgreSQL: localhost:5432
- Design System: http://localhost:6006

**Opcao B: Local sem Docker**

```bash
npm run dev

# Em terminais separados:
cd packages/99_home && npm run dev          # Port 3003 (landing page)
cd packages/00_dashboard && npm run dev     # Port 3000 (main interface)
cd packages/03_interview && npm run dev     # Port 3002 (chat interviews)
cd packages/01_auth-profile && npm run dev  # Port 3001 (auth API)
cd packages/02_projects && npm run dev      # Port 3004 (projects API)
```

## Novos Pacotes (03_interview & 99_home)

### 03_interview - Interface de Chat para Entrevistas com IA

**Porta**: 3002
**Tipo**: Frontend (SvelteKit)

Layout de 3 paineis para conduzir entrevistas via chat com IA:
- **Esquerda**: Barra lateral com historico de entrevistas
- **Centro**: Janela de conversa do chat
- **Direita**: Notas editaveis com metricas e exportacao

```bash
cd packages/03_interview
npm run dev          # Iniciar servidor de dev
npm run build        # Build para producao
npm run test         # Executar testes
npm run test:e2e     # Executar testes E2E
```

**Componentes**:
- ChatMessage, ChatInput, ChatWindow (UI do chat)
- Sidebar, InterviewHeader (navegacao)
- NotesPanel, MetricBadge (notas e metricas)

**Funcionalidades**:
- Chat em tempo real com respostas de IA (simulado)
- Notas editaveis com salvar/cancelar
- Exportar notas como arquivo .txt
- Metricas de progresso e tags
- Layout responsivo de 3 paineis

### 99_home - Landing Page de Marketing

**Porta**: 3003
**Tipo**: Frontend (SvelteKit)

Landing page publica para a plataforma OUTE AI architect:
- Secao hero com CTA
- Busca por descricao de projeto
- Opcao de login com GitHub
- Exibicao de estatisticas (57, 127, ∞)

```bash
cd packages/99_home
npm run dev          # Iniciar servidor de dev
npm run build        # Build para producao
npm run test         # Executar testes
npm run test:e2e     # Executar testes E2E
```

**Componentes**:
- Navbar (logo, links, cadastro)
- HeroSection (titulo, subtitulo)
- SearchInput (descricao do projeto)
- CTAButton, GithubLink (chamadas para acao)
- StatCard, StatsSection (exibicao de metricas)

**Funcionalidades**:
- Design responsivo (mobile-first)
- Tema escuro (cores cyan/teal)
- Otimizado para SEO
- Acesso publico (sem autenticacao necessaria)

## Scripts

### Nivel raiz

```bash
npm run dev              # Todos os pacotes em modo dev
npm run build            # Build de todos os pacotes
npm run test             # Testes de todos os pacotes
npm run lint             # ESLint + verificacao TypeScript
npm run format           # Formatacao Prettier

npm run docker:up        # Iniciar servicos Docker
npm run docker:down      # Parar servicos Docker
npm run docker:logs      # Ver logs
npm run docker:build     # Reconstruir imagens

npm run storybook:design-system  # Iniciar Storybook do design-system
```

### Por pacote

```bash
cd packages/00_dashboard
npm run dev              # Servidor de dev
npm run build            # Build para producao
npm run preview          # Visualizar app construido

npm run lint             # Lint deste pacote
npm run format           # Formatar este pacote
npm run test             # Testar este pacote
```

## Pre-commit Hooks

Pre-commit hooks nao estao configurados neste projeto. Para garantir qualidade antes de commitar, execute manualmente:

```bash
npm run lint          # ESLint
npm run format        # Prettier
npm run test          # Testes
```

## Depuracao

### Ver logs

```bash
npm run docker:logs

# Ou servico especifico
docker logs oute-dashboard -f
```

### Banco de Dados

```bash
# Conectar ao PostgreSQL
psql -h localhost -U app-user -d oute_db

# Listar tabelas
\dt

# Ver dados
SELECT * FROM users;
```

### DevTools do Navegador

SvelteKit inclui Svelte DevTools em desenvolvimento.

## Criando Funcionalidades

### 1. Criar branch

```bash
git checkout -b feature/my-feature develop
```

### 2. Fazer alteracoes

Editar arquivos, testar localmente, etc.

### 3. Commit

```bash
git commit -m "feat(dashboard): add new button component"
```

**Tipos de commit**: feat, fix, docs, style, refactor, test, chore, ci

### 4. Push & PR

```bash
git push origin feature/my-feature
```

Abrir PR no GitHub para a branch `develop`.

### 5. Merge

Apos revisoes e verificacoes passarem:

```bash
git checkout develop
git pull
git merge --squash feature/my-feature
git commit -m "feat: merge new feature"
git push
```

## Desenvolvimento do Design System

### Adicionar um novo componente

```bash
# Criar arquivo do componente
touch packages/design-system/src/components/MyComponent.svelte
```

**MyComponent.svelte**

```svelte
<script lang="ts">
  export let variant: 'primary' | 'secondary' = 'primary';
  export let disabled = false;
</script>

<button class="my-component" {variant} {disabled}>
  <slot />
</button>

<style>
  .my-component { ... }
</style>
```

### Criar historia no Storybook

```bash
touch packages/design-system/src/components/MyComponent.stories.js
```

**MyComponent.stories.js**

```svelte
<script>
  import MyComponent from '../src/components/MyComponent.svelte';
</script>

<Meta title="Components/MyComponent" />

<Story name="Primary">
  <MyComponent variant="primary">Click me</MyComponent>
</Story>

<Story name="Disabled">
  <MyComponent disabled>Disabled</MyComponent>
</Story>
```

### Publicar nova versao

```bash
cd packages/design-system

# Atualizar versao no package.json
# v1.0.0 → v1.0.1 (patch)
# v1.0.0 → v1.1.0 (minor - novos componentes)
# v1.0.0 → v2.0.0 (major - breaking changes)

# Atualizar CHANGELOG.md

npm publish
```

## Testes

### Executando Testes

**Executar todos os testes:**

```bash
npm run test
```

**Executar testes em modo watch (desenvolvimento local):**

```bash
npm run test -- --watch
```

**Executar testes com relatorio de cobertura:**

```bash
npm run test -- --run --coverage
```

### Convencoes de Arquivos de Teste

Os testes ficam em arquivos `src/**/*.test.ts`:

- `src/components/Button.test.ts` - Testes de componentes
- `src/utils/helpers.test.ts` - Testes de funcoes utilitarias
- `src/services/auth.test.ts` - Testes de servicos/API

**Nota:** Testes E2E (\*.spec.ts) sao separados e executados com Playwright.

### Requisitos de Cobertura

Todos os PRs devem manter **cobertura minima de 80%** em todos os pacotes:

- **Linhas:** 80%
- **Branches:** 75%
- **Funcoes:** 80%
- **Declaracoes:** 80%

A cobertura e verificada por:

1. Verificacao local antes de commitar: `npm run test -- --run --coverage`
2. Verificacoes de PR no GitHub Actions
3. Analise de quality gate do SonarCloud

**O que e excluido da cobertura:**

- `node_modules/`
- Diretorios `dist/`, `build/`
- Os proprios arquivos de teste (_.test.ts, _.spec.ts)
- Arquivos index (index.ts)

### Testes E2E com Playwright

Testes E2E verificam fluxos criticos do usuario em toda a aplicacao.

**Executar testes E2E:**

```bash
npm run test:e2e
```

**Formato de arquivo de teste E2E:** `src/**/*.spec.ts`

Exemplo de estrutura de teste E2E:

```typescript
// src/auth/login.spec.ts
import { test, expect } from '@playwright/test';

test('User can login and access dashboard', async ({ page }) => {
  await page.goto('http://localhost:3000/auth/login');
  await page.fill('input[name="email"]', 'user@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button:has-text("Login")');

  await expect(page).toHaveURL('http://localhost:3000/dashboard');
  await expect(page.locator('h1')).toContainText('Dashboard');
});
```

Fluxos criticos para testar:

- Autenticacao (login, logout, redefinicao de senha)
- Carregamento e renderizacao do Dashboard
- Operacoes CRUD de projetos
- Tratamento de erros e validacao

### Antes de Abrir um Pull Request

**SEMPRE execute estes comandos localmente:**

```bash
# 1. Executar testes com cobertura
npm run test -- --run --coverage

# 2. Verificar porcentagem de cobertura
# Visualizar em coverage/index.html ou na saida do terminal

# 3. Se cobertura < 80%, adicionar testes para linhas nao cobertas

# 4. Executar linter
npm run lint

# 5. Executar formatador
npm run format

# 6. Build do projeto
npm run build

# 7. Somente apos tudo passar, commitar e enviar
git commit -m "feat: descricao da funcionalidade"
git push origin feature/sua-feature
```

### Padroes de Qualidade no CI/CD

Ao abrir um PR, o GitHub Actions executa automaticamente:

✅ **Verificacoes de Qualidade de Codigo:**

- ESLint com regras rigorosas
- Formatacao de codigo com Prettier
- Verificacoes de modo estrito do TypeScript

✅ **Verificacao de Cobertura de Testes:**

- Todos os testes devem passar
- Cobertura deve ser ≥80% em codigo novo
- SonarCloud analisa a cobertura

✅ **Varreduras de Seguranca:**

- npm audit para vulnerabilidades (bloqueia em HIGH/CRITICAL)
- Varredura de segredos para credenciais
- OWASP Dependency Check
- Analise de seguranca do SonarCloud

✅ **Quality Gate do SonarCloud (OBRIGATORIO):**

- Nota geral: A- ou melhor
- Classificacao de seguranca: A
- Classificacao de confiabilidade: A
- Classificacao de manutenibilidade: A
- Duplicacao de codigo: <3%
- Sem code smells criticos
- Sem vulnerabilidades

**Se qualquer verificacao falhar, seu PR nao podera ser mergeado.** Veja [QUALITY_STANDARDS.md](./QUALITY_STANDARDS.md) para requisitos detalhados de qualidade e solucao de problemas.

### Depurando Testes

**Depurar um arquivo de teste especifico:**

```bash
npm run test -- src/utils/helpers.test.ts --watch
```

**Depurar com saida detalhada:**

```bash
npm run test -- --reporter=verbose
```

**Visualizar detalhes da cobertura:**

```bash
# Apos executar teste com cobertura
open coverage/index.html
```

**Problemas comuns em testes:**

- Timeout de teste: Aumentar timeout na configuracao do vitest ou no arquivo de teste
- Erros de import: Verificar se os tipos @oute/shared estao exportados corretamente
- Falhas de assertion: Revisar saida do teste para valores exatos vs. esperados
- Instabilidade em testes E2E: Adicionar condicoes waitFor, aumentar timeouts

## Referencia de Padroes de Qualidade

Este projeto aplica padroes rigorosos de qualidade e seguranca de codigo. Todos os PRs devem atender aos requisitos detalhados em [QUALITY_STANDARDS.md](./QUALITY_STANDARDS.md).

### Checklist Rapido Antes do PR

- ✅ Cobertura de codigo ≥80% localmente (`npm run test -- --run --coverage`)
- ✅ Todos os erros de lint corrigidos (`npm run lint`)
- ✅ Codigo formatado (`npm run format`)
- ✅ Build bem-sucedido (`npm run build`)
- ✅ Sem declaracoes console.log (ESLint bloqueia)
- ✅ Sem tipos `any` no TypeScript (ESLint bloqueia)
- ✅ Todos os imports utilizados (sem variaveis nao usadas)
- ✅ Sem vulnerabilidades de seguranca (`npm audit`)

Se qualquer um destes falhar localmente, corrija antes de enviar. O GitHub Actions aplicara todos estes alem de varreduras adicionais de seguranca e qualidade.

Para informacoes detalhadas sobre:

- Quality gates e limites → [QUALITY_STANDARDS.md](./QUALITY_STANDARDS.md)
- Analise do SonarCloud → [QUALITY_STANDARDS.md](./QUALITY_STANDARDS.md#sonarqube-analysis)
- Varredura de seguranca → [QUALITY_STANDARDS.md](./QUALITY_STANDARDS.md#security-scanning)
- Solucao de problemas em verificacoes falhas → [QUALITY_STANDARDS.md](./QUALITY_STANDARDS.md#troubleshooting-common-issues)

## Seguranca de Tipos

Verificar TypeScript em todos os pacotes:

```bash
npm run lint  # inclui tsc --noEmit
```

Importar tipos compartilhados:

```typescript
import type { User, Project } from '@oute/shared';
```

## Solucao de Problemas

### Porta ja em uso

```bash
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### Node modules corrompidos

```bash
rm -rf node_modules packages/*/node_modules
npm install
```

### Problemas com Docker

```bash
docker-compose down -v
npm run docker:up
```

### Verificacao de qualidade antes de commitar

Execute estes comandos antes de commitar:

```bash
npm run lint      # ESLint
npm run format    # Prettier
npm run test      # Testes
```

## Dicas de Performance

1. **Usar npm workspaces corretamente**
   - Dependencias instaladas uma vez na raiz
   - Evitar instalacoes duplicadas

2. **Cache do Docker**
   - Usar Dockerfile multi-stage
   - Colocar dependencias nas primeiras camadas

3. **Otimizacao do SvelteKit**
   - Usar `+server.ts` para rotas de API
   - Implementar carregamento de dados adequado
   - Habilitar modo auto do Adapter

## Pipeline CI/CD

### Deploy Automatico (GitHub Actions)

Cada push para `main` dispara deploy automatico via SSH:

```
git push origin main
    ↓
✓ SSH para VM GCP
    ├─ git pull (oute-main e oute-mind)
    ├─ docker compose build
    └─ docker compose up
    ↓
✓ Caddy restart
    ↓
✓ Health checks (20 tentativas, 3s intervalo)
    ├─ Dashboard (porta 3000)
    ├─ Auth (porta 3001)
    ├─ Projects (porta 3004)
    ├─ Home (porta 3003)
    └─ Interview (porta 3002)
    ↓
✅ Live em producao!
```

### Antes de Enviar para main

Sempre garanta que o codigo atende aos padroes de qualidade antes de enviar:

```bash
# 1. Executar testes com cobertura (DEVE ser ≥80%)
npm run test -- --run --coverage

# 2. Verificar saida de cobertura de testes
# Se < 80%, adicionar mais testes antes de prosseguir

# 3. Executar linter (TODOS os erros devem ser corrigidos)
npm run lint

# 4. Executar formatador
npm run format

# 5. Build de todos os pacotes
npm run build

# 6. Se todas as verificacoes passarem, criar PR ao inves de enviar diretamente
git commit -m "feat: nova funcionalidade"
git push origin feature/sua-feature

# 7. Abrir PR para branch develop/staging
# Aguardar o GitHub Actions executar todas as verificacoes
# Corrigir quaisquer verificacoes que falharem
# Solicitar revisao da equipe
```

**Nunca envie diretamente para `main`** - sempre use branches de feature e abra PRs para revisao de codigo.

### Rollback em Producao

Se algo der errado em producao:

```bash
# SSH para a VM
ssh user@<VM_IP>

# Ver logs dos containers
docker compose logs --tail=50

# Reverter para versao anterior
git log --oneline -5
git checkout <commit-anterior>
docker compose build && docker compose up -d
```

## Recursos

- [Documentacao SvelteKit](https://kit.svelte.dev)
- [Documentacao Svelte 5](https://svelte.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [SonarCloud](https://sonarcloud.io)
- [Documentacao do Pipeline CI/CD](./.github/CI_CD_PIPELINE.md)
- [Deploy na VM](./VM_DEPLOYMENT.md)
- [Documentacao GitHub Actions](https://docs.github.com/en/actions)
