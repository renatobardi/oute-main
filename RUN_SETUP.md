# Configuracao de Producao - Inicio Rapido

Instrucoes completas para fazer deploy do 99_home e 03_interview em producao no `34.132.93.171`.

## Pre-requisitos

- Acesso SSH a VM em `ubuntu@34.132.93.171`
- Ambos os repositorios `oute-main` e `oute-mind` clonados no diretorio home:
  ```
  ~/oute-main/      (este repositorio)
  ~/oute-mind/      (orquestracao de producao)
  ```

---

## Configuracao Rapida (3 Scripts)

### Passo 1: SSH na VM

```bash
ssh ubuntu@34.132.93.171
```

### Passo 2: Navegar para oute-mind

```bash
cd ~/oute-mind
```

### Passo 3: Copiar scripts do oute-main

```bash
cp ../oute-main/setup-production.sh .
cp ../oute-main/update-caddyfile.sh .
cp ../oute-main/test-production.sh .
chmod +x setup-production.sh update-caddyfile.sh test-production.sh
```

### Passo 4: Executar script de configuracao

Adiciona 99_home e 03_interview ao docker-compose.yml e faz build dos servicos:

```bash
./setup-production.sh
```

**O que ele faz:**
- Backup do docker-compose.yml
- Adiciona servico 99_home (porta 3003)
- Adiciona servico 03_interview (porta 3002)
- Faz build das imagens Docker
- Inicia os servicos
- Recarrega o Caddy

**Tempo:** ~5 minutos

### Passo 5: Atualizar Caddyfile

Configura as regras de roteamento do reverse proxy:

```bash
./update-caddyfile.sh
```

**O que ele faz:**
- Backup do Caddyfile
- Configura roteamento para raiz (/) -> 99_home
- Configura roteamento para /chat -> 03_interview
- Mantem roteamento existente de APIs (/api/auth, /api/projects)
- Recarrega o Caddy com a nova configuracao

**Tempo:** ~30 segundos

### Passo 6: Testar deploy

Verifica se tudo esta funcionando:

```bash
./test-production.sh
```

**Saida esperada:**
```
99_home health OK
03_interview health OK
01_auth-profile health OK
00_dashboard health OK
02_projects health OK
Caddy health OK
Root path (/) OK
Chat path (/chat) OK
Auth API (/api/auth) OK

Todos os testes passaram! Producao esta pronta.
```

---

## Verificacao Manual

Se os scripts nao funcionarem ou precisar depurar:

### Verificar status dos containers
```bash
cd ~/oute-mind
docker compose ps
```

### Ver logs
```bash
# Logs do 99_home
docker compose logs -f 99_home

# Logs do 03_interview
docker compose logs -f 03_interview

# Logs do Caddy
docker compose logs -f caddy
```

### Testar endpoints manualmente
```bash
# Servico direto
curl http://localhost:3003/health
curl http://localhost:3002/health

# Via Caddy
curl http://localhost/health
curl http://34.132.93.171/
curl http://34.132.93.171/chat
```

---

## Resolucao de Problemas

### Servicos nao iniciam

**Verificar logs:**
```bash
docker compose logs 99_home
docker compose logs 03_interview
```

**Problemas comuns:**
- Build falhou: Verificar se Dockerfiles existem em `../oute-main/packages/99_home/Dockerfile`
- Porta ja em uso: Verificar `docker compose ps` e `sudo lsof -i :3003`
- Sem espaco em disco: Verificar `df -h`

### Roteamento nao funciona

**Verificar Caddyfile:**
```bash
cat Caddyfile | grep -A 5 "@root"
```

**Recarregar Caddy:**
```bash
docker compose up -d caddy
```

**Verificar logs do Caddy:**
```bash
docker compose logs caddy | tail -50
```

### 99_home mostra resposta de API ao inves da landing page

**Causa:** Roteamento raiz nao configurado no Caddyfile

**Solucao:**
```bash
./update-caddyfile.sh
```

### "no such service: 99_home"

**Causa:** docker-compose.yml nao tem o servico definido

**Solucao:**
```bash
./setup-production.sh
```

---

## Instrucoes de Rollback

Se algo der errado, o rollback e simples:

```bash
cd ~/oute-mind

# Restaurar docker-compose.yml
cp docker-compose.yml.backup.* docker-compose.yml

# Restaurar Caddyfile
cp Caddyfile.backup.* Caddyfile

# Reiniciar com configuracao anterior
docker compose up -d
```

---

## O que Esta Rodando Apos a Configuracao

### Servicos
```
99_home         -> Porta 3003 (Landing Page)
03_interview    -> Porta 3002 (Chat)
00_dashboard    -> Porta 3000 (Dashboard)
01_auth-profile -> Porta 3001 (API de Auth)
02_projects     -> Porta 3004 (API de Projetos)
caddy           -> Porta 80 (Reverse Proxy)
postgres        -> Porta 5432 (Banco de Dados)
```

### URLs Publicas (via Caddy em 34.132.93.171)
```
http://34.132.93.171/              -> 99_home (Landing Page)
http://34.132.93.171/chat          -> 03_interview (Chat)
http://34.132.93.171/api/auth      -> 01_auth-profile (Auth)
http://34.132.93.171/api/projects  -> 02_projects (Projetos)
http://34.132.93.171/dashboard     -> 00_dashboard (Dashboard)
```

---

## Jornada do Usuario

1. Usuario visita http://34.132.93.171/ -> Ve a landing page (99_home)
2. Usuario clica "Entrar na Oute" -> Vai para /login (ainda 99_home)
3. Usuario preenche formulario de login -> Chama /api/auth?action=login (01_auth-profile)
4. Usuario recebe JWT -> Armazenado em localStorage
5. Redirecionado para /chat -> Ve interface de chat (03_interview)
6. Usuario pode interagir com o chat e todas as funcionalidades

---

## Proximos Passos (Opcional)

Apos tudo estar funcionando:

1. **Habilitar HTTPS:**
   - Atualizar Caddyfile para usar `https://34.132.93.171`
   - Caddy gerencia certificados SSL automaticamente

2. **Monitorar saude:**
   ```bash
   watch -n 5 'docker compose ps'
   ```

3. **Visualizar metricas:**
   - Prometheus: http://34.132.93.171:9090
   - Grafana: http://34.132.93.171:3080

4. **Backup do banco de dados:**
   ```bash
   docker compose exec postgres pg_dump -U app-user oute_db > backup.sql
   ```

---

## Precisa de Ajuda?

Consulte estes arquivos para mais detalhes:
- `PRODUCTION_SETUP.md` - Guia detalhado de configuracao
- `CADDY_ROUTING.md` - Referencia completa de roteamento
- `docker-compose.yml` - Definicoes dos servicos
- `Caddyfile` - Configuracao do reverse proxy

---

## Resumo

```bash
# Configuracao completa em 4 comandos:
ssh ubuntu@34.132.93.171
cd ~/oute-mind && cp ../oute-main/{setup,update-caddyfile,test}-production.sh . && chmod +x *.sh
./setup-production.sh
./update-caddyfile.sh
./test-production.sh
```

Pronto!
