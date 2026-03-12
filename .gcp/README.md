# Scripts de Infraestrutura GCP - OUTE

> **Nota**: O deploy primário do OUTE utiliza **VM GCP com Docker Compose + Caddy** (ver [VM_DEPLOYMENT.md](../VM_DEPLOYMENT.md)). Os scripts abaixo são para deploy alternativo via **Cloud Run**.

Scripts CLI automatizados para deploy alternativo do OUTE no Google Cloud Platform via Cloud Run.

## Inicio Rapido

### 1. Setup Inicial (Apenas Primeira Vez)

```bash
bash .gcp/setup.sh oute-app us-central1
```

Este script:

- ✅ Cria projeto GCP
- ✅ Habilita APIs necessarias
- ✅ Cria Artifact Registry
- ✅ Configura PostgreSQL
- ✅ Cria service accounts
- ✅ Gera chave para GitHub Actions

**Tempo:** ~15 minutos (maior parte aguardando provisionamento de infraestrutura)

### 2. Criar Secrets

```bash
bash .gcp/create-secrets.sh
```

Este script:

- ✅ Gera DATABASE_URL segura
- ✅ Gera JWT_SECRET seguro
- ✅ Armazena no Google Secret Manager
- ✅ Mostra valores dos secrets para backup

**Importante:** Salve os valores impressos de forma segura (gerenciador de senhas, Vault, etc.)

### 3. Adicionar GitHub Secrets

```bash
# Usando gh CLI (recomendado)
gh secret set GCP_PROJECT_ID -b "oute-app"
gh secret set GCP_REGION -b "us-central1"
gh secret set GCP_SA_KEY < keys/gh-key.json
```

### 4. Deploy do Dashboard

#### Primeiro Deploy (Manual)

```bash
# Build local
npm ci && npm run build -w 00_dashboard

# Build da imagem Docker
docker build \
  --file packages/00_dashboard/Dockerfile \
  --tag oute-dashboard:local .

# Tag para Artifact Registry
docker tag oute-dashboard:local \
  us-central1-docker.pkg.dev/oute-app/docker-repo/oute-dashboard:staging-latest

# Push para Artifact Registry
docker push \
  us-central1-docker.pkg.dev/oute-app/docker-repo/oute-dashboard:staging-latest

# Deploy no Cloud Run
bash .gcp/deploy.sh dashboard staging staging-latest
```

#### Deploys Automaticos (GitHub Actions)

```bash
# Push para branch staging (deploy automatico para staging)
git push origin feature-branch:staging

# Push para branch main (deploy automatico para producao)
git push origin main
```

---

## Scripts Disponiveis

### `setup.sh` - Infraestrutura Inicial

**Uso:**

```bash
bash setup.sh [PROJECT_ID] [REGION] [BILLING_ACCOUNT_ID]
```

**Argumentos:**

- `PROJECT_ID`: ID do projeto GCP (padrao: "oute-app")
- `REGION`: Regiao GCP (padrao: "us-central1")
- `BILLING_ACCOUNT_ID`: ID da conta de faturamento (opcional)

**Exemplo:**

```bash
bash setup.sh oute-app us-central1 01ABCD-EF1234-GH5678
```

**O que cria:**

- Projeto GCP
- APIs habilitadas (Cloud Run, Cloud SQL, Artifact Registry, Secret Manager, etc.)
- Instancia Cloud SQL PostgreSQL 15
- Repositorio Docker no Artifact Registry
- Service accounts (Cloud Run, GitHub Actions) com roles IAM
- Chaves de service account

---

### `deploy.sh` - Deploy no Cloud Run

**Uso:**

```bash
bash deploy.sh <service> <environment> [image_tag]
```

**Argumentos:**

- `service`: Servico a deployar (dashboard, auth-profile, projects)
- `environment`: Ambiente alvo (staging, production)
- `image_tag`: Tag da imagem Docker (padrao: latest)

**Exemplos:**

```bash
# Deploy do dashboard para staging com tag especifica
bash deploy.sh dashboard staging staging-latest

# Deploy do auth-profile para producao
bash deploy.sh auth-profile production v1.0.0

# Deploy do projects para staging
bash deploy.sh projects staging abc123-sha
```

**O que faz:**

- ✅ Verifica se a imagem existe no Artifact Registry
- ✅ Faz deploy no Cloud Run com configuracao correta
- ✅ Define variaveis de ambiente (NODE_ENV)
- ✅ Injeta secrets do Secret Manager (DATABASE_URL, JWT_SECRET)
- ✅ Realiza health checks
- ✅ Retorna URL do servico

---

### `create-secrets.sh` - Configurar Secrets Manager

**Uso:**

```bash
bash create-secrets.sh
```

**O que cria:**

- Secret `DATABASE_URL` com string de conexao ao PostgreSQL
- Secret `JWT_SECRET` com chave aleatoria de 32 bytes

**Saida:**

- Exibe valores dos secrets (salve-os!)
- Mostra comandos para recuperar/atualizar secrets posteriormente

---

## Estrutura de Diretorios

```
.gcp/
├── README.md                    # Este arquivo
├── setup.sh                     # Setup inicial de infraestrutura
├── deploy.sh                    # Deploy no Cloud Run
├── create-secrets.sh            # Criar secrets no Secret Manager
└── keys/                        # Chaves de service account (git-ignored)
    └── gh-key.json              # Service account do GitHub Actions
```

