# Guia de Deploy na VM - oute-main na Infraestrutura oute-mind

Este documento descreve como fazer deploy dos serviços oute-main na VM oute-mind.

## Visão Geral

oute-main (Home, Dashboard, Auth-Profile, Projects, Interview) é deployado na VM oute-mind como containers Docker, compartilhando a mesma infraestrutura com o FastAPI CrewAI estimator.

**Arquitetura:**
- **Host**: GCP VM t2a-standard-4 (ARM64)
- **Network**: Docker network `oute-network` (compartilhado com serviços oute-mind)
- **Database**: PostgreSQL 16 (mesma instância, database `oute_main` separada)
- **Reverse Proxy**: Caddy (portas 80/443 no host, únicas portas expostas externamente)
- **Acesso aos Serviços**: Todos os serviços usam `expose` (rede Docker interna apenas) e são acessados exclusivamente pelo Caddy reverse proxy. Sem mapeamento de portas no host para serviços da aplicação.

## Pré-requisitos

### Na VM (oute-mind)

Já deve estar configurado:
- Docker & Docker Compose
- PostgreSQL 16 com database `oute_main` criado
- Caddy configurado com rotas para oute-main
- `oute-network` Docker network

### No Repositório GitHub (oute-main)

Adicionar secrets para CI/CD:
- `VM_SSH_PRIVATE_KEY`: Base64-encoded SSH private key (Ed25519)
- `VM_SSH_KNOWN_HOSTS`: Known hosts entry for VM
- `VM_HOSTNAME`: IP estático ou hostname da VM
- `VM_USER`: 'ubuntu' (default)

## Deploy Automático (Recomendado)

### Gatilho: Push para branch `main`

```bash
# 1. Fazer mudanças no oute-main
git add .
git commit -m "feat: adicionar nova funcionalidade"

# 2. Push para main
git push origin main

# 3. GitHub Actions automaticamente:
#    - Faz build de imagens Docker multi-arch
#    - Conecta na VM via SSH
#    - Reinicia serviços oute-main
#    - Executa health checks
#    - Notifica sucesso/falha
```

**Duração**: ~15-20 minutos (inclui tempo de build Docker)

## Deploy Manual

Se precisar fazer deploy manualmente:

```bash
# 1. SSH na VM
gcloud compute ssh oute-mind --zone=us-central1-a

# 2. Navegar para o diretório oute-mind
cd ~/oute-mind

# 3. Pull das últimas mudanças
git pull origin main

# 4. Rebuild dos serviços
docker compose build --no-cache \
  99_home \
  00_dashboard \
  01_auth-profile \
  02_projects \
  03_interview

# 5. Reiniciar serviços
docker compose up -d \
  99_home \
  00_dashboard \
  01_auth-profile \
  02_projects \
  03_interview

# 6. Verificar saúde
docker compose ps
docker exec oute-home curl -sf http://localhost:3003/health
docker exec oute-dashboard curl -sf http://localhost:3000/health
docker exec oute-auth curl -sf http://localhost:3001/health
docker exec oute-projects curl -sf http://localhost:3002/health
docker exec oute-interview curl -sf http://localhost:3002/health
```

## Configuração

### Variáveis de Ambiente

Arquivo `.env.vm.production` (não commitar, usar GitHub Secrets):

```bash
NODE_ENV=production
DATABASE_URL=postgresql://app-user:PASSWORD@postgres:5432/oute_main
JWT_SECRET=SECURE_RANDOM_KEY
AUTH_SERVICE_URL=http://01_auth-profile:3001
PROJECTS_SERVICE_URL=http://02_projects:3002
```

### Integração com Docker Compose

O `docker-compose.yml` da VM é estendido com:

```yaml
99_home:
  expose:
    - "3003"
  environment:
    NODE_ENV: production
    VITE_AUTH_SERVICE_URL: http://01_auth-profile:3001

00_dashboard:
  expose:
    - "3000"
  environment:
    DATABASE_URL: postgresql://app-user:${POSTGRES_PASSWORD}@postgres:5432/oute_main
    AUTH_SERVICE_URL: http://01_auth-profile:3001
    PROJECTS_SERVICE_URL: http://02_projects:3002

01_auth-profile:
  expose:
    - "3001"
  environment:
    DATABASE_URL: postgresql://app-user:${POSTGRES_PASSWORD}@postgres:5432/oute_main
    JWT_SECRET: ${JWT_SECRET}

02_projects:
  expose:
    - "3002"
  environment:
    DATABASE_URL: postgresql://app-user:${POSTGRES_PASSWORD}@postgres:5432/oute_main
    AUTH_SERVICE_URL: http://01_auth-profile:3001
    JWT_SECRET: ${JWT_SECRET}

03_interview:
  expose:
    - "3002"
  environment:
    NODE_ENV: production
    VITE_AUTH_SERVICE_URL: http://01_auth-profile:3001
```

> **Nota de segurança**: Os serviços usam `expose` ao invés de `ports`. Isso os torna acessíveis apenas dentro da rede Docker (comunicação entre serviços), não do host ou redes externas. Todo acesso externo passa pelo Caddy reverse proxy na porta 80.

## Acesso aos Serviços

### Via Caddy (Único Método)

Todos os serviços são acessados exclusivamente pelo Caddy reverse proxy na porta 80:
- Home: `http://<VM_IP>/`
- Chat: `http://<VM_IP>/chat`
- Dashboard: `http://<VM_IP>/dashboard`
- Auth API: `http://<VM_IP>/api/auth`
- Projects API: `http://<VM_IP>/api/projects`

> **Nota**: Acesso direto por portas não está disponível. Os serviços usam `expose` (rede Docker interna apenas). Se o Caddy estiver fora, use `docker exec` para acessar os serviços diretamente dentro dos containers.

