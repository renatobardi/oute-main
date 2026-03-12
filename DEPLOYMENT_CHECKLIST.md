# Checklist de Deploy - oute-main na VM oute-mind

## Implementacao Completa

### Fase 1: Preparacao
- [x] Estrategia de banco de dados confirmada (2 databases separadas em PostgreSQL 16)
- [x] Compatibilidade ARM64 validada (node:20-alpine)
- [x] Mapeamento de portas definido e validado (sem conflitos)

### Fase 2: Modificacoes no oute-main
- [x] Endpoints de health check criados:
  - `GET /health` em packages/00_dashboard/src/routes/health/+server.ts
  - `GET /health` em packages/01_auth-profile/src/routes/health/+server.ts
  - `GET /health` em packages/02_projects/src/routes/health/+server.ts
- [x] Arquivo `.env.vm.example` criado
- [x] Workflow do GitHub Actions `deploy-to-vm.yml` criado
  - Build de imagens Docker multi-arch
  - Automacao de deploy via SSH
  - Health checks pos-deploy
  - Auto-deploy ao push para main
- [x] Documentacao `VM_DEPLOYMENT.md` criada

### Fase 3: Integracao com oute-mind
- [x] docker compose.yml atualizado:
  - 5 servicos oute-main adicionados (99_home, 00_dashboard, 01_auth-profile, 02_projects, 03_interview)
  - Servicos usam `expose` (rede interna Docker apenas, sem mapeamento de porta no host)
  - Health checks configurados
- [x] Grafana movido de porta 3001 para 3080 (libera 3001 para API de Auth)

### Fase 4: Banco de Dados e Roteamento
- [x] postgres-init.sql atualizado:
  - Database `oute_main` criado
  - Grants para app-user configurados
- [x] Caddyfile atualizado:
  - Roteamento baseado em path para servicos oute-main
  - `/` -> 99_home:3003
  - `/chat*` -> 03_interview:3002
  - `/dashboard*` -> 00_dashboard:3000
  - `/api/auth*` -> 01_auth-profile:3001
  - `/api/projects*` -> 02_projects:3002
- [x] prometheus.yml atualizado:
  - 5 jobs de monitoramento adicionados para servicos oute-main

### Fase 5: Automacao CI/CD
- [x] Workflow do GitHub Actions criado
  - Build multi-arch (arm64, amd64)
  - Deploy automatizado ao push para main
  - Integracao de health checks
  - Estrutura pronta para rollback

---

## Proximas Acoes (PRE-DEPLOY)

### 1. Commit das mudancas oute-main
```bash
cd ~/oute-main
git status  # Verificar mudancas
git add .
git commit -m "feat: add VM deployment configuration and health endpoints"
git push origin feat/vm-deployment  # ou seu branch
```

### 2. Criar PR para revisao
- Revisar mudancas em:
  - Endpoints de health (rotas `/health`)
  - `.env.vm.example`
  - Workflow do GitHub Actions
  - VM_DEPLOYMENT.md

### 3. Merge e Deploy
- Merge para branch main
- GitHub Actions dispara automaticamente
- Monitorar logs do workflow

### 4. Validacao Pos-Deploy
```bash
# SSH na VM
gcloud compute ssh oute-mind --zone=us-central1-a

# Verificar servicos
docker compose ps

# Health checks via Caddy (reverse proxy)
curl http://localhost/health
curl http://localhost/dashboard/health
curl http://localhost/api/auth/health
curl http://localhost/api/projects/health

# Health checks via docker exec (se Caddy estiver fora)
docker exec oute-home curl -sf http://localhost:3003/health
docker exec oute-interview curl -sf http://localhost:3002/health
docker exec oute-dashboard curl -sf http://localhost:3000/health
docker exec oute-auth curl -sf http://localhost:3001/health
docker exec oute-projects curl -sf http://localhost:3002/health
```

---

## Configuracao Necessaria na VM

### GitHub Secrets (no repositorio oute-main)
Adicionar os seguintes secrets no GitHub:
- `VM_SSH_PRIVATE_KEY`: Chave SSH Ed25519 codificada em Base64
- `VM_SSH_KNOWN_HOSTS`: Entrada de known_hosts
- `VM_HOSTNAME`: IP estatico da VM
- `VM_USER`: 'ubuntu' (padrao)

### .env.vm.production (na VM)
Arquivo `.env.vm.production` deve estar em `~/oute-mind/`:
```bash
NODE_ENV=production
DATABASE_URL=postgresql://app-user:PASSWORD@postgres:5432/oute_main
JWT_SECRET=SECURE_RANDOM_KEY
```

