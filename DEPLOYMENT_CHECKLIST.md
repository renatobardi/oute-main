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
- [x] docker-compose.yml atualizado:
  - 3 serviços oute-main adicionados (00_dashboard, 01_auth-profile, 02_projects)
  - Port mapping: 3020-3022 (host) → 3000-3002 (container)
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
ssh ubuntu@<VM_IP>

# Verificar services
docker-compose ps

# Health checks
curl http://localhost:3020/health  # Dashboard
curl http://localhost:3021/health  # Auth API
curl http://localhost:3022/health  # Projects API

# Via Caddy (reverse proxy)
curl http://localhost/dashboard/health
curl http://localhost/api/auth/health
curl http://localhost/api/projects/health
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

## 📊 Port Mapping Summary

| Serviço | Porta Host | Porta Container | Status |
|---------|-----------|-----------------|--------|
| Dashboard | 3020 | 3000 | ✅ Novo |
| Auth API | 3021 | 3001 | ✅ Novo |
| Projects API | 3022 | 3002 | ✅ Novo |
| Jina Reader | 3000 | 3000 | ✅ Crítico (não mexer) |
| Grafana | 3080 | 3000 | ✅ Movido (de 3001) |
| FastAPI | 8000 | 8000 | ✅ Existente |
| Prometheus | 9090 | 9090 | ✅ Existente |
| PostgreSQL | 5432 | 5432 | ✅ Existente |
| Caddy (Reverse Proxy) | 80 | 80 | ✅ Existente |

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
4. Run Health Checks:
   - Dashboard (3020)
   - Auth API (3021)
   - Projects API (3022)
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
docker-compose ps 00_dashboard

# Check logs
docker-compose logs 00_dashboard

# Verify port mapping
netstat -tulpn | grep 3020
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
docker-compose logs caddy

# Reload Caddy
docker-compose restart caddy
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
- ✅ `/Users/bardi/Projetos/oute-mind/docker-compose.yml` (added 3 services + Grafana port change)
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
