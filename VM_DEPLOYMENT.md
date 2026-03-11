# VM Deployment Guide - oute-main on oute-mind Infrastructure

Este documento descreve como fazer deploy dos serviços oute-main na VM oute-mind.

## Overview

oute-main (Dashboard, Auth-Profile, Projects APIs) é deployado na VM oute-mind como containers Docker, compartilhando a mesma infraestrutura com o FastAPI CrewAI estimator.

**Arquitetura:**
- **Host**: GCP VM t2a-standard-4 (ARM64)
- **Network**: Docker network `oute-network` (compartilhado com oute-mind services)
- **Database**: PostgreSQL 16 (mesma instância, database `oute_main` separada)
- **Reverse Proxy**: Caddy (ports 80/443 on host, only externally exposed ports)
- **Service Access**: All services use `expose` (internal Docker network only) and are accessed exclusively through Caddy reverse proxy. No host port mappings for application services.

## Prerequisites

### Na VM (oute-mind)

✅ Já deve estar configurado:
- Docker & Docker Compose
- PostgreSQL 16 com database `oute_main` criado
- Caddy configurado com rotas para oute-main
- `oute-network` Docker network

### No GitHub Repository (oute-main)

Adicionar secrets para CI/CD:
- `VM_SSH_PRIVATE_KEY`: Base64-encoded SSH private key (Ed25519)
- `VM_SSH_KNOWN_HOSTS`: Known hosts entry for VM
- `VM_HOSTNAME`: IP estático ou hostname da VM
- `VM_USER`: 'ubuntu' (default)

## Automatic Deployment (Recommended)

### Trigger: Push to `main` branch

```bash
# 1. Make changes to oute-main
git add .
git commit -m "Feature: add new feature"

# 2. Push to main
git push origin main

# 3. GitHub Actions automatically:
#    - Builds multi-arch Docker images
#    - Connects to VM via SSH
#    - Restarts oute-main services
#    - Runs health checks
#    - Notifies on success/failure
```

**Duration**: ~15-20 minutes (includes Docker build time)

## Manual Deployment

Se precisar fazer deploy manualmente:

```bash
# 1. SSH into VM
gcloud compute ssh oute-mind --zone=us-central1-a

# 2. Navigate to oute-mind directory
cd ~/oute-mind

# 3. Pull latest changes
git pull origin main

# 4. Rebuild services
docker compose build --no-cache \
  00_dashboard \
  01_auth-profile \
  02_projects

# 5. Restart services
docker compose up -d \
  00_dashboard \
  01_auth-profile \
  02_projects

# 6. Verify health
docker compose ps
docker exec oute-dashboard curl -sf http://localhost:3000/health
docker exec oute-auth curl -sf http://localhost:3001/health
docker exec oute-projects curl -sf http://localhost:3002/health
```

## Configuration

### Environment Variables

Arquivo `.env.vm.production` (não commitar, usar GitHub Secrets):

```bash
NODE_ENV=production
DATABASE_URL=postgresql://app-user:PASSWORD@postgres:5432/oute_main
JWT_SECRET=SECURE_RANDOM_KEY
AUTH_SERVICE_URL=http://01_auth-profile:3001
PROJECTS_SERVICE_URL=http://02_projects:3002
```

### Docker Compose Integration

O `docker compose.yml` da VM é estendido com:

```yaml
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
```

> **Security note**: Services use `expose` instead of `ports`. This makes them accessible only within the Docker network (service-to-service communication), not from the host or external networks. All external access goes through Caddy reverse proxy on port 80.

## Accessing Services

### Via Caddy (Only Method)

All services are accessed exclusively through Caddy reverse proxy on port 80:
- Dashboard: `http://<VM_IP>/dashboard`
- Auth API: `http://<VM_IP>/api/auth`
- Projects API: `http://<VM_IP>/api/projects`

> **Note**: Direct port access (3020, 3021, 3022) is no longer available. Services use `expose` (internal Docker network only). If Caddy is down, use `docker exec` to access services directly within their containers.

## Monitoring & Logs

### Check Service Status