---

## Resumo de Acesso aos Servicos

Todos os servicos usam `expose` (rede interna Docker apenas). Somente o Caddy tem mapeamento de portas no host.

| Servico | Porta Interna | Porta Host | Acesso |
|---------|--------------|------------|--------|
| Caddy (Reverse Proxy) | 80, 443 | 80, 443 | Unico servico exposto externamente |
| 99_home | 3003 | -- | Via Caddy (`/`) |
| 03_interview | 3002 | -- | Via Caddy (`/chat`) |
| Dashboard | 3000 | -- | Via Caddy (`/dashboard`) |
| Auth API | 3001 | -- | Via Caddy (`/api/auth`) |
| Projects API | 3004 | -- | Via Caddy (`/api/projects`) |
| FastAPI | 8000 | -- | Via Caddy (`/health`, `/run`, `/docs`) |
| Grafana | 3000 | -- | Apenas interno (tunel SSH) |
| Prometheus | 9090 | -- | Apenas interno (tunel SSH) |
| PostgreSQL | 5432 | -- | Apenas interno |
| Redis | 6379 | -- | Apenas interno |
| Qdrant | 6333 | -- | Apenas interno |

---

## Fluxo de Deploy

```
Push do Usuario para Main
    |
GitHub Actions Disparado
    |
1. Build de imagens Docker multi-arch (arm64, amd64)
    |
2. Configurar SSH para a VM
    |
3. Deploy via SSH:
   - Pull do codigo mais recente
   - Rebuild dos servicos oute-main
   - Restart dos containers
    |
4. Executar Health Checks (via Caddy):
   - 99_home (`/health`)
   - 03_interview (`/chat/health`)
   - Dashboard (`/dashboard/health`)
   - Auth API (`/api/auth/health`)
   - Projects API (`/api/projects/health`)
    |
5. Verificar Roteamento do Caddy:
   - / -> 99_home
   - /chat -> 03_interview
   - /dashboard -> Dashboard
   - /api/auth -> Auth API
   - /api/projects -> Projects API
    |
Deploy com Sucesso OU Notificacao de Falha
```

---

## Resolucao de Problemas

### Health Check Falha
```bash
# Verificar status do container
docker compose ps 00_dashboard

# Verificar logs
docker compose logs 00_dashboard

# Verificar saude dentro do container
docker exec oute-dashboard curl -sf http://localhost:3000/health
```

### Erro de Conexao com Banco de Dados
```bash
# Verificar se o banco oute_main existe
docker exec oute-postgres psql -U app-user -c "\l"

# Verificar grants
docker exec oute-postgres psql -U app-user -d oute_main -c "\dt"
```

### Roteamento do Caddy Nao Funciona
```bash
# Verificar Caddyfile
cat configs/Caddyfile

# Verificar se o Caddy esta rodando
docker compose logs caddy

# Recarregar Caddy
docker compose restart caddy
```

---

## Arquivos Modificados/Criados

### Criados:
- `/Users/bardi/Projetos/oute-main/packages/00_dashboard/src/routes/health/+server.ts`
- `/Users/bardi/Projetos/oute-main/packages/01_auth-profile/src/routes/health/+server.ts`
- `/Users/bardi/Projetos/oute-main/packages/02_projects/src/routes/health/+server.ts`
- `/Users/bardi/Projetos/oute-main/.env.vm.example`
- `/Users/bardi/Projetos/oute-main/.github/workflows/deploy-to-vm.yml`
- `/Users/bardi/Projetos/oute-main/VM_DEPLOYMENT.md`
- `/Users/bardi/Projetos/oute-main/DEPLOYMENT_CHECKLIST.md` (este arquivo)

### Modificados:
- `/Users/bardi/Projetos/oute-mind/docker compose.yml` (5 servicos adicionados + mudanca de porta do Grafana)
- `/Users/bardi/Projetos/oute-mind/configs/postgres-init.sql` (banco oute_main adicionado)
- `/Users/bardi/Projetos/oute-mind/configs/Caddyfile` (roteamento oute-main adicionado)
- `/Users/bardi/Projetos/oute-mind/configs/prometheus.yml` (jobs de monitoramento adicionados)

---

## Pronto para Deploy

**Status**: Todos os arquivos de configuracao criados e integrados. Pronto para testes e deploy.

**Proximo Passo**: Push das mudancas para o GitHub e disparo do deploy automatizado via GitHub Actions.

---

**Gerado em**: 10/03/2026
**Versao**: 1.0
