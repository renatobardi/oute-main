# Pipeline de CI/CD

## Visao Geral

O repositorio possui 6 workflows do GitHub Actions que cobrem validacao de PRs, testes end-to-end, seguranca, verificacao de dependencias, deploy em VM e diagnostico de producao.

## Diagrama do Pipeline

```
                        FLUXO DE PULL REQUEST
                        =====================

  ┌──────────────────┐
  │   PR aberto para │
  │ develop/staging/ │
  │      main        │
  └────────┬─────────┘
           │
           ▼
  ┌────────────────────────────────────────────┐
  │  1-pull-request.yml                        │
  │  ──────────────────────────────────────    │
  │  lint (ESLint + Prettier)                  │
  │  typecheck (por workspace)                 │
  │  test (Vitest + coverage)                  │
  │  docker-build (4 packages)                 │
  │  summary                                   │
  │  SonarCloud (integracao GitHub)            │
  └────────┬───────────────────────────────────┘
           │
           │  (se PR para main + mudancas em packages/**)
           ▼
  ┌────────────────────────────────────────────┐
  │  4-e2e-tests.yml                           │
  │  ──────────────────────────────────────    │
  │  Playwright em paralelo:                   │
  │    - 01_auth-profile                       │
  │    - 00_dashboard                          │
  │    - 02_projects                           │
  │  Comenta resultados no PR                  │
  └────────┬───────────────────────────────────┘
           │
           ▼
      PR aprovado e
       mergeado
           │
           │
                        FLUXO DE DEPLOY
                        ===============
           │
           ▼
  ┌────────────────────────────────────────────┐
  │  deploy-to-vm.yml                          │
  │  ──────────────────────────────────────    │
  │  SSH para VM GCP (oute-mind)               │
  │  Pull repos (oute-main + oute-mind)        │
  │  Link .env.production                      │
  │  Docker compose build + up (5 servicos)    │
  │  Caddy restart                             │
  │  Health checks                             │
  └────────────────────────────────────────────┘


                    FLUXOS DE SEGURANCA
                    ===================

  ┌──────────────────┐     ┌──────────────────────────────────┐
  │ Diario 02:00 UTC │────▶│  5-security-scan.yml             │
  │ + push para main │     │  ────────────────────────────    │
  └──────────────────┘     │  secret-scan (TruffleHog)        │
                           │  dependency-vulnerabilities      │
                           │    (npm audit + Trivy)           │
                           │  container-scan (Trivy, 4 pkgs)  │
                           └──────────────────────────────────┘

  ┌──────────────────┐     ┌──────────────────────────────────┐
  │ PRs com mudancas │────▶│  6-dependency-check.yml          │
  │ em package*.json │     │  ────────────────────────────    │
  │ + semanal (seg   │     │  OWASP Dependency Check          │
  │   09:00 UTC)     │     │  npm audit (HIGH/CRITICAL)       │
  └──────────────────┘     │  license-checker                 │
                           │  Notificacao Slack               │
                           └──────────────────────────────────┘


                    DIAGNOSTICO MANUAL
                    ==================

  ┌──────────────────┐     ┌──────────────────────────────────┐
  │ workflow_dispatch │────▶│  diagnose-production.yml         │
  │   (manual)       │     │  ────────────────────────────    │
  └──────────────────┘     │  Status dos containers           │
                           │  Teste de endpoints              │
                           │  Diagnostico disco/memoria       │
                           └──────────────────────────────────┘
```

---

## 1. Validacao de Pull Request (`1-pull-request.yml`)

**Gatilho:** Pull requests para `develop`, `staging` ou `main`.

### Jobs

| Job | Descricao |
| --- | --------- |
| **lint** | Executa ESLint e Prettier para garantir formatacao e qualidade do codigo |
| **typecheck** | Verifica tipos TypeScript por workspace |
| **test** | Executa testes com Vitest e gera relatorio de coverage |
| **docker-build** | Builda imagens Docker de 4 packages para validar que os Dockerfiles estao funcionais |
| **summary** | Consolida resultados de todos os jobs anteriores |

### Coverage

