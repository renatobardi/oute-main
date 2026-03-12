# Deploy GCP - Referencia Rapida

Folha de consulta rapida para tarefas comuns de deploy GCP.

## Setup (Primeira Vez)

```bash
# 1. Infraestrutura inicial
bash .gcp/setup.sh oute-app us-central1

# 2. Criar secrets
bash .gcp/create-secrets.sh

# 3. Adicionar ao GitHub (salve a saida do passo 2 primeiro!)
gh secret set GCP_PROJECT_ID -b "oute-app"
gh secret set GCP_REGION -b "us-central1"
gh secret set GCP_SA_KEY < .gcp/keys/gh-key.json
```

## Build e Push da Imagem

```bash
# Variaveis
export REGISTRY="us-central1-docker.pkg.dev"
export PROJECT="oute-app"
export IMAGE="oute-dashboard"
export TAG="staging-latest"

# Build
docker build --file packages/00_dashboard/Dockerfile --tag $IMAGE:local .

# Tag
docker tag $IMAGE:local $REGISTRY/$PROJECT/docker-repo/$IMAGE:$TAG

# Push
docker push $REGISTRY/$PROJECT/docker-repo/$IMAGE:$TAG
```

## Deploy no Cloud Run

```bash
# Staging (usando script - recomendado)
bash .gcp/deploy.sh dashboard staging staging-latest

# Producao
bash .gcp/deploy.sh dashboard production v1.0.0

# Obter URL
gcloud run services describe oute-dashboard-staging --region=us-central1 --format='value(status.url)'
```

## Visualizar Logs

```bash
# Ultimas 50 linhas (staging)
gcloud run logs read oute-dashboard-staging --region=us-central1 --limit=50

# Tempo real (staging)
gcloud run logs read oute-dashboard-staging --region=us-central1 --follow

# Buscar erros
gcloud run logs read oute-dashboard-staging --region=us-central1 | grep -i error

# Producao
gcloud run logs read oute-dashboard --region=us-central1 --follow
```

## Revisoes e Rollback

```bash
# Visualizar todas as revisoes (staging)
gcloud run revisions list --service=oute-dashboard-staging --region=us-central1

# Rollback para anterior (staging)
gcloud run services update-traffic oute-dashboard-staging \
  --region=us-central1 \
  --to-revisions=<NOME_DA_REVISAO>=100

# Canary: 10% novo, 90% antigo
gcloud run services update-traffic oute-dashboard-staging \
  --region=us-central1 \
  --to-revisions=<NOVA_REVISAO>=10,<REVISAO_ANTIGA>=90
```

## Gerenciamento de Secrets

```bash
# Visualizar valor do secret
gcloud secrets versions access latest --secret=DATABASE_URL

# Atualizar secret
echo "novo-valor" | gcloud secrets versions add DATABASE_URL --data-file=-

# Listar todos os secrets
gcloud secrets list

# Listar versoes do secret
gcloud secrets versions list DATABASE_URL
```

## GitHub Actions

```bash
# Listar workflows
gh workflow list

# Acionar deploy manual
gh workflow run deploy-staging-manual.yml -f service=dashboard -f image_tag=staging-latest

# Visualizar execucoes de workflow
gh run list --workflow=deploy-on-staging-branch.yml

# Visualizar logs de execucao especifica
gh run view <RUN_ID> --log
```

## Banco de Dados

```bash
# Verificar status do PostgreSQL
gcloud sql instances describe oute-postgres

# Listar bancos
gcloud sql databases list --instance=oute-postgres

# Listar usuarios
gcloud sql users list --instance=oute-postgres

# Conectar via Cloud Shell
gcloud sql connect oute-postgres --user=app_user
```

## Service Accounts

```bash
# Listar service accounts
gcloud iam service-accounts list

# Mostrar roles da SA do Cloud Run
gcloud projects get-iam-policy oute-app \
  --flatten="bindings[].members" \
  --format="table(bindings.role)" \
  --filter="bindings.members:cloud-run-sa@"

# Criar nova chave de service account (se necessario)
gcloud iam service-accounts keys create .gcp/keys/gh-key-new.json \
  --iam-account=github-actions-sa@oute-app.iam.gserviceaccount.com
```

## Artifact Registry

