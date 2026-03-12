# Guia de Deploy na VM - oute-main na Infraestrutura oute-mind

Este documento descreve como fazer deploy dos servicos oute-main na VM oute-mind.

## Visao Geral

oute-main (Home, Dashboard, Auth-Profile, Projects, Interview) e deployado na VM oute-mind como containers Docker, compartilhando a mesma infraestrutura com o FastAPI CrewAI estimator.

**Arquitetura:**
- **Host**: GCP VM t2a-standard-4 (ARM64)
- **Rede**: Docker network `oute-network` (compartilhado com servicos oute-mind)
- **Banco de Dados**: PostgreSQL 16 (mesma instancia, database `oute_main` separada)
- **Reverse Proxy**: Caddy (portas 80/443 no host, unicas portas expostas externamente)
- **Acesso aos Servicos**: Todos os servicos usam `expose` (rede interna Docker apenas) e sao acessados exclusivamente pelo reverse proxy Caddy. Sem mapeamento de portas no host para servicos de aplicacao.

## Pre-requisitos

### Na VM (oute-mind)

Ja deve estar configurado:
- Docker e Docker Compose
- PostgreSQL 16 com database `oute_main` criado
- Caddy configurado com rotas para oute-main
- Docker network `oute-network`

### No Repositorio GitHub (oute-main)

Adicionar secrets para CI/CD:
- `VM_SSH_PRIVATE_KEY`: Chave SSH privada Ed25519 codificada em Base64
- `VM_SSH_KNOWN_HOSTS`: Entrada de known hosts para a VM
- `VM_HOSTNAME`: IP estatico ou hostname da VM
- `VM_USER`: 'ubuntu' (padrao)

## Deploy Automatico (Recomendado)

### Gatilho: Push para branch `main`

```bash
# 1. Fazer mudancas no oute-main
git add .
git commit -m "Feature: adicionar nova funcionalidade"

# 2. Push para main
git push origin main

# 3. GitHub Actions automaticamente:
#    - Faz build de imagens Docker multi-arch
#    - Conecta na VM via SSH
#    - Reinicia servicos oute-main
#    - Executa health checks
#    - Notifica sobre sucesso/falha
```

**Duracao**: ~15-20 minutos (inclui tempo de build Docker)

## Deploy Manual

Se precisar fazer deploy manualmente:

```bash
# 1. SSH na VM
gcloud compute ssh oute-mind --zone=us-central1-a

# 2. Navegar para diretorio oute-mind
cd ~/oute-mind

# 3. Pull das ultimas mudancas
git pull origin main

# 4. Rebuild dos servicos
docker compose build --no-cache \
  99_home \
  00_dashboard \
  01_auth-profile \
  02_projects \
  03_interview

# 5. Reiniciar servicos
docker compose up -d \
  99_home \
  00_dashboard \
  01_auth-profile \
  02_projects \
  03_interview

# 6. Verificar saude
docker compose ps
docker exec oute-home curl -sf http://localhost:3003/health
docker exec oute-dashboard curl -sf http://localhost:3000/health
docker exec oute-auth curl -sf http://localhost:3001/health
docker exec oute-projects curl -sf http://localhost:3004/health
docker exec oute-interview curl -sf http://localhost:3002/health
```

## Configuracao

### Variaveis de Ambiente

Arquivo `.env.vm.production` (nao commitar, usar GitHub Secrets):

```bash
NODE_ENV=production
DATABASE_URL=postgresql://app-user:PASSWORD@postgres:5432/oute_main
JWT_SECRET=SECURE_RANDOM_KEY
AUTH_SERVICE_URL=http://01_auth-profile:3001
PROJECTS_SERVICE_URL=http://02_projects:3004
```

### Integracao com Docker Compose

O `docker compose.yml` da VM e estendido com:

```yaml
99_home:
  expose:
    - "3003"
  environment:
    VITE_AUTH_SERVICE_URL: http://34.132.93.171
    VITE_ENV: production

00_dashboard:
  expose:
    - "3000"
  environment:
    DATABASE_URL: postgresql://app-user:${POSTGRES_PASSWORD}@postgres:5432/oute_main
    AUTH_SERVICE_URL: http://01_auth-profile:3001
    PROJECTS_SERVICE_URL: http://02_projects:3004

01_auth-profile:
  expose:
    - "3001"
  environment:
    DATABASE_URL: postgresql://app-user:${POSTGRES_PASSWORD}@postgres:5432/oute_main
    JWT_SECRET: ${JWT_SECRET}

02_projects:
  expose:
    - "3004"
  environment:
    DATABASE_URL: postgresql://app-user:${POSTGRES_PASSWORD}@postgres:5432/oute_main
    AUTH_SERVICE_URL: http://01_auth-profile:3001
    JWT_SECRET: ${JWT_SECRET}

03_interview:
  expose:
    - "3002"
  environment:
    VITE_AUTH_SERVICE_URL: http://34.132.93.171
    VITE_ENV: production
```

> **Nota de seguranca**: Servicos usam `expose` ao inves de `ports`. Isso os torna acessiveis apenas dentro da rede Docker (comunicacao servico-a-servico), nao do host ou redes externas. Todo acesso externo passa pelo reverse proxy Caddy na porta 80.

## Acessando Servicos

### Via Caddy (Unico Metodo)

