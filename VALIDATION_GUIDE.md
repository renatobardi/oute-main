# 🧪 Guia de Validação - Integração em Produção

## ✅ Validação das Mudanças

### 1️⃣ VERIFICAR ARQUIVOS MODIFICADOS

```bash
# Ver mudanças no git
git diff feat/production-integration...main

# Ver mudanças específicas de cada arquivo
git show feat/production-integration:packages/99_home/src/lib/auth.ts
git show feat/production-integration:packages/01_auth-profile/src/hooks.server.ts
git show feat/production-integration:packages/99_home/src/routes/login/+page.svelte
```

### 2️⃣ VALIDAR CÓDIGO TYPESCRIPT

```bash
# Verificar tipos em todos os packages
npm run check --workspaces

# Ou especifico:
cd packages/99_home && npm run check
cd packages/01_auth-profile && npm run check
cd packages/03_interview && npm run check
```

### 3️⃣ VALIDAR LINTING

```bash
# Lint em todos os packages
npm run lint --workspaces

# Fix automaticamente (se necessário)
npm run format --workspaces
```

### 4️⃣ TESTE LOCAL - SETUP

```bash
# Terminal 1: Instalar dependências
npm install

# Terminal 2: Iniciar 01_auth-profile (porta 3001)
cd packages/01_auth-profile
npm run dev

# Terminal 3: Iniciar 99_home (porta 3003)
cd packages/99_home
npm run dev

# Terminal 4: Iniciar 03_interview (porta 3002)
cd packages/03_interview
npm run dev
```

### 5️⃣ TESTE LOCAL - VALIDAR ENDPOINTS

```bash
# 1. Verificar se 01_auth-profile responde
curl http://localhost:3001/health

# Resposta esperada:
# {"status":"ok","service":"auth-profile","timestamp":"..."}

# 2. Testar login com curl
curl -X POST http://localhost:3001/api/auth?action=login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePass123!"}'

# Resposta esperada:
# {
#   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "user": {
#     "id": "...",
#     "email": "user@example.com",
#     "name": "...",
#     "roles": ["user"]
#   }
# }

# 3. Verificar CORS headers
curl -i -X OPTIONS http://localhost:3001/api/auth \
  -H "Origin: http://localhost:3003" \
  -H "Access-Control-Request-Method: POST"

# Resposta esperada deve incluir:
# Access-Control-Allow-Origin: http://localhost:3003
# Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
# Access-Control-Allow-Headers: Content-Type, Authorization
```

### 6️⃣ TESTE LOCAL - FLUXO DE LOGIN

**Via navegador (MELHOR FORMA):**

1. **Abrir 99_home**
   ```
   Acessar: http://localhost:3003/
   ```
   ✅ Deve carregar home com hero + search + CTA + stats

2. **Clicar no CTA "Entrar na Oute"**
   ```
   Esperado: Redireciona para /login (pois não está autenticado)
   ```

3. **Preencher login**
   ```
   Email: user@example.com
   Senha: SecurePass123!
   ```

4. **Clicar "Entrar"**
   ```
   Esperado:
   - Loading state mostra "Entrando..."
   - POST request vai para http://localhost:3001/api/auth?action=login
   - Recebe JWT
   - Armazena em localStorage (chave: oute:auth:token)
   - Redireciona para /chat
   ```

5. **Verificar localStorage (DevTools → Application → Storage → LocalStorage)**
   ```
   Deve ter:
   - oute:auth:token: eyJhbGciOiJIUzI1NiIs...
   - oute:user: {"id":"...","email":"user@example.com",...}
   ```

6. **Na home, com autenticação**
   ```
   Voltar para http://localhost:3003/
   CTA agora deve dizer "Entrar no Chat"
   Clicando deve ir para /chat (não /login)
   ```

### 7️⃣ TESTE LOCAL - NETWORK TAB

1. **Abrir DevTools → Network tab**
2. **Fazer login**
3. **Procurar por requisição POST**
   ```
   URL: http://localhost:3001/api/auth?action=login
   Method: POST
   Headers:
     Content-Type: application/json
   Status: 200
   Response: {token, user}
   ```

4. **Verificar CORS headers na response**
   ```
   Access-Control-Allow-Origin: http://localhost:3003
   Access-Control-Allow-Credentials: true
   ```

### 8️⃣ TESTE LOCAL - CONSOLE ERRORS

**Verificar que NÃO há erros de CORS**

```
❌ EVITAR:
- "Access to XMLHttpRequest at ... from origin 'http://localhost:3003'
   has been blocked by CORS policy"
- Network error on login
- 401/403 Unauthorized

✅ ESPERADO:
- Login bem-sucedido
- Token em localStorage
- Redirecionamento para /chat
- Nenhum erro de CORS
```

### 9️⃣ TESTE - ARQUIVO .env.production

```bash
# Verificar se arquivos existem
ls -la packages/99_home/.env.production
ls -la packages/03_interview/.env.production
ls -la packages/01_auth-profile/.env.production

# Verificar conteúdo
cat packages/99_home/.env.production
cat packages/03_interview/.env.production
cat packages/01_auth-profile/.env.production

# Esperado:
# - VITE_AUTH_SERVICE_URL=http://34.132.93.171
# - DATABASE_URL=... (placeholder ou valor real)
# - JWT_SECRET=... (placeholder - será preenchido em deploy)
```

