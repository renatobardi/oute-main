# Security Gates Implementation

## Overview

Este documento descreve os security gates implementados para garantir segurança do código, dependências e infraestrutura em todo o monorepo.

## Security Checks Implementados

### 1. SAST - SonarQube (Estático)

**Objetivo**: Detectar vulnerabilidades de código em tempo de build

**Configuração**:

- ✅ Obrigatório em PRs
- ✅ Falha se houver vulnerabilidades de segurança críticas
- ✅ Integrado com análise de código duplication e code smells

**Vulnerabilidades Detectadas**:

- SQL Injection
- Cross-Site Scripting (XSS)
- Insecure Cryptography
- Hard-coded Credentials
- Command Injection

**Workflow**: `.github/workflows/1-pull-request.yml`

---

### 2. Dependency Scanning - npm audit

**Objetivo**: Detectar vulnerabilidades em dependências

**Configuração**:

```
- CRITICAL: Bloqueia PR ❌
- HIGH: Bloqueia PR ❌
- MODERATE: Aviso ⚠️ (permitido)
- LOW: Permitido ✅
```

**Execução**:

- Automática em PRs que modificam `package.json`
- Agendada semanalmente (segunda-feira 9 AM UTC)

**Remediação Local**:

```bash
npm audit fix                   # Fix automaticamente
npm audit fix --force          # Fix forçado (pode quebrar compatibilidade)
npm audit                       # Ver todas as vulnerabilidades
```

**Workflow**: `.github/workflows/6-dependency-check.yml`

---

### 3. OWASP Dependency Check

**Objetivo**: Análise de vulnerabilidades conhecidas em dependências (CVE database)

**Configuração**:

- Experimental scanning habilitado
- Retired libraries detection habilitado
- Resultados em SARIF format

**Execução**:

- Automática em PRs que modificam `package.json`
- Agendada semanalmente

**Resultados**:

- Integrado com GitHub Security Advisories
- Visível em "Security" tab do repositório

**Workflow**: `.github/workflows/6-dependency-check.yml`

---

### 4. Secret Scanning

**Objetivo**: Detectar credenciais acidentalmente commitadas

**Ferramentas**:

- `git-secrets`: Detecta padrões comuns (AWS keys, tokens, etc)
- `TruffleHog`: Busca por secrets no histórico de commits

**Detecções Comuns**:

- AWS Keys
- GitHub Tokens
- API Keys
- Private Keys
- Database Credentials

**Workflow**: `.github/workflows/5-security-scan.yml`

---

### 5. Container Image Scanning - Trivy

**Objetivo**: Detectar vulnerabilidades em imagens Docker

**Configuração**:

- Bloqueia build de imagens com vulnerabilidades CRITICAL
- Escaneia todas as camadas da imagem
- Inclui dependências de sistema (apt, yum, etc)

**Execução**:

- Automática em PRs com mudanças em Dockerfile

**Workflow**: `.github/workflows/5-security-scan.yml`

---

### 6. License Compliance

**Objetivo**: Garantir que apenas licenses permitidas sejam usadas

**Licenses Permitidas**:

- MIT
- Apache-2.0
- BSD (3-Clause)
- ISC
- MPL-2.0

**Execução**:

- Automática em PRs que modificam dependências
- Relatório gerado em artifact

**Adicionar License**:

```bash
# 1. Propor adição em issue/PR
# 2. Passar por review de segurança
# 3. Adicionar à whitelist em workflow
```

**Workflow**: `.github/workflows/6-dependency-check.yml`

---

## Fluxo de Segurança em PRs

```
PR Criada
   ↓
[1] Lint & Format ✅
[2] TypeScript Check ✅
[3] Unit Tests + Coverage ✅
[4] Docker Build ✅
[5] SonarQube (SAST) ✅ OBRIGATÓRIO
   ↓
Dependabot / Manual Push
   ↓
[6] OWASP Dependency Check ⚙️ (semanal)
[7] npm audit (HIGH/CRITICAL bloqueador) ✅
[8] Secret Scanning ✅
[9] License Check ✅
[10] Trivy Container Scan ✅
   ↓
Status Summary
   ↓
PR Bloqueada ou Aprovada
```

---

## Status Quo - Security Dashboard

| Check                  | Status                 | Severity |
| ---------------------- | ---------------------- | -------- |
| SonarQube SAST         | ✅ Configured          | CRITICAL |
| npm audit              | ✅ HIGH/CRITICAL block | CRITICAL |
| OWASP Dependency Check | ✅ Configured          | HIGH     |
| Secret Scanning        | ✅ Configured          | HIGH     |
| Trivy Container        | ✅ Configured          | CRITICAL |
| License Check          | ✅ Configured          | MEDIUM   |

---

## Common Issues & Fixes

### npm audit: "Found HIGH vulnerability"

```bash
# Ver detalhes
npm audit

# Tentar fix automático
npm audit fix

# Se fix não trabalha, atualizar pacote manualmente
npm install package@latest

# Verificar compatibilidade
npm test
```

### SonarQube: "Security Hotspot found"

1. Ir para SonarCloud dashboard
2. Revisar o "hotspot"
3. Marcar como revisado com comentário
4. Ou corrigir o código

### Trivy: "CRITICAL vulnerability in image"

```bash
# Ver vulnerabilidades
trivy image --severity CRITICAL my-image:tag

# Solução: atualizar base image no Dockerfile
# FROM node:18-alpine → FROM node:20-alpine
```

### git-secrets: "Credential detected"

```bash
# Remover arquivo tracking
git rm --cached file.env

# Adicionar ao .gitignore
echo "file.env" >> .gitignore

# Renovar credenciais (elas foram expostas)
# Mudar senha, gerar novos tokens, etc
```

---

## Configuração Local

### Setup Pre-Commit Hooks

```bash
# Install git-secrets locally
brew install git-secrets  # macOS
apt-get install git-secrets  # Linux

# Setup for this repo
git secrets --install
git secrets --register-aws
```

### Run Security Checks Locally

```bash
# npm audit
npm audit

# SonarQube (requer sonar-scanner)
sonar-scanner \
  -Dsonar.projectKey=oute-main \
  -Dsonar.sources=packages,shared

# Trivy
trivy image my-image:tag
```

---

## Escalation Process

Se um security check falhar:

1. **Entender o risco**: Revisar a vulnerabilidade
2. **Avaliar**: É realmente crítico? Há workaround?
3. **Opções**:
   - **Upgrade dependency**: `npm install package@latest`
   - **Patch code**: Corrigir a vulnerabilidade no source
   - **Exception**: Documentar por que é aceitável (raro)
4. **Testar**: Rodar testes e validar fix
5. **Documentar**: Explicar fix na PR description

---

## References

- [SonarCloud Rules](https://rules.sonarsource.com/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [npm audit documentation](https://docs.npmjs.com/cli/v9/commands/npm-audit)
- [Trivy Documentation](https://aquasecurity.github.io/trivy/)
- [git-secrets](https://github.com/awslabs/git-secrets)