Todos os servicos sao acessados exclusivamente pelo reverse proxy Caddy na porta 80:
- Home: `http://<VM_IP>/`
- Chat: `http://<VM_IP>/chat`
- Dashboard: `http://<VM_IP>/dashboard`
- API de Auth: `http://<VM_IP>/api/auth`
- API de Projetos: `http://<VM_IP>/api/projects`

> **Nota**: Acesso direto por porta nao esta disponivel. Servicos usam `expose` (rede interna Docker apenas). Se o Caddy estiver fora, use `docker exec` para acessar servicos diretamente dentro de seus containers.

## Monitoramento e Logs

### Verificar Status dos Servicos

```bash
gcloud compute ssh oute-mind --zone=us-central1-a
cd ~/oute-mind

# Todos os servicos
docker compose ps

# Apenas servicos oute-main
docker compose ps 99_home 00_dashboard 01_auth-profile 02_projects 03_interview
```

### Ver Logs

```bash
# Todos os servicos
docker compose logs -f

# Servico especifico
docker compose logs -f 99_home
docker compose logs -f 00_dashboard
docker compose logs -f 01_auth-profile
docker compose logs -f 02_projects
docker compose logs -f 03_interview

# Ultimas N linhas
docker compose logs -f --tail=100 00_dashboard
```

### Conectividade com Banco de Dados

```bash
# Da VM
gcloud compute ssh oute-mind --zone=us-central1-a
psql -U app-user -h localhost -d oute_main -c "SELECT 1;"

# Verificar tabelas
psql -U app-user -h localhost -d oute_main -c "\dt"
```

## Health Checks

Cada servico expoe endpoint `/health`:

```bash
# Via reverse proxy Caddy (recomendado)
curl http://localhost/health
curl http://localhost/dashboard/health
curl http://localhost/api/auth/health
curl http://localhost/api/projects/health

# Via docker exec (se Caddy estiver fora ou para depuracao)
docker exec oute-home curl -sf http://localhost:3003/health
# {"status":"ok","service":"home","timestamp":"2026-03-10T..."}

docker exec oute-dashboard curl -sf http://localhost:3000/health
# {"status":"ok","service":"dashboard","timestamp":"2026-03-10T..."}

docker exec oute-auth curl -sf http://localhost:3001/health
# {"status":"ok","service":"auth-profile","timestamp":"2026-03-10T..."}

docker exec oute-projects curl -sf http://localhost:3004/health
# {"status":"ok","service":"projects","timestamp":"2026-03-10T..."}

docker exec oute-interview curl -sf http://localhost:3002/health
# {"status":"ok","service":"interview","timestamp":"2026-03-10T..."}
```

## Resolucao de Problemas

### Servico esta REINICIANDO

```bash
# Verificar logs
docker compose logs 00_dashboard

# Problemas comuns:
# 1. Conexao com banco falhou -> Verificar DATABASE_URL
# 2. Conflito de container -> Verificar configuracoes de expose no docker compose.yml
# 3. Erro de build -> Verificar Dockerfile, tentar rebuild: docker compose build --no-cache 00_dashboard
```

### Health Check Falha

```bash
# Verificar se o servico esta rodando
docker compose ps 00_dashboard  # Deve mostrar "Up"

# Verificar saude diretamente dentro do container
docker exec oute-dashboard curl -sf http://localhost:3000/health

# Verificar logs por erros
docker compose logs 00_dashboard
```

### Erro de Conexao com Banco de Dados

```bash
# Testar conexao
docker exec oute-postgres psql -U app-user -c "\l"  # Listar databases

# Verificar se o banco existe
docker exec oute-postgres psql -U app-user -c "SELECT datname FROM pg_database WHERE datname = 'oute_main';"

# Criar se estiver faltando
docker exec oute-postgres psql -U app-user -c "CREATE DATABASE oute_main;"
```

### Roteamento do Caddy Nao Funciona

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

# Parar servicos
docker compose down 99_home 00_dashboard 01_auth-profile 02_projects 03_interview

# Reverter codigo para versao anterior
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
# Automatizado (diario via cron)
# /var/lib/postgresql/backups/oute_main_YYYYMMDD.sql

# Backup manual
gcloud compute ssh oute-mind --zone=us-central1-a
docker exec oute-postgres pg_dump -U app-user oute_main > oute_main_backup.sql

# Restaurar a partir do backup
docker exec -i oute-postgres psql -U app-user oute_main < oute_main_backup.sql
```

## Monitoramento de Performance

Prometheus e Grafana monitoram os servicos:

```bash
# Prometheus e Grafana sao apenas internos (nao expostos em portas do host).
# Acesso via tunel SSH:

# Prometheus
gcloud compute ssh oute-mind --zone=us-central1-a -- -L 9090:prometheus:9090
# Entao abrir http://localhost:9090

# Grafana
gcloud compute ssh oute-mind --zone=us-central1-a -- -L 3080:grafana:3000
# Entao abrir http://localhost:3080
# Credenciais: admin/GRAFANA_PASSWORD
```

Dashboards incluem metricas de:
- Taxa de requests, latencia, taxa de erros
- Uso de CPU/Memoria por servico
- Conexoes com banco de dados
- I/O de rede

## Suporte

Para problemas ou duvidas:

1. Verificar logs: `docker compose logs <servico>`
2. Verificar saude: `docker exec <container> curl -sf http://localhost:<porta_interna>/health`
3. Verificar conectividade: Testar banco de dados, outros servicos
4. Consultar secao de resolucao de problemas deste documento
5. Contatar equipe de DevOps

---

**Ultima Atualizacao**: 10/03/2026
**Versao**: 1.0
