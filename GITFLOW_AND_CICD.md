# 🔄 GitFlow & CI/CD Pipeline - Guia Completo

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Branches e Estratégia](#branches-e-estratégia)
3. [Fluxo de Trabalho](#fluxo-de-trabalho)
4. [Quality Gates](#quality-gates)
5. [CI/CD Automatizado](#cicd-automatizado)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

Este projeto segue um **fluxo simplificado baseado em GitFlow** com foco em:
- ✅ **Qualidade**: Todos os PRs passam por quality gates automáticos
- ✅ **Segurança**: Scanning de vulnerabilidades e secrets
- ✅ **Automação**: Deploy automático para produção ao fazer merge em `main`
- ✅ **Rastreabilidade**: Tags de release, commits atômicos, e histórico limpo

```
┌─────────────────────────────────────────────────────────┐
│                    FLUXO VISUAL                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. Cria branch                                         │
│     feature/my-feature                                  │
│            │                                            │
│            ▼                                            │
│  2. Faz commits                                         │
│     Trabalha localmente                                 │
│            │                                            │
│            ▼                                            │
│  3. Abre PR para develop                                │
│     GitHub Actions roda automaticamente                 │
│            │                                            │
│            ▼                                            │
│  4. Quality Gates (automático)                          │
│     ✓ Lint, TypeScript, Tests                           │
│     ✓ Security, Dependencies, Coverage                  │
│            │ (tudo passou?)                             │
│            ▼                                            │
│  5. Code Review                                         │
│     Mínimo 1 aprovação                                  │
│            │                                            │
│            ▼                                            │
│  6. Merge para develop                                  │
│     Squash + Merge recomendado                          │
│            │                                            │
│            ▼                                            │
│  7. (Opcional) Merge develop → staging                  │
│     Para staging/UAT                                    │
│            │                                            │
│            ▼                                            │
│  8. (Opcional) Merge staging → main                     │
│     Ou merge feature → main (hotfixes)                  │
│            │                                            │
│            ▼                                            │
│  9. AUTO-DEPLOY para Produção! 🚀                      │
│     GitHub Actions dispara deploy automático            │
│     VM em GCP recebe atualização                        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🌳 Branches e Estratégia

### 1. **Branches Principais**

| Branch | Propósito | Deploy | Notes |
|--------|-----------|--------|-------|
| **main** | 🚀 Produção | ✅ Auto | Auto-deploy em push. Merge protegido. |
| **staging** | 🧪 Pre-produção | Manual | Teste antes de subir para main. |
| **develop** | 🔨 Integração | ❌ Não | Destino de todos os PRs de feature. |

### 2. **Branches de Trabalho** (temporários, deletados após merge)

```
feature/short-description     ← Novas features
fix/short-description         ← Bug fixes
docs/short-description        ← Documentação
refactor/short-description    ← Refactoring
test/short-description        ← Testes
chore/short-description       ← Manutenção
ci/short-description          ← CI/CD improvements
sec/short-description         ← Security fixes
```

**Exemplos reais:**
```
feature/add-chat-ai-integration
fix/dashboard-loading-bug
docs/update-deployment-guide
refactor/extract-auth-module
test/add-e2e-tests-for-auth
```

### 3. **Convenção de Nomes**

✅ **Bom:**
```
feature/user-authentication
fix/profile-image-upload
docs/api-endpoints
```

❌ **Ruim:**
```
feature/stuff
fix/bug
my-branch
```

---

## 🔄 Fluxo de Trabalho Passo a Passo

### **Cenário 1: Feature Nova**

#### Passo 1: Setup
```bash
# Atualizar develop localmente
git checkout develop
git pull origin develop

# Criar feature branch
git checkout -b feature/add-dark-mode
```

#### Passo 2: Desenvolver
```bash
# Editar arquivos, fazer testes locais
# ...

# Antes de commitar, rodar localmente:
npm run lint      # ESLint check
npm run format    # Prettier format
npm run test      # Unit tests
npm run build     # Build para detectar erros TS

# Se tudo passou, commitar
git add .
git commit -m "feat(ui): add dark mode toggle to settings"

# Se houver mais trabalho:
git commit -m "feat(ui): add theme persistence to localStorage"
```

#### Passo 3: Push e PR
```bash
# Push para remote
git push -u origin feature/add-dark-mode

# Abrir PR no GitHub (desenvolve UI vai aparecer)
# Título: "Add dark mode toggle"
# Descrição: explica o que mudou e por quê
# Referencia issue: "Closes #123"
```

#### Passo 4: CI/CD Automático
```
GitHub Actions executam automaticamente:
 ✓ ESLint check
 ✓ Prettier check
 ✓ TypeScript check
 ✓ Unit tests + coverage
 ✓ Security scan
 ✓ Docker build
 ✓ E2E tests (se houver)
```

Se algum falhar, **volta ao Passo 2** para corrigir.

#### Passo 5: Code Review
- Mínimo 1 aprovação requerida
- Resolver comentários em novos commits (não force push)

#### Passo 6: Merge
```bash
# No GitHub, clique em "Squash and merge"
# Isso compacta todos os commits em 1 com a mensagem principal

# GitHub deleta branch automaticamente
# Localmente, limpar:
git checkout develop
git pull origin develop
git branch -d feature/add-dark-mode
```

---

### **Cenário 2: Hotfix (Bug em Produção)**

#### Quando usar hotfix?
- Bug crítico encontrado em produção
- Precisa de fix imediato
- Não pode esperar pelo desenvolvimento normal

#### Passo 1: Criar hotfix de `main`
```bash
# Criar branch direto de main
git checkout main
git pull origin main
git checkout -b fix/critical-auth-bug
```

#### Passo 2: Corrigir
```bash
# Implementar fix
# Testar localmente
npm run lint && npm run test && npm run build

git commit -m "fix(auth): prevent token expiration on page refresh"
git push -u origin fix/critical-auth-bug
```

#### Passo 3: PR para `main` (não para develop!)
```bash
# Abrir PR diretamente para main
# Titlo: "Hotfix: Prevent token expiration on page refresh"
```

#### Passo 4: Fast-track
- Review rápido (pode pular alguns testes se urgente)
- Merge para main
- Auto-deploy acontece automaticamente! 🚀

#### Passo 5: Sincronizar develop
```bash
# Depois que hotfix está em main, mergear em develop também
git checkout develop
git pull origin develop
git merge main --no-edit
git push origin develop
```

---

### **Cenário 3: Release (Atualizações maiores)**

#### Quando fazer release?
- Feature pronta para ser testada em staging
- Agrupamento de várias features
- Teste em ambiente de pre-produção

#### Passo 1: Criar release branch de develop
```bash
git checkout develop
git pull origin develop
git checkout -b release/v1.2.0

# Atualizar versão no package.json
npm version minor  # ou patch/major
git push -u origin release/v1.2.0
```

#### Passo 2: Merge em staging para teste
```bash
# Fazer PR release → staging
# Testar em staging completamente

# Depois de confirmado:
git checkout staging
git pull origin staging
git merge release/v1.2.0
git push origin staging
```

#### Passo 3: Merge em main para produção
```bash
git checkout main
git pull origin main
git merge release/v1.2.0
git tag v1.2.0
git push origin main
git push origin v1.2.0

# Auto-deploy dispara! 🚀
```

#### Passo 4: Sincronizar develop
```bash
git checkout develop
git pull origin develop
git merge main --no-edit
git push origin develop
```

---

## ✅ Quality Gates (Automático)

Quando você abre um PR, **todos esses testes rodamautomaticamente** no GitHub Actions:

### 1. **Code Quality**
```bash
✓ ESLint check        # Erros de linting
✓ Prettier check      # Formatação
✓ TypeScript check    # Erros de tipo
```

Se falhar → **Falha no CI** → PR precisa de fix

Corrigir:
```bash
npm run lint      # Ver erros
npm run format    # Auto-corrigir formatação
npm run lint -- --fix  # Auto-corrigir lint
git add . && git commit -m "fix: eslint errors"
git push
```

### 2. **Tests**
```bash
✓ Unit tests with coverage (70%+ requerido)
✓ E2E tests (em packages específicos)
```

Se falhar → **Falha no CI** → PR precisa de testes corrigidos

```bash
npm run test           # Rodar testes
npm run test -- --coverage  # Ver cobertura
```

### 3. **Security**
```bash
✓ Secret scanning     (TruffleHog)
✓ Dependency scan     (npm audit)
✓ Container scan      (Trivy)
✓ License check       (Apache, MIT, BSD only)
```

Se falhar → **Falha no CI** → PR bloqueado

Corrigir:
```bash
npm audit fix         # Auto-corrigir vulnerabilidades
npm audit             # Ver o que ficou
```

### 4. **Code Coverage (SonarCloud)**
```bash
✓ Grade A- mínimo
✓ Cobertura ≥ 80%
✓ Sem vulnerabilidades críticas
```

---

## 🚀 CI/CD Automatizado

### **Quando Deploy Acontece?**

#### Automático (main branch)
```
Você faz git push para main
    ↓
GitHub Actions detecta push
    ↓
Roda todos os quality gates
    ↓
Se tudo passar:
    ├─ Build Docker image
    ├─ Push para Artifact Registry (GCP)
    ├─ Deploy para VM (gcloud compute ssh)
    ├─ Health checks
    └─ Create GitHub Release ✅

Seu código está em PRODUÇÃO!
```

#### Manual (workflow_dispatch)
```bash
# Se quiser fazer deploy manualmente:
# GitHub → Actions → "Deploy oute-main to oute-mind VM" → Run workflow
```

### **Pipeline Visual**

```
┌─────────────────────────────────────────────────────────┐
│          GitHub Actions CI/CD Pipeline                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  STEP 1: Pull Request Checks (5-10 minutos)           │
│  ┌──────────────────────────────────────────────────┐  │
│  │ • Checkout code                                 │  │
│  │ • Install dependencies                          │  │
│  │ • ESLint (lint check)                           │  │
│  │ • Prettier (format check)                       │  │
│  │ • TypeScript (type check)                       │  │
│  │ • vitest (unit tests + coverage)                │  │
│  │ • SonarCloud (code quality)                     │  │
│  │ • Security scan (secrets, vulns)                │  │
│  │ • npm audit (dependencies)                      │  │
│  │ • License compliance                            │  │
│  │ • Docker build (test image)                     │  │
│  └─────────────────┬──────────────────────────────┘  │
│                   │                                   │
│   ❌ Failed? → Precisa de fix na feature branch      │
│   ✅ Passed? → Continua...                          │
│                   │                                   │
│  STEP 2: Code Review (manual)                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ • PR approval (1+ review requerido)             │  │
│  │ • Discussions/feedback                          │  │
│  │ • Commits para resolver feedback                │  │
│  └─────────────────┬──────────────────────────────┘  │
│                   │                                   │
│   ✅ Approved? → Continua...                        │
│                   │                                   │
│  STEP 3: Merge to Develop                            │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Squash + Merge (recomendado)                     │  │
│  │ → 1 commit limpo no histórico                    │  │
│  └─────────────────┬──────────────────────────────┘  │
│                   │                                   │
│  STEP 4: (OPCIONAL) Merge to Staging                 │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Para testar antes de produção                    │  │
│  └─────────────────┬──────────────────────────────┘  │
│                   │                                   │
│  STEP 5: Merge to Main (PRODUÇÃO!)                   │
│  ┌──────────────────────────────────────────────────┐  │
│  │ • Todos quality gates rodam novamente            │  │
│  │ • Docker build (image final)                     │  │
│  │ • Push para Artifact Registry                    │  │
│  │ • Deploy para VM (gcloud ssh)                    │  │
│  │ • Health checks                                 │  │
│  │ • Create GitHub Release                         │  │
│  │ • Cleanup                                       │  │
│  └─────────────────┬──────────────────────────────┘  │
│                   │                                   │
│   ✅ Deployed? → Production is running!             │
│                                                     │
│  ❌ Failed? → Investigate logs, fix, retry         │
│                                                     │
└─────────────────────────────────────────────────────────┘
```

### **Logs e Monitoramento**

Ver status do workflow:
```bash
# Listar últimos runs
gh run list --repo renatobardi/oute-main --limit 10

# Ver logs de um workflow específico
gh run view <RUN_ID> --log

# Ver apenas erros
gh run view <RUN_ID> --log-failed

# Aguardar conclusão
gh run watch <RUN_ID>
```

---

## 📊 Quality Standards (Todos Obrigatórios)

| Critério | Padrão | Tool | Falha? |
|----------|--------|------|--------|
| ESLint | Sem erros | ESLint | ❌ Bloqueia |
| Prettier | Formatado | Prettier | ❌ Bloqueia |
| TypeScript | Sem erros | tsc | ❌ Bloqueia |
| Tests | 70%+ coverage | vitest | ❌ Bloqueia |
| SonarCloud | Grade A- | SonarCloud | ❌ Bloqueia |
| npm audit | Sem HIGH/CRITICAL | npm | ❌ Bloqueia |
| Secrets | Nenhum secret | TruffleHog | ❌ Bloqueia |
| License | MIT/Apache/BSD | FOSSA | ❌ Bloqueia |
| Docker | Build success | docker build | ❌ Bloqueia |

**Se qualquer um falhar, o PR não pode ser mergeado.**

---

## 🛠️ Troubleshooting

### **ESLint falha**

```bash
# Ver erros
npm run lint

# Auto-corrigir
npm run lint -- --fix
npm run format

# Commitar
git add . && git commit -m "fix: eslint violations"
git push
```

### **TypeScript falha**

```bash
# Ver erros
npm run build

# Corrigir tipos no código
# (não há auto-fix para tipos)

git add . && git commit -m "fix: typescript errors"
git push
```

### **Tests falham**

```bash
# Rodar localmente
npm run test

# Se cobertura baixa:
npm run test -- --coverage

# Escrever testes para novas linhas
# Resubmeter

git add . && git commit -m "test: add missing coverage"
git push
```

### **npm audit falha**

```bash
# Ver vulnerabilidades
npm audit

# Tentar auto-fix
npm audit fix

# Se ainda houver issues, atualizar manualmente
npm install package-name@latest

git add . && git commit -m "fix: update vulnerable dependencies"
git push
```

### **Deploy falha em main**

```bash
# Ver logs detalhados
gh run view <RUN_ID> --log

# Procurar por "Error" ou "Permission denied"

# Causas comuns:
# - Secrets não configurados
# - Service account sem permissões
# - Health check timeout
# - Docker image não faz build

# Corrigir localmente
npm run build
docker build -t test .

# Se build OK, o problema é no CI
# Verificar .github/workflows/deploy-to-vm.yml
```

### **Merge conflict**

```bash
# Atualizar com develop
git fetch origin
git merge origin/develop

# Resolver conflitos manualmente em seu editor

# Testar novamente
npm run lint && npm run test

# Commitar resolução
git add .
git commit -m "fix: resolve merge conflicts with develop"
git push
```

---

## 💡 Best Practices

### ✅ Faça:

1. **Commits atômicos**
   ```bash
   # Bom: cada commit faz uma coisa
   git commit -m "feat: add dark mode"
   git commit -m "test: add dark mode tests"
   git commit -m "docs: update dark mode docs"

   # Ruim: tudo em um commit
   git commit -m "did a bunch of stuff"
   ```

2. **Nomes de branch descritivos**
   ```bash
   git checkout -b feature/add-payment-integration
   git checkout -b fix/memory-leak-in-chatbox
   ```

3. **Testes antes de push**
   ```bash
   npm run lint && npm run format && npm run test && npm run build
   git push
   ```

4. **PRs pequenos e focados**
   - Máximo 400 linhas de mudança
   - Uma feature por PR
   - Mais fácil reviewar

5. **Mensagens descritivas**
   ```bash
   git commit -m "feat(auth): add JWT refresh token mechanism

   - Implement /refresh-token endpoint in auth service
   - Add refresh token to localStorage
   - Automatically refresh before expiration

   Closes #42"
   ```

### ❌ Não faça:

1. **Force push para main/develop**
   ```bash
   git push --force origin main  # ❌ NUNCA!
   ```

2. **Commits com "wip" ou "test"**
   ```bash
   git commit -m "wip"        # ❌
   git commit -m "fix again"  # ❌
   ```

3. **Mergear sem quality gates passing**
   ```bash
   # Seu PR tem X falhas de CI?
   # Não pode fazer merge até passar tudo! ✅
   ```

4. **Esquecer de sincronizar develop**
   ```bash
   # Se você mergear em main, sempre sincronize develop:
   git checkout develop && git merge main && git push
   ```

---

## 📚 Referências Rápidas

### Comandos Frequentes

```bash
# Setup inicial
git clone https://github.com/renatobardi/oute-main.git
cd oute-main
npm install
npm run dev

# Workflow típico
git checkout develop
git pull origin develop
git checkout -b feature/minha-feature

# Editar arquivos...

npm run lint && npm run format && npm run test && npm run build
git add .
git commit -m "feat(scope): descrição"
git push -u origin feature/minha-feature

# Depois de PR mergeado:
git checkout develop
git pull origin develop
git branch -d feature/minha-feature
git push origin --delete feature/minha-feature
```

### Arquivos Importantes

- `.github/workflows/` - Definição de todos os workflows
- `package.json` - Scripts npm (lint, test, build, etc)
- `.eslintrc.json` - Regras de linting
- `.prettierrc` - Formatação de código
- `contributing.md` - Guia de contribuição (este arquivo expande aquele)

---

**Última atualização:** 2026-03-12

Dúvidas? Revise este guia ou abra uma issue no GitHub! 🚀