- Os relatorios `lcov.info` de cada workspace sao mesclados em um unico arquivo
- O arquivo final e enviado como artefato do workflow

### SonarCloud

- A analise do SonarCloud e executada automaticamente via integracao nativa com o GitHub
- Nao ha step explicito no workflow; a integracao esta configurada no nivel do repositorio

---

## 2. Testes End-to-End (`4-e2e-tests.yml`)

**Gatilho:** Pull requests para `main` que contenham mudancas em `packages/**`.

### Execucao

Tres suites de testes Playwright rodam em paralelo:

1. `01_auth-profile`
2. `00_dashboard`
3. `02_projects`

### Resultados

- Os reports do Playwright sao enviados como artefatos do workflow
- Os resultados sao comentados automaticamente no PR para facilitar a revisao

---

## 3. Scan de Seguranca (`5-security-scan.yml`)

**Gatilho:** Execucao diaria as 02:00 UTC (cron) + a cada push para `main`.

### Jobs

| Job | Descricao |
| --- | --------- |
| **secret-scan** | TruffleHog em modo push-only, detectando apenas secrets verificados |
| **dependency-vulnerabilities** | `npm audit` combinado com Trivy em modo filesystem para detectar vulnerabilidades em dependencias |
| **container-scan** | Trivy analisa imagens Docker de 4 packages em busca de vulnerabilidades |

---

## 4. Verificacao de Dependencias (`6-dependency-check.yml`)

**Gatilho:** PRs com mudancas em arquivos `package*.json` + execucao semanal (segunda-feira as 09:00 UTC).

### Jobs

| Job | Descricao |
| --- | --------- |
| **OWASP Dependency Check** | Analise de vulnerabilidades conhecidas (CVEs) nas dependencias |
| **npm audit** | Bloqueia o pipeline se houver vulnerabilidades de severidade HIGH ou CRITICAL |
| **license-checker** | Verifica se todas as licencas das dependencias estao na lista permitida: MIT, Apache-2.0, BSD, ISC, MPL-2.0 |

### Notificacao

- Uma notificacao e enviada ao Slack com o resultado da verificacao

---

## 5. Deploy para VM (`deploy-to-vm.yml`)

**Gatilho:** Push para `main` + `workflow_dispatch` (execucao manual).

### Etapas

1. **Conexao SSH** para a VM GCP (`oute-mind`)
2. **Pull dos repositorios** `oute-main` e `oute-mind`
3. **Link do `.env.production`** para configurar variaveis de ambiente
4. **Docker Compose build + up** dos 5 servicos:
   - `dashboard`
   - `auth`
   - `projects`
   - `home`
   - `interview`
5. **Restart do Caddy** (reverse proxy)
6. **Health checks** com 20 tentativas e intervalo de 3 segundos entre cada uma

---

## 6. Diagnostico de Producao (`diagnose-production.yml`)

**Gatilho:** Apenas manual via `workflow_dispatch`.

### Verificacoes

- **Status dos containers:** verifica quais containers estao rodando e seu estado
- **Teste de endpoints:** testa os endpoints diretamente nos servicos e tambem atraves do Caddy (reverse proxy)
- **Diagnostico de recursos:** verifica uso de disco e memoria na VM

---

## Secrets Necessarios

```
SSH_PRIVATE_KEY          # Chave SSH para acesso a VM GCP
SSH_HOST                 # IP/hostname da VM
SSH_USER                 # Usuario SSH
SONAR_TOKEN              # Token do SonarCloud
SLACK_WEBHOOK_URL        # Webhook para notificacoes Slack
GITHUB_TOKEN             # Automatico (gerado pelo Actions)
```

## Boas Praticas

1. **Rodar validacoes localmente antes de abrir PR:**
   ```bash
   npm run lint
   npm run typecheck
   npm run test
   ```

2. **Usar feature branches** e abrir PRs para `develop` ou `staging` antes de promover para `main`

3. **Verificar os resultados do pipeline no PR** antes de aprovar o merge

4. **Monitorar o deploy** acompanhando o workflow `deploy-to-vm.yml` apos o merge para `main`

5. **Usar o diagnostico** (`diagnose-production.yml`) caso haja suspeita de problemas em producao