## Monitoramento e Logs

### Verificar Status dos Serviços

```bash
gcloud compute ssh oute-mind --zone=us-central1-a
cd ~/oute-mind

# Todos os serviços
docker compose ps

# Apenas serviços oute-main
docker compose ps 99_home 00_dashboard 01_auth-profile 02_projects 03_interview
```

### Ver Logs

```bash
# Todos os serviços
docker compose logs -f

# Serviço específico
docker compose logs -f 99_home
docker compose logs -f 00_dashboard
docker compose logs -f 01_auth-profile
docker compose logs -f 02_projects
docker compose logs -f 03_interview

# Últimas N linhas
docker compose logs -f --tail=100 00_dashboard
```

### Conectividade com o Banco

```bash
# Na VM
gcloud compute ssh oute-mind --zone=us-central1-a
psql -U app-user -h localhost -d oute_main -c "SELECT 1;"

# Verificar tabelas
psql -U app-user -h localhost -d oute_main -c "\dt"
```

## Health Checks

Cada serviço expõe endpoint `/health`:

```bash
# Via Caddy reverse proxy (recomendado)
curl http://localhost/health
curl http://localhost/dashboard/health
curl http://localhost/api/auth/health
curl http://localhost/api/projects/health

# Via docker exec (se Caddy estiver fora ou para depuração)
docker exec oute-home curl -sf http://localhost:3003/health
docker exec oute-interview curl -sf http://localhost:3002/health
docker exec oute-dashboard curl -sf http://localhost:3000/health
# {"status":"ok","service":"dashboard","timestamp":"2026-03-10T..."}

docker exec oute-auth curl -sf http://localhost:3001/health
# {"status":"ok","service":"auth-profile","timestamp":"2026-03-10T..."}

docker exec oute-projects curl -sf http://localhost:3002/health
# {"status":"ok","service":"projects","timestamp":"2026-03-10T..."}
```

## Troubleshooting

### Serviço está RESTARTING

```bash
# Verificar logs
docker compose logs 00_dashboard

# Problemas comuns:
# 1. Conexão com banco falhou -> Verifique DATABASE_URL
# 2. Conflito de container -> Verifique docker-compose.yml expose settings
# 3. Erro de build -> Verifique Dockerfile, tente rebuild: docker compose build --no-cache 00_dashboard
```

### Health Check Falha

```bash
# Verificar se o serviço está rodando
docker compose ps 00_dashboard  # Deve mostrar "Up"

# Verificar saúde diretamente dentro do container
docker exec oute-dashboard curl -sf http://localhost:3000/health

# Verificar logs de erros
docker compose logs 00_dashboard
```

### Erro de Conexão com Banco de Dados

```bash
# Testar conexão
docker exec oute-postgres psql -U app-user -c "\l"  # Listar databases

# Verificar se database existe
docker exec oute-postgres psql -U app-user -c "SELECT datname FROM pg_database WHERE datname = 'oute_main';"

# Criar se não existir
docker exec oute-postgres psql -U app-user -c "CREATE DATABASE oute_main;"
```

### Roteamento do Caddy Não Funciona

```bash
# Verificar logs do Caddy
docker compose logs caddy

# Verificar Caddyfile
cat configs/Caddyfile

# Recarregar Caddy
docker compose restart caddy
```

## Rollback

Se o deploy falhar e precisar reverter:

```bash
gcloud compute ssh oute-mind --zone=us-central1-a
cd ~/oute-mind

# Parar serviços
docker compose down 99_home 00_dashboard 01_auth-profile 02_projects 03_interview

# Reverter código para versão anterior
git log --oneline -10  # Ver commits
git checkout <COMMIT_ANTERIOR>

# Rebuild e iniciar
docker compose build --no-cache 99_home 00_dashboard 01_auth-profile 02_projects 03_interview
docker compose up -d 99_home 00_dashboard 01_auth-profile 02_projects 03_interview

# Verificar
docker exec oute-home curl -sf http://localhost:3003/health
docker exec oute-dashboard curl -sf http://localhost:3000/health
```

## Backup do Banco de Dados

Backup do database `oute_main`:

```bash
# Automatizado (diário via cron)
# /var/lib/postgresql/backups/oute_main_YYYYMMDD.sql

# Backup manual
gcloud compute ssh oute-mind --zone=us-central1-a
docker exec oute-postgres pg_dump -U app-user oute_main > oute_main_backup.sql

# Restaurar do backup
docker exec -i oute-postgres psql -U app-user oute_main < oute_main_backup.sql
```

## Monitoramento de Performance

Prometheus e Grafana monitoram os serviços:

```bash
# Prometheus e Grafana são apenas internos (não expostos em portas do host).
# Acesso via túnel SSH:

# Prometheus
gcloud compute ssh oute-mind --zone=us-central1-a -- -L 9090:prometheus:9090
# Depois abrir http://localhost:9090

# Grafana
gcloud compute ssh oute-mind --zone=us-central1-a -- -L 3080:grafana:3000
# Depois abrir http://localhost:3080
# Credenciais: admin/GRAFANA_PASSWORD
```

Dashboards incluem métricas de:
- Taxa de requisições, latência, taxa de erros
- Uso de CPU/Memória por serviço
- Conexões com o banco
- I/O de rede

## Suporte

Para problemas ou dúvidas:

1. Verifique logs: `docker compose logs <servico>`
2. Verifique health: `docker exec <container> curl -sf http://localhost:<porta_interna>/health`
3. Verifique conectividade: teste banco de dados e outros serviços
4. Consulte a seção de troubleshooting deste documento
5. Contate o time de DevOps

---

**Última Atualização**: 2026-03-10
**Versão**: 1.0
