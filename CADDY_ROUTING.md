# Configuracao do Reverse Proxy Caddy para Producao

Este documento descreve como o Caddy deve ser configurado para rotear o trafego do monorepo OUTE em producao.

## Visao Geral

A aplicacao OUTE consiste em 5 servicos principais rodando na VM em `34.132.93.171`:

| Servico | Porta Host | Porta Container | Finalidade |
|---------|-----------|-----------------|------------|
| **99_home** | 3003 | 3003 | Landing page (raiz `/`) |
| **03_interview** | 3002 | 3002 | Interface de chat (`/chat`) |
| **00_dashboard** | 3000 | 3000 | Dashboard principal (fallback padrao) |
| **01_auth-profile** | 3001 | 3001 | API de autenticacao (`/api/auth/*`) |
| **02_projects** | 3004 | 3002 | API de projetos (`/api/projects/*`) |

## Configuracao Necessaria do Caddy

O reverse proxy Caddy (localizado em `~/oute-mind/Caddyfile`) deve ser configurado da seguinte forma:

```caddyfile
# Configuracao de Roteamento OUTE em Producao
# O Caddy usa DNS do Docker para resolver nomes de containers dentro da oute-network.
# Servicos usam `expose` (nao `ports`), entao sao acessiveis apenas pela rede Docker.

# Roteamento do dominio raiz
34.132.93.171 {
  # Landing page na raiz
  @root path /
  handle @root {
    reverse_proxy http://oute-home:3003
  }

  # Interface de chat
  @chat path /chat*
  handle @chat {
    reverse_proxy http://oute-interview:3002
  }

  # Endpoints da API de autenticacao
  @auth path /api/auth*
  handle @auth {
    reverse_proxy http://01_auth-profile:3001
  }

  # Endpoints da API de projetos
  @projects path /api/projects*
  handle @projects {
    reverse_proxy http://02_projects:3002
  }

  # Fallback padrao para o Dashboard
  handle {
    reverse_proxy http://00_dashboard:3000
  }

  # Headers CORS para requisicoes cross-origin
  header * {
    Access-Control-Allow-Origin "34.132.93.171"
    Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Access-Control-Allow-Headers "Content-Type, Authorization"
    Access-Control-Allow-Credentials "true"
  }

  # Logging
  log {
    output stdout
    format json
  }
}
```

## Logica de Roteamento

### Fluxo de Requisicoes

```
Requisicao do Cliente (34.132.93.171)
    |
Caddy Reverse Proxy (Porta 80 no host)
    |  (roteia para containers via rede interna Docker)
    |-- /                  -> http://oute-home:3003 (99_home - Landing Page)
    |-- /chat              -> http://oute-interview:3002 (03_interview - Chat)
    |-- /api/auth/*        -> http://01_auth-profile:3001 (API de Auth)
    |-- /api/projects/*    -> http://02_projects:3002 (API de Projetos)
    +-- /* (padrao)        -> http://00_dashboard:3000 (App Principal)
```

## Jornada do Usuario

1. **Usuario visita `34.132.93.171/`**
   - Caddy roteia para `http://oute-home:3003` (99_home)
   - Landing page carrega com hero, CTA, estatisticas

2. **Usuario clica "Entrar na Oute" (CTA)**
   - Redireciona para `/login`
   - Ainda servido pelo 99_home (3003)

3. **Usuario submete formulario de login**
   - Frontend chama `POST 34.132.93.171/api/auth?action=login`
   - Caddy roteia para `http://01_auth-profile:3001`
   - API de login processa credenciais, retorna JWT

4. **Usuario redirecionado para `/chat` apos login**
   - Caddy roteia para `http://oute-interview:3002` (03_interview)
   - Interface de chat carrega com autenticacao

5. **Usuario interage com o chat**
   - Todas as chamadas de API passam pelo roteamento do Caddy
   - Tokens de autenticacao sao validados pelo 01_auth-profile

## Passos de Implementacao

### Na VM (repositorio `oute-mind`)

1. **Atualizar `Caddyfile`** com a configuracao acima
2. **Recarregar Caddy**:
   ```bash
   cd ~/oute-mind
   docker compose up -d caddy
   ```