```bash
# Listar imagens
gcloud artifacts docker images list us-central1-docker.pkg.dev/oute-app/docker-repo

# Mostrar detalhes da imagem
gcloud artifacts docker images describe \
  us-central1-docker.pkg.dev/oute-app/docker-repo/oute-dashboard:staging-latest

# Listar tags da imagem
gcloud artifacts docker images list \
  us-central1-docker.pkg.dev/oute-app/docker-repo/oute-dashboard
```

## Monitoramento

```bash
# Detalhes do servico Cloud Run
gcloud run services describe oute-dashboard-staging --region=us-central1

# Visualizar divisao de trafego atual
gcloud run services describe oute-dashboard-staging \
  --region=us-central1 \
  --format='value(status.traffic[].{revision:revision,percent:percent})'

# Visualizar uso de recursos
gcloud run services describe oute-dashboard-staging \
  --region=us-central1 \
  --format='value(spec.template.spec.containers[0].resources)'
```

## Configuracao do Projeto

```bash
# Definir projeto padrao
gcloud config set project oute-app

# Definir regiao padrao
gcloud config set compute/region us-central1

# Visualizar configuracao atual
gcloud config list

# Verificar APIs habilitadas
gcloud services list --enabled | grep -E "run|artifact|sql|secret"
```

## Comandos Uteis

```bash
# Deploy staging + mostrar URL
bash .gcp/deploy.sh dashboard staging staging-latest && \
gcloud run services describe oute-dashboard-staging --region=us-central1 --format='value(status.url)'

# Acompanhar logs durante deploy
bash .gcp/deploy.sh dashboard staging staging-latest & \
gcloud run logs read oute-dashboard-staging --region=us-central1 --follow

# Build da imagem em um so comando
docker build --file packages/00_dashboard/Dockerfile --tag oute-dashboard:local . && \
docker tag oute-dashboard:local us-central1-docker.pkg.dev/oute-app/docker-repo/oute-dashboard:staging-latest && \
docker push us-central1-docker.pkg.dev/oute-app/docker-repo/oute-dashboard:staging-latest

# Listar todos os servicos
gcloud run services list --region=us-central1 --format='value(name,status.url)'

# Verificar qual revisao esta ativa
gcloud run services describe oute-dashboard-staging --region=us-central1 --format='value(status.traffic[0].revision)'
```

## Variaveis de Ambiente

**Definidas durante o deploy:**

```bash
gcloud run deploy oute-dashboard-staging \
  --set-env-vars="NODE_ENV=staging,DEBUG=false,LOG_LEVEL=info"
```

**Visualizar atuais:**

```bash
gcloud run services describe oute-dashboard-staging --region=us-central1 \
  --format='value(spec.template.spec.containers[0].env[].{name:name,value:value})'
```

## Solucao de Problemas - Comandos Rapidos

```bash
# Verificar se imagem existe
gcloud artifacts docker images describe us-central1-docker.pkg.dev/oute-app/docker-repo/oute-dashboard:staging-latest

# Verificar permissoes da service account
gcloud projects get-iam-policy oute-app --flatten="bindings[].members" --filter="bindings.members:cloud-run-sa@"

# Verificar status da instancia Cloud SQL
gcloud sql instances describe oute-postgres

# Visualizar eventos do servico
gcloud run services describe oute-dashboard-staging --region=us-central1 --format=json | jq '.status'

# Re-deploy da imagem mais recente
gcloud run deploy oute-dashboard-staging --image=us-central1-docker.pkg.dev/oute-app/docker-repo/oute-dashboard:staging-latest --platform=managed --region=us-central1
```

## GitHub Secrets

```bash
# Adicionar/atualizar secrets
gh secret set GCP_PROJECT_ID -b "oute-app"
gh secret set GCP_REGION -b "us-central1"
gh secret set GCP_SA_KEY < .gcp/keys/gh-key.json

# Listar secrets
gh secret list

# Visualizar arquivos de workflows
gh api repos/renatobardi/oute-main/contents/.github/workflows --paginate
```

---

**Para detalhes completos, consulte:**

- `.gcp/README.md` - Documentacao dos scripts
- `GCP-DEPLOYMENT.md` - Guia completo de deploy
- `gcloud --help` - Referencia do CLI GCP