```bash
gcloud compute ssh oute-mind --zone=us-central1-a
cd ~/oute-mind

# All services
docker compose ps

# oute-main services only
docker compose ps 00_dashboard 01_auth-profile 02_projects
```

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f 00_dashboard
docker compose logs -f 01_auth-profile
docker compose logs -f 02_projects

# Last N lines
docker compose logs -f --tail=100 00_dashboard
```

### Database Connectivity

```bash
# From VM
gcloud compute ssh oute-mind --zone=us-central1-a
psql -U app-user -h localhost -d oute_main -c "SELECT 1;"

# Check tables
psql -U app-user -h localhost -d oute_main -c "\dt"
```

## Health Checks

Cada serviço expõe endpoint `/health`:

```bash
# Via Caddy reverse proxy (recommended)
curl http://localhost/dashboard/health
curl http://localhost/api/auth/health
curl http://localhost/api/projects/health

# Via docker exec (if Caddy is down or for debugging)
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
# Check logs
docker compose logs 00_dashboard

# Common issues:
# 1. Database connection failed → Verifique DATABASE_URL
# 2. Container conflict → Verifique docker compose.yml expose settings
# 3. Build error → Verifique Dockerfile, tente rebuild: docker compose build --no-cache 00_dashboard
```

### Saúde CHECK falha

```bash
# Verify service is running
docker compose ps 00_dashboard  # Should show "Up"

# Check health directly inside the container
docker exec oute-dashboard curl -sf http://localhost:3000/health

# Check logs for errors
docker compose logs 00_dashboard
```

### Database connection error

```bash
# Test connection
docker exec oute-postgres psql -U app-user -c "\l"  # List databases

# Check database exists
docker exec oute-postgres psql -U app-user -c "SELECT datname FROM pg_database WHERE datname = 'oute_main';"

# Create if missing
docker exec oute-postgres psql -U app-user -c "CREATE DATABASE oute_main;"
```

### Caddy routing not working

```bash
# Check Caddy logs
docker compose logs caddy

# Verify Caddyfile
cat configs/Caddyfile

# Reload Caddy
docker compose restart caddy
```

## Rollback

Se deployment falhar e precisa revert:

```bash
gcloud compute ssh oute-mind --zone=us-central1-a
cd ~/oute-mind

# Stop services
docker compose down 00_dashboard 01_auth-profile 02_projects

# Revert code to previous version
git log --oneline -10  # Ver commits
git checkout <PREVIOUS_COMMIT>

# Rebuild and start
docker compose build --no-cache 00_dashboard 01_auth-profile 02_projects
docker compose up -d 00_dashboard 01_auth-profile 02_projects

# Verify
docker exec oute-dashboard curl -sf http://localhost:3000/health
```

## Database Backup

Backup `oute_main` database:

```bash
# Automated (daily via cron)
# /var/lib/postgresql/backups/oute_main_YYYYMMDD.sql

# Manual backup
gcloud compute ssh oute-mind --zone=us-central1-a
docker exec oute-postgres pg_dump -U app-user oute_main > oute_main_backup.sql

# Restore from backup
docker exec -i oute-postgres psql -U app-user oute_main < oute_main_backup.sql
```

## Performance Monitoring

Prometheus e Grafana monitoram os serviços:

```bash
# Prometheus and Grafana are internal-only (not exposed on host ports).
# Access via SSH tunnel:

# Prometheus
gcloud compute ssh oute-mind --zone=us-central1-a -- -L 9090:prometheus:9090
# Then open http://localhost:9090

# Grafana
gcloud compute ssh oute-mind --zone=us-central1-a -- -L 3080:grafana:3000
# Then open http://localhost:3080
# Credentials: admin/GRAFANA_PASSWORD
```

Dashboards incluem métricas de:
- Request rate, latency, error rate
- CPU/Memory usage per service
- Database connections
- Network I/O

## Support

Para issues ou perguntas:

1. Verifique logs: `docker compose logs <service>`
2. Verifique health: `docker exec <container> curl -sf http://localhost:<internal_port>/health`
3. Verifique connectivity: Teste database, other services
4. Consulte este documento's troubleshooting section
5. Contate DevOps team

---

**Last Updated**: 2026-03-10
**Version**: 1.0
