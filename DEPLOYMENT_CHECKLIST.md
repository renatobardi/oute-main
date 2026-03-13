# Deployment Checklist - oute-main to oute-mind VM

## ✅ Implementação Completa

### Fase 1: Preparação ✅
- [x] Database strategy confirmada (2 databases separadas em PostgreSQL 16)
- [x] ARM64 compatibility validada (node:20-alpine)
- [x] Port mapping definido e validado (sem conflitos)

### Fase 2: oute-main Modifications ✅
- [x] Health check endpoints criados:
  - `GET /health` em packages/00_dashboard/src/routes/health/+server.ts
  - `GET /health` em packages/01_auth-profile/src/routes/health/+server.ts
  - `GET /health` em packages/02_projects/src/routes/health/+server.ts
- [x] Arquivo `.env.vm.example` criado
- [x] GitHub Actions workflow `deploy-to-vm.yml` criado
  - Build multi-arch Docker images
  - SSH deployment automation
  - Health checks pós-deploy
  - Auto-deploy on push to main
- [x] Documentação `VM_DEPLOYMENT.md` criada

### Fase 3: oute-mind Integration ✅
- [x] docker compose.yml atualizado:
  - 3 serviços oute-main adicionados (00_dashboard, 01_auth-profile, 02_projects)
  - Services use `expose` (internal Docker network only, no host port mapping)
  - Health checks configurados
- [x] Grafana movido de porta 3001 → 3080 (libera 3001 para Auth API)

### Fase 4: Database & Routing ✅
- [x] postgres-init.sql atualizado:
  - Database `oute_main` criado
  - Grants para app-user configurados
- [x] Caddyfile atualizado:
  - Path-based routing para oute-main services
  - `/dashboard*` → 00_dashboard:3000
  - `/api/auth*` → 01_auth-profile:3001
  - `/api/projects*` → 02_projects:3002
- [x] prometheus.yml atualizado:
  - 3 jobs de monitoring adicionados para oute-main services

### Fase 5: CI/CD Automation ✅
- [x] GitHub Actions workflow criado
  - Multi-arch build (arm64, amd64)
  - Automated deployment on push to main
  - Health checks integration
  - Rollback-ready structure

---

## 📋 Próximas Ações (PRÉ-DEPLOY)

### 1. Commit das mudanças oute-main
```bash
cd /Users/bardi/Projetos/oute-main
git status  # Verificar mudanças
git add .
git commit -m "feat: add VM deployment configuration and health endpoints"
git push origin feat/vm-deployment  # ou seu branch
```

### 2. Create PR para review
- Revisar mudanças em:
  - Health endpoints (`/health` routes)
  - `.env.vm.example`
  - GitHub Actions workflow
  - VM_DEPLOYMENT.md

### 3. Merge & Deploy
- Merge para main branch
- GitHub Actions dispara automaticamente
- Monitorar workflow logs

### 4. Validação Post-Deploy
```bash
# SSH na VM
gcloud compute ssh oute-mind --zone=us-central1-a

# Verificar services
docker compose ps

# Health checks via Caddy (reverse proxy)
curl http://localhost/dashboard/health
curl http://localhost/api/auth/health
curl http://localhost/api/projects/health

# Health checks via docker exec (if Caddy is down)
docker exec oute-dashboard curl -sf http://localhost:3000/health
docker exec oute-auth curl -sf http://localhost:3001/health
docker exec oute-projects curl -sf http://localhost:3002/health
```

---

## 🔧 Configuração Necessária na VM

### GitHub Secrets (em oute-main repo)
Adicionar os seguintes secrets no GitHub:
- `VM_SSH_PRIVATE_KEY`: Base64-encoded Ed25519 SSH key
- `VM_SSH_KNOWN_HOSTS`: known_hosts entry
- `VM_HOSTNAME`: IP estático da VM
- `VM_USER`: 'ubuntu' (default)

### .env.vm.production (na VM)
Arquivo `.env.vm.production` deve estar em `/Users/bardi/Projetos/oute-mind/`:
```bash
NODE_ENV=production
DATABASE_URL=postgresql://app-user:PASSWORD@postgres:5432/oute_main
JWT_SECRET=SECURE_RANDOM_KEY
```

