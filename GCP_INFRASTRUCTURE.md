# 🏗️ GCP Infrastructure Documentation
**Última atualização:** 2026-03-12
**Responsável:** Infrastructure Team

---

## 📊 Resumo Executivo

| Métrica | Valor |
|---------|-------|
| **Projetos GCP** | 5 total (1 ativo, 4 inativos) |
| **VMs em Produção** | 1 (oute-mind) |
| **Custos Evitados** | VM mindsdb deletada (20GB disco + e2-standard-2) |
| **Principal Endpoint** | 34.132.93.171 |
| **Zona de Produção** | us-central1-a |

---

## 🎯 Projetos GCP Ativos

### 1. **oute-mind** (PRODUÇÃO) ⭐
**ID:** `897931738821`
**Status:** ✅ ATIVO

#### VMs
| Nome | Zona | Status | Tipo | vCPU/RAM | IP Externo | Disco |
|------|------|--------|------|----------|-----------|-------|
| **oute-mind** | us-central1-a | RUNNING | t2a-standard-4 | 4vCPU/16GB | 34.132.93.171 | 100GB |

#### Recursos
- **IP Reservado:** oute-mind-ip (34.132.93.171) - IN_USE
- **Discos:** oute-mind (100GB, READY)
- **Zona:** us-central1-a (região central)

#### Deploy
- **Método:** GitHub Actions → gcloud compute ssh
- **Branch:** main
- **Frequência:** On push to main
- **Zone Detection:** AUTO-DETECT (desde 2026-03-12)

#### Serviços Rodando
```
docker-compose up -d:
- 00_dashboard    (porta 3000)
- 01_auth-profile (porta 3001)
- 02_projects     (porta 3002)
- 99_home         (porta 3003)
- 03_interview    (porta 3002, /chat)
- caddy           (reverse proxy)
```

#### Health Checks
- Dashboard:     http://127.0.0.1:3000/dashboard/health
- Auth:          http://127.0.0.1:3001/health
- Projects:      http://127.0.0.1:3002/health
- Home:          http://127.0.0.1:3003/health
- Interview:     http://127.0.0.1:3002/chat/health

---

### 2-5. Projetos Inativos (⚠️ Considerar Deletar)

| Projeto | ID | Status | Motivo |
|---------|----|----|--------|
| oute-488700 | 653066273995 | VAZIO | Não utilizado |
| oute-488706 | 997952019084 | VAZIO | Não utilizado |
| oute-main | 429355980346 | VAZIO | Não utilizado |
| projetos-489821 | 149853006010 | VAZIO | Não utilizado |

**Recomendação:** Deletar projetos inativos para simplificar billing.

---

## 🗺️ Arquitetura GCP

```
┌─────────────────────────────────────────────────────────┐
│ Projeto: oute-mind (897931738821)                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Region: us-central1                                    │
│  ├── Zone: us-central1-a (PRODUÇÃO)                     │
│  │   ├── VM: oute-mind                                  │
│  │   │   ├── Type: t2a-standard-4 (ARM64, ~$90/mês)    │
│  │   │   ├── IP Externo: 34.132.93.171                  │
│  │   │   ├── Disco: 100GB (~$4/mês)                     │
│  │   │   └── Serviços: 5 containers Docker             │
│  │   │                                                  │
│  │   └── Disco: oute-mind (100GB, standalone)           │
│  │                                                      │
│  └── IP Reservado: oute-mind-ip (34.132.93.171)        │
│      └── Status: IN_USE                                │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Deployment Flow

### GitHub Actions Workflow
**File:** `.github/workflows/deploy-to-vm.yml`

```yaml
trigger: push to main
  ↓
zone=$(gcloud compute instances list --filter="name:oute-mind" ...)
  ↓
gcloud compute ssh oute-mind --zone=$ZONE --project=oute-mind
  ↓
sudo bash:
  1. git pull origin main (oute-main)
  2. git pull origin main (oute-mind)
  3. docker compose build --no-cache
  4. docker compose up -d
  5. docker compose restart caddy
  ↓
health-checks (10 tentativas, 3s cada)
  ↓
success/failure logs
```

### Key Features
- ✅ **Zone Auto-Detection:** Detecta zona dinamicamente
- ✅ **No-Cache Build:** Força rebuild completo
- ✅ **Health Checks:** 5 serviços, falha se >2 falharem
- ✅ **IAP Tunnel:** Usa Identity-Aware Proxy (seguro)
- ✅ **Aggressive Cleanup:** Remove node_modules, build, .svelte-kit, .npm

---

## 💰 Custos (Estimado)

| Recurso | Tipo | Preço |
|---------|------|-------|
| VM oute-mind | t2a-standard-4 | ~$90/mês |
| Disco | 100GB | ~$4/mês |
| IP Reservado | External Static | ~$2/mês |
| **Total Mensal** | | **~$96/mês** |

**Nota:** Projetos inativos podem estar gerando custos mínimos de storage/networks.

---

## 🔒 Security & Access

### Authentication
- **Method:** IAP Tunnel (gcloud compute ssh)
- **Service Account:** oute-mind
- **Workload Identity:** Configurado
- **MCP:** Tunnel-through-iap

### SSH Access
```bash
gcloud compute ssh oute-mind \
  --zone=us-central1-a \
  --project=oute-mind \
  --tunnel-through-iap
```

### Environment
```
.env.production (linked via ln -sf)
/opt/oute-main/
/opt/oute-mind/
```

---

## ⚠️ Known Issues & Solutions

### Issue 1: Hardcoded Zone
**Status:** ✅ FIXED (2026-03-12)

**Problem:** Deploy estava usando zona hardcoded `us-central1-a`, não detectava dinamicamente.

**Solution:** Workflow updated para auto-detectar zona:
```bash
ZONE=$(gcloud compute instances list --filter="name:oute-mind" ...)
gcloud compute ssh oute-mind --zone=$ZONE ...
```

---

## ✅ Checklist de Manutenção

- [x] Deletar VM terminada mindsdb
- [x] Deletar disco orphan
- [x] Corrigir zone auto-detection no workflow
- [ ] Deletar projetos inativos (oute-488700, oute-488706, etc)
- [ ] Criar alerts de custos (>$150/mês)
- [ ] Backup policy para oute-mind disco
- [ ] Monitor health checks status

---

## 📞 Troubleshooting

### Deploy Falha
1. Verificar zone: `gcloud compute instances list --project=oute-mind`
2. SSH manual: `gcloud compute ssh oute-mind --project=oute-mind --tunnel-through-iap`
3. Docker status: `docker compose ps`
4. Logs: `docker compose logs --tail=50 99_home`

### Custos Altos
1. Deletar projetos inativos
2. Revisar discos orphans: `gcloud compute disks list`
3. Revisar IPs não-utilizados: `gcloud compute addresses list`

---

## 📚 Referências

- [GCP Compute Engine Pricing](https://cloud.google.com/compute/pricing)
- [IAP Documentation](https://cloud.google.com/iap/docs)
- [Cloud SDK gcloud](https://cloud.google.com/sdk/gcloud)

---

**Document Version:** 1.0
**Last Review:** 2026-03-12 17:30 UTC
**Next Review:** 2026-04-12