3. **Testar roteamento**:
   ```bash
   # Testar cada endpoint (via Caddy na porta 80)
   curl http://localhost/
   curl http://localhost/chat
   curl http://localhost/api/auth/status
   ```

## Verificacoes de Saude

Cada servico expoe um endpoint `/health`:

```bash
# Via Caddy (recomendado - portas dos servicos nao sao expostas no host)
curl http://localhost/health
curl http://localhost/dashboard/health
curl http://localhost/api/auth/health
curl http://localhost/api/projects/health

# Via docker exec (para depuracao quando o Caddy estiver fora)
docker exec oute-home curl -sf http://localhost:3003/health
docker exec oute-interview curl -sf http://localhost:3002/health
docker exec oute-dashboard curl -sf http://localhost:3000/health
docker exec oute-auth curl -sf http://localhost:3001/health
docker exec oute-projects curl -sf http://localhost:3002/health
```

## Variaveis de Ambiente dos Servicos

Cada servico le variaveis de ambiente do `.env.production`:

### 99_home (.env.production)
```
VITE_AUTH_SERVICE_URL=http://34.132.93.171
VITE_API_TIMEOUT=30000
VITE_ENV=production
```

### 03_interview (.env.production)
```
VITE_AUTH_SERVICE_URL=http://34.132.93.171
VITE_API_TIMEOUT=30000
VITE_ENV=production
```

### 01_auth-profile (.env.production)
```
DATABASE_URL=postgresql://app-user:password@postgres:5432/oute_db
JWT_SECRET=your-production-secret-key
NODE_ENV=production
```

### 02_projects (.env.production)
```
DATABASE_URL=postgresql://app-user:password@postgres:5432/oute_db
AUTH_SERVICE_URL=http://01_auth-profile:3001
JWT_SECRET=your-production-secret-key
NODE_ENV=production
```

## Resolucao de Problemas

### Problema: "API na raiz ao inves da landing page"

**Causa**: Roteamento do Caddy nao configurado corretamente, ou container errado definido como handler padrao.

**Solucao**:
1. Verificar se o `Caddyfile` tem o padrao de rota raiz para 99_home (3003)
2. Verificar logs do Caddy: `docker compose logs caddy`
3. Garantir que 99_home esta rodando: `docker compose ps`

### Problema: "Erros de CORS ao chamar `/api/auth`"

**Causa**: Headers CORS nao configurados ou origin incorreto.

**Solucao**:
1. Verificar se `01_auth-profile/src/hooks.server.ts` tem middleware de CORS
2. Verificar se o Caddy esta passando os headers CORS
3. Garantir que `VITE_AUTH_SERVICE_URL` corresponde ao dominio de producao

### Problema: "Chat nao carrega apos login"

**Causa**: JWT nao esta sendo passado do 99_home para o 03_interview, ou problema de roteamento.

**Solucao**:
1. Verificar console do navegador para armazenamento do JWT
2. Verificar se a rota `/chat` esta sendo roteada para 03_interview (3002)
3. Verificar aba de rede para falhas de autenticacao

## Monitoramento

Monitorar saude dos servicos em producao:

```bash
# SSH na VM
gcloud compute ssh oute-mind --zone=us-central1-a

# Verificar todos os containers
cd ~/oute-mind
docker compose ps

# Verificar logs de servico especifico
docker compose logs -f 99_home
docker compose logs -f 03_interview
docker compose logs -f 01_auth-profile

# Testar disponibilidade dos endpoints (via docker exec, portas nao expostas no host)
docker exec oute-home curl -sf http://localhost:3003/health
docker exec oute-interview curl -sf http://localhost:3002/health
docker exec oute-auth curl -sf http://localhost:3001/health
```

## Observacoes

- Toda comunicacao interna entre servicos usa DNS do Docker (ex: `http://01_auth-profile:3001`)
- Servicos frontend usam variaveis de ambiente apontando para o dominio publico (`http://34.132.93.171`)
- Esta configuracao suporta tanto HTTP quanto HTTPS (quando TLS estiver configurado)
- O Caddy renova automaticamente certificados SSL se HTTPS estiver habilitado