---

## 📊 Service Access Summary

All services use `expose` (internal Docker network only). Only Caddy has host port mappings.

| Serviço | Internal Port | Host Port | Access |
|---------|--------------|-----------|--------|
| Caddy (Reverse Proxy) | 80, 443 | 80, 443 | Only externally exposed service |
| Dashboard | 3000 | — | Via Caddy (`/dashboard`) |
| Auth API | 3001 | — | Via Caddy (`/api/auth`) |
| Projects API | 3002 | — | Via Caddy (`/api/projects`) |
| FastAPI | 8000 | — | Via Caddy (`/health`, `/run`, `/docs`) |
| Grafana | 3000 | — | Internal only (SSH tunnel) |
| Prometheus | 9090 | — | Internal only (SSH tunnel) |
| PostgreSQL | 5432 | — | Internal only |
| Redis | 6379 | — | Internal only |
| Qdrant | 6333 | — | Internal only |

---

## 🚀 Deployment Flow

```
User Push to Main
    ↓
GitHub Actions Triggered
    ↓
1. Build multi-arch Docker images (arm64, amd64)
    ↓
2. Configure SSH to VM
    ↓
3. Deploy via SSH:
   - Pull latest code
   - Rebuild oute-main services
   - Restart containers
    ↓
4. Run Health Checks (via Caddy):
   - Dashboard (`/dashboard/health`)
   - Auth API (`/api/auth/health`)
   - Projects API (`/api/projects/health`)
    ↓
5. Verify Caddy Routing:
   - /dashboard → Dashboard
   - /api/auth → Auth API
   - /api/projects → Projects API
    ↓
✅ Deployment Success OR ❌ Failure Notification
```

---

## 🐛 Troubleshooting

### Health Check Fails
```bash
# Check container status
docker compose ps 00_dashboard

# Check logs
docker compose logs 00_dashboard

# Check health inside container
docker exec oute-dashboard curl -sf http://localhost:3000/health
```

### Database Connection Error
```bash
# Verify oute_main database exists
docker exec oute-postgres psql -U app-user -c "\l"

# Check grants
docker exec oute-postgres psql -U app-user -d oute_main -c "\dt"
```

### Caddy Routing Not Working
```bash
# Check Caddyfile
cat configs/Caddyfile

# Verify Caddy is running
docker compose logs caddy

# Reload Caddy
docker compose restart caddy
```

---

## 📝 Files Modified/Created

### Created:
- ✅ `/Users/bardi/Projetos/oute-main/packages/00_dashboard/src/routes/health/+server.ts`
- ✅ `/Users/bardi/Projetos/oute-main/packages/01_auth-profile/src/routes/health/+server.ts`
- ✅ `/Users/bardi/Projetos/oute-main/packages/02_projects/src/routes/health/+server.ts`
- ✅ `/Users/bardi/Projetos/oute-main/.env.vm.example`
- ✅ `/Users/bardi/Projetos/oute-main/.github/workflows/deploy-to-vm.yml`
- ✅ `/Users/bardi/Projetos/oute-main/VM_DEPLOYMENT.md`
- ✅ `/Users/bardi/Projetos/oute-main/DEPLOYMENT_CHECKLIST.md` (this file)

### Modified:
- ✅ `/Users/bardi/Projetos/oute-mind/docker compose.yml` (added 3 services + Grafana port change)
- ✅ `/Users/bardi/Projetos/oute-mind/configs/postgres-init.sql` (added oute_main database)
- ✅ `/Users/bardi/Projetos/oute-mind/configs/Caddyfile` (added oute-main routing)
- ✅ `/Users/bardi/Projetos/oute-mind/configs/prometheus.yml` (added monitoring jobs)

---

## ✨ Ready for Deployment

**Status**: All configuration files created and integrated. Ready for testing and deployment.

**Next Step**: Push changes to GitHub and trigger automated deployment via GitHub Actions.

---

**Generated**: 2026-03-10
**Version**: 1.0