---

## Workflows Comuns

### Deploy de Nova Versao para Staging

```bash
# 1. Build local
npm run build -w 00_dashboard

# 2. Build e push da imagem Docker
docker build \
  --file packages/00_dashboard/Dockerfile \
  --tag oute-dashboard:local .

docker tag oute-dashboard:local \
  us-central1-docker.pkg.dev/oute-app/docker-repo/oute-dashboard:staging-latest

docker push \
  us-central1-docker.pkg.dev/oute-app/docker-repo/oute-dashboard:staging-latest

# 3. Deploy usando script
bash deploy.sh dashboard staging staging-latest

# 4. Verificar
curl https://<SERVICE_URL>
```

### Promover Staging para Producao

```bash
# Taguear a mesma imagem para producao
docker tag \
  us-central1-docker.pkg.dev/oute-app/docker-repo/oute-dashboard:staging-latest \
  us-central1-docker.pkg.dev/oute-app/docker-repo/oute-dashboard:v1.0.0

docker push \
  us-central1-docker.pkg.dev/oute-app/docker-repo/oute-dashboard:v1.0.0

# Deploy para producao
bash deploy.sh dashboard production v1.0.0
```

### Rollback para Versao Anterior

```bash
# Visualizar revisoes
gcloud run revisions list \
  --service=oute-dashboard \
  --region=us-central1

# Rollback (direcionar trafego para revisao anterior)
gcloud run services update-traffic oute-dashboard \
  --region=us-central1 \
  --to-revisions=<REVISAO_ANTERIOR>=100
```

### Visualizar Logs de Deploy

```bash
# Staging
gcloud run logs read oute-dashboard-staging \
  --region=us-central1 \
  --follow

# Producao
gcloud run logs read oute-dashboard \
  --region=us-central1 \
  --follow
```

---

## Workflows do GitHub Actions

Tres workflows automatizam deploys baseados em branches git:

### `.github/workflows/deploy-staging-manual.yml`

- **Trigger:** Manual (clique em "Run workflow" na UI do GitHub)
- **Deploy para:** Ambiente de staging
- **Inputs:** Servico, tag da imagem

### `.github/workflows/deploy-to-vm.yml`

- **Trigger:** Push para branch `main`
- **Deploy para:** VM GCP via SSH com Docker Compose + Caddy (deploy primário)
- **Automatico:** git pull, docker compose build, docker compose up, health checks

> **Nota**: Os workflows antigos `deploy-on-staging-branch.yml` e `deploy-on-main-branch.yml` foram removidos. O deploy Cloud Run dos scripts `.gcp/` requer execução manual.

---

## Variaveis de Ambiente

### No Deploy do Cloud Run (Alternativo)

Definidas via `--set-env-vars` no deploy.sh/comando gcloud:

```bash
NODE_ENV=staging          # production, staging ou development
DEBUG=false               # Habilitar/desabilitar debugging
LOG_LEVEL=info            # log, info, warn, error
```

### Do Secret Manager

Injetadas automaticamente no container do Cloud Run:

```bash
DATABASE_URL              # String de conexao PostgreSQL
JWT_SECRET                # Chave de assinatura JWT
```

---

## Solucao de Problemas

### Scripts falham com "gcloud not found"

Instale o Google Cloud SDK: https://cloud.google.com/sdk/docs/install

### Script de setup trava na criacao do PostgreSQL

PostgreSQL leva ~5 minutos para criar. O script aguarda automaticamente. Se der timeout:

```bash
# Verificar status manualmente
gcloud sql instances describe oute-postgres --region=us-central1
```

### Script de deploy diz "Image not found"

A imagem ainda nao foi enviada ao Artifact Registry:

```bash
# Build e push da imagem primeiro
docker build --file packages/00_dashboard/Dockerfile --tag oute-dashboard:local .
docker tag oute-dashboard:local us-central1-docker.pkg.dev/oute-app/docker-repo/oute-dashboard:staging-latest
docker push us-central1-docker.pkg.dev/oute-app/docker-repo/oute-dashboard:staging-latest
```

### Servico deployado mas retornando erros 500

Verifique os logs:

```bash
gcloud run logs read oute-dashboard-staging --region=us-central1 --follow
```

Problemas comuns:

- Secret DATABASE_URL ausente ou invalido
- Service account sem permissoes do Cloud SQL
- Instancia PostgreSQL nao esta rodando

---

## Proximos Passos

1. **Ler documentacao completa:** `GCP-DEPLOYMENT.md` na raiz do repositorio
2. **Configurar infraestrutura:** Executar `.gcp/setup.sh`
3. **Adicionar GitHub secrets:** Usar comandos `gh secret set`
4. **Primeiro deploy manual:** Usar `.gcp/deploy.sh` para verificar
5. **Commitar no git:** Workflows farao deploy automatico no push

---

## Notas de Seguranca

**Importante:**

- Nunca commitar `.gcp/keys/` no git (ja esta no .gitignore)
- Nunca commitar valores de secrets no git
- Armazenar valores de secrets em gerenciador de senhas (1Password, Bitwarden, etc.)
- Rotacionar chaves de service account a cada 90 dias
- Revisar roles IAM regularmente

---

## Suporte

Para solucao de problemas detalhada e configuracoes avancadas, consulte `GCP-DEPLOYMENT.md`.

Para referencia do CLI gcloud: `gcloud run --help`
