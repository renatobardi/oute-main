# Plano de Execucao — Deploy oute-main (VM arm64)

## Contexto
Issues identificados na sessao de CI/CD fix do PR #18 e deploy to VM.
Objetivo: deploy funcional, seguro e performatico.

---

## FASE 1 — Correcoes Criticas (deploy quebrado)

### 1.1 Portas erradas nos health checks
**Arquivo:** `.github/workflows/deploy-to-vm.yml`
**Problema:** Health checks apontam para portas 3020/3021/3022, mas docker-compose expoe 3000/3001/3002.
**Fix:** Corrigir para 3000, 3001, 3002.

### 1.2 Build local descartado
**Arquivo:** `.github/workflows/deploy-to-vm.yml`
**Problema:** O workflow builda 3 images Docker no runner (arm64 cross-compile, ~30min) com `--push=false`, depois faz SSH na VM e roda `docker-compose build --no-cache` que rebuilda tudo do zero. O build do runner eh completamente desperdicado.
**Fix:** Remover o build local. O deploy deve apenas fazer SSH na VM, git pull e docker-compose build/up.

### 1.3 SSH StrictHostKeyChecking=no
**Arquivo:** `.github/workflows/deploy-to-vm.yml`
**Problema:** Desabilita verificacao de host key, vulneravel a MITM.
**Fix:** Remover flag, usar known_hosts configurado no step anterior.

### 1.4 Sleep fixo de 10s
**Arquivo:** `.github/workflows/deploy-to-vm.yml`
**Problema:** `sleep 10` apos docker-compose up. Arbitrario.
**Fix:** Remover sleep, os health checks ja fazem retry com polling.

---

## FASE 2 — Seguranca

### 2.1 Credenciais hardcoded no docker-compose.yml
**Problema:** POSTGRES_PASSWORD, DATABASE_URL, JWT_SECRET estao em texto no docker-compose.yml.
**Fix:** Mover para arquivo `.env` na VM (nao versionado). O docker-compose.yml deve referenciar `${VAR}`.

### 2.2 Caddy routing verification sem config
**Problema:** O workflow testa rotas Caddy (/dashboard/health, /api/auth/health) mas nao valida se Caddy esta configurado.
**Fix:** Tornar step opcional com `continue-on-error: true` (ja tem parcialmente) ou remover ate Caddy estar configurado.

---

## FASE 3 — Performance

### 3.1 Eliminar cross-compilation no CI
**Problema:** Build arm64 em runner x86 usa QEMU (muito lento, ~30min).
**Fix (ja na Fase 1.2):** Buildar diretamente na VM arm64 via SSH. A VM compila nativamente em segundos.

### 3.2 Docker layer caching na VM
**Problema:** `docker-compose build --no-cache` forca rebuild total.
**Fix:** Remover `--no-cache`. Docker layer cache acelera builds incrementais.

### 3.3 Storybook com http-server
**Arquivo:** `packages/design-system/Dockerfile`
**Problema:** Usa `http-server` (basico) para servir Storybook.
**Fix futuro:** Servir via Caddy (ja presente na VM) ou Nginx.

---

## FASE 4 — Resiliencia

### 4.1 Rollback strategy
**Problema:** Se o deploy falhar apos parar containers, o sistema fica quebrado.
**Fix:** Antes de parar, guardar imagens atuais com tag. Se falhar, restore.

### 4.2 Capturar logs em caso de falha
**Problema:** Health check failures nao mostram logs dos containers.
**Fix:** Adicionar step de `docker-compose logs` quando health check falha.

### 4.3 Validacao pre-deploy
**Fix:** Verificar que a VM esta acessivel (SSH test) antes de iniciar o deploy.

---

## FASE 5 — Limpeza

### 5.1 Limpar branches obsoletas
Branches para deletar:
- `fix/validate-ci-checks`
- `test/validate-ci-v2`
- `ci/validate-cicd-hello-world`
- Outras branches de docs/features ja mergeadas

### 5.2 Remover CI_VALIDATION.md
Arquivo criado para teste, nao tem utilidade.

### 5.3 Vincular SonarCloud ao repo
O projeto `oute-main` no SonarCloud precisa de ALM binding com o repo GitHub para analise de PRs funcionar corretamente (nao apenas automatic analysis).

---

## Ordem de Execucao

| # | Item | Impacto | Esforco |
|---|------|---------|---------|
| 1 | 1.2 Remover build local, buildar na VM | Critico | Medio |
| 2 | 1.1 Fix portas health check | Critico | Baixo |
| 3 | 1.3 Fix SSH security | Alto | Baixo |
| 4 | 1.4 Remover sleep | Baixo | Baixo |
| 5 | 2.1 Externalizar credenciais | Alto | Medio |
| 6 | 2.2 Fix Caddy verification | Medio | Baixo |
| 7 | 3.2 Habilitar Docker cache | Medio | Baixo |
| 8 | 4.2 Logs em falha | Medio | Baixo |
| 9 | 4.3 Pre-deploy SSH test | Medio | Baixo |
| 10 | 4.1 Rollback strategy | Medio | Medio |
| 11 | 5.1-5.3 Limpeza | Baixo | Baixo |