### 🔟 TESTE - AUTH.TS FUNCTIONS

```typescript
// No console do navegador (http://localhost:3003/login):

// 1. Testar getToken (quando NÃO autenticado)
localStorage.clear();
console.log(getToken()); // null

// 2. Após login bem-sucedido
console.log(getToken()); // "eyJhbGciOiJIUzI1NiIs..."

// 3. Testar getCurrentUser
console.log(getCurrentUser());
// {id: "...", email: "user@example.com", name: "...", ...}

// 4. Testar isTokenExpired
const token = getToken();
console.log(isTokenExpired(token)); // false (ainda válido)

// 5. Testar logout
logout();
console.log(getToken()); // null
console.log(getCurrentUser()); // null
```

---

## 📋 CHECKLIST DE VALIDAÇÃO

### ✅ Código & Estrutura
- [ ] `packages/99_home/src/lib/auth.ts` existe
- [ ] `packages/99_home/src/routes/login/+page.svelte` contém `import { login }`
- [ ] `packages/99_home/src/routes/+page.svelte` contém `handleCTA()` function
- [ ] `packages/01_auth-profile/src/hooks.server.ts` contém CORS middleware
- [ ] `.env.production` files existem em todos os 3 packages

### ✅ TypeScript & Lint
- [ ] Sem erros de TypeScript (`npm run check`)
- [ ] Sem erros de ESLint (`npm run lint`)
- [ ] Sem warnings de build

### ✅ Endpoints
- [ ] `GET http://localhost:3001/health` retorna 200
- [ ] `POST http://localhost:3001/api/auth?action=login` retorna JWT
- [ ] `GET http://localhost:3001/api/profile` retorna user (com JWT)
- [ ] CORS headers presentes nas responses

### ✅ Login Flow
- [ ] Página home carrega em `http://localhost:3003/`
- [ ] CTA "Entrar na Oute" redireciona para `/login` (não autenticado)
- [ ] Formulário de login aparece
- [ ] Email e senha podem ser preenchidos
- [ ] Botão "Entrar" envia POST request
- [ ] JWT recebido é armazenado em localStorage
- [ ] Redireciona para `/chat` após sucesso
- [ ] Mensagem de erro aparece em caso de falha

### ✅ Autenticação
- [ ] `oute:auth:token` em localStorage após login
- [ ] `oute:user` em localStorage após login
- [ ] CTA na home muda para "Entrar no Chat" quando autenticado
- [ ] `/chat` pode ser acessado com JWT válido
- [ ] Logout limpa localStorage

### ✅ Ambiente
- [ ] `VITE_AUTH_SERVICE_URL` está definido em `.env.production`
- [ ] Database URL está no placeholder `.env.production`
- [ ] JWT_SECRET está no placeholder `.env.production`

---

## 🔄 TESTE - CICLO COMPLETO

```
1. npm install
   ↓
2. Iniciar 3 terminais com os dev servers
   ↓
3. Acessar http://localhost:3003/ (home)
   ↓
4. Clicar CTA → vai para /login
   ↓
5. Preencher: user@example.com / SecurePass123!
   ↓
6. Clicar Entrar
   ↓
7. DevTools Network: verificar POST /api/auth
   ↓
8. DevTools Console: verificar JWT em localStorage
   ↓
9. Deve redirecionar para /chat
   ↓
10. Voltar para home
   ↓
11. CTA deve dizer "Entrar no Chat"
   ↓
12. ✅ VALIDAÇÃO COMPLETA!
```

---

## 🐛 TROUBLESHOOTING

### Erro: "Access to XMLHttpRequest blocked by CORS"

```bash
# Verificar se CORS middleware está em hooks.server.ts
grep -n "Access-Control-Allow-Origin" packages/01_auth-profile/src/hooks.server.ts

# Deve ter CORS headers configurados
# Se não tiver, re-aplicar a mudança de FASE 1
```

### Erro: "Invalid email or password"

```bash
# Verificar se user existe no banco
# Testar com credenciais conhecidas:
# Email: user@example.com
# Senha: SecurePass123!

# Se usar banco vazio, pode criar novo user via:
curl -X POST http://localhost:3001/api/auth?action=register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!","name":"Test"}'
```

### Erro: "Cannot find module '@oute/shared'"

```bash
# Reinstalar dependências
rm -rf node_modules
npm install

# Ou em workspace específico
cd packages/99_home
npm install
```

### Redirecionamento não funciona

```bash
# Verificar se goto() está sendo importado corretamente
grep -n "import.*goto" packages/99_home/src/routes/login/+page.svelte

# Deve ter: import { goto } from '$app/navigation';
```

---

## 📊 RESULTADO ESPERADO

```
✅ VALIDAÇÃO LOCAL COMPLETA
├── Código: sem erros
├── Tipos: 100% válido
├── Lint: sem warnings
├── Endpoints: respondendo
├── CORS: configurado
├── Login: funcionando
├── JWT: armazenado
├── Navegação: inteligente
└── Ready for Production!
```

---

**Data**: 10 de Março de 2026
**Status**: 🚀 Ready to Deploy
