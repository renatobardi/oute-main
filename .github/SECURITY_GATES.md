# Implementacao dos Security Gates

## Visao Geral

Este documento descreve os security gates implementados para garantir segurança do código, dependências e infraestrutura em todo o monorepo.

## Verificacoes de Seguranca Implementadas

### 1. SAST - SonarCloud (Estatico)

**Objetivo**: Detectar vulnerabilidades de codigo em tempo de build

**Configuracao**:

- ✅ Executa automaticamente via GitHub App do SonarCloud (nao faz parte do workflow de PR)
- ✅ Falha se houver vulnerabilidades de seguranca criticas
- ✅ Integrado com analise de codigo duplication e code smells

**Vulnerabilidades Detectadas**:

- SQL Injection
- Cross-Site Scripting (XSS)
- Insecure Cryptography
- Hard-coded Credentials
- Command Injection

**Execucao**: Automatica via GitHub App do SonarCloud (analise independente dos workflows)

---

### 2. Dependency Scanning - npm audit

**Objetivo**: Detectar vulnerabilidades em dependencias

**Configuracao**:

```
- CRITICAL: Bloqueia PR ❌
- HIGH: Bloqueia PR ❌
- MODERATE: Aviso ⚠️ (permitido)
- LOW: Permitido ✅
```

**Execucao**:

- Automatica em push para main
- Agendada diariamente (2 AM UTC)

**Remediacao Local**:

```bash
npm audit fix                   # Fix automaticamente
npm audit fix --force          # Fix forcado (pode quebrar compatibilidade)
npm audit                       # Ver todas as vulnerabilidades
```

**Workflow**: `.github/workflows/6-dependency-check.yml`

---

### 3. Trivy Vulnerability Scan (Filesystem)

**Objetivo**: Analise de vulnerabilidades conhecidas em dependencias e codigo-fonte

**Configuracao**:

- Scan do filesystem completo do repositorio
- Severidade: CRITICAL e HIGH
- Resultados em formato SARIF

**Execucao**:

- Automatica em push para main
- Agendada diariamente (2 AM UTC)

**Resultados**:

- Integrado com GitHub Security Advisories (upload SARIF)
- Visivel na aba "Security" do repositorio

**Workflow**: `.github/workflows/5-security-scan.yml`

---

### 4. Secret Scanning

**Objetivo**: Detectar credenciais acidentalmente commitadas

**Ferramentas**:

- `TruffleHog`: Busca por secrets verificados no historico de commits (flag `--only-verified`)

**Deteccoes Comuns**:

- AWS Keys
- GitHub Tokens
- API Keys
- Private Keys
- Database Credentials

**Execucao**:

- Em push para main: scan incremental (base..head)
- Agendado diariamente: scan completo do repositorio

**Workflow**: `.github/workflows/5-security-scan.yml`

---

### 5. Container Image Scanning - Trivy

**Objetivo**: Detectar vulnerabilidades em imagens Docker

**Configuracao**:

- Escaneia imagens dos 4 pacotes em matrix: design-system, 00_dashboard, 01_auth-profile, 02_projects
- Severidade: CRITICAL e HIGH
- Resultados em formato SARIF
- Upload para GitHub Security tab

**Execucao**:

- Automatica em push para main e diariamente

**Workflow**: `.github/workflows/5-security-scan.yml`

---

### 6. Conformidade de Licencas

**Objetivo**: Garantir que apenas licencas permitidas sejam usadas

**Licencas Permitidas**:

- MIT
- Apache-2.0
- BSD (3-Clause)
- ISC
- MPL-2.0

**Execucao**:

- Automatica em PRs que modificam dependencias
- Relatorio gerado em artifact

**Adicionar Licenca**:

```bash
# 1. Propor adição em issue/PR
# 2. Passar por review de segurança
# 3. Adicionar à whitelist em workflow
```

**Workflow**: `.github/workflows/6-dependency-check.yml`

---

## Fluxo de Seguranca

```
Push para main / Agendamento diario
   ↓
[1] TruffleHog Secret Scan ✅
[2] npm audit ✅
[3] Trivy Filesystem Scan ✅ (SARIF)
[4] Trivy Container Scan ✅ (matrix: 4 pacotes, SARIF)
   ↓
Resultados enviados para GitHub Security tab

PR Criada
   ↓
[1] Lint & Format ✅
[2] TypeScript Check ✅
[3] Unit Tests + Coverage ✅
[4] Docker Build ✅
[5] SonarCloud (SAST) ✅ Automatico via GitHub App
   ↓
Status Summary
   ↓
PR Bloqueada ou Aprovada
```

---

## Painel de Seguranca

| Verificacao             | Status                 | Severidade |
| ----------------------- | ---------------------- | ---------- |
| SonarCloud SAST         | ✅ Configurado (GitHub App) | CRITICAL |
| npm audit               | ✅ audit-level=moderate | CRITICAL  |
| Trivy Filesystem        | ✅ Configurado (SARIF) | HIGH       |
| TruffleHog Secrets      | ✅ Configurado         | HIGH       |
| Trivy Container         | ✅ Configurado (SARIF) | CRITICAL   |
| Conformidade de Licenca | ✅ Configurado         | MEDIUM     |

---

## Problemas Comuns e Solucoes

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

### SonarCloud: "Security Hotspot found"

1. Ir para SonarCloud dashboard
2. Revisar o "hotspot"
3. Marcar como revisado com comentário
4. Ou corrigir o código

### Trivy: "CRITICAL vulnerability in image"

```bash
# Ver vulnerabilidades
trivy image --severity CRITICAL my-image:tag

# Solucao: atualizar base image no Dockerfile
# FROM node:18-alpine → FROM node:20-alpine
```

### TruffleHog: "Credential detected"

```bash
# Remover arquivo com tracking
git rm --cached file.env

# Adicionar ao .gitignore
echo "file.env" >> .gitignore

# Renovar credenciais (elas foram expostas)
# Mudar senha, gerar novos tokens, etc
```

---

## Configuracao Local

### Executar Verificacoes de Seguranca Localmente

```bash
# npm audit
npm audit

# TruffleHog (requer instalacao)
trufflehog filesystem ./ --only-verified

# Trivy filesystem scan
trivy fs --severity CRITICAL,HIGH .

# Trivy container scan
trivy image my-image:tag
```

---

## Processo de Escalacao

Se uma verificacao de seguranca falhar:

1. **Entender o risco**: Revisar a vulnerabilidade
2. **Avaliar**: E realmente critico? Ha workaround?
3. **Opcoes**:
   - **Upgrade dependency**: `npm install package@latest`
   - **Patch code**: Corrigir a vulnerabilidade no source
   - **Exception**: Documentar por que e aceitavel (raro)
4. **Testar**: Rodar testes e validar fix
5. **Documentar**: Explicar fix na descricao do PR

---

## Referencias

- [Regras SonarCloud](https://rules.sonarsource.com/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Documentacao npm audit](https://docs.npmjs.com/cli/v9/commands/npm-audit)
- [Documentacao Trivy](https://aquasecurity.github.io/trivy/)
- [TruffleHog](https://github.com/trufflesecurity/trufflehog)
