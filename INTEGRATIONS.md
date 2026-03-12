# Fluxos de Integração - OUTE

Guia detalhado dos fluxos de integração entre os domínios da aplicação.

## Arquitetura de Integração

```
┌─────────────────────────────────────────────────────────────┐
│                     00_Dashboard (Port 3000)                 │
│  Frontend web que consome APIs dos outros serviços          │
└──────────────┬──────────────────────────────────────────────┘
               │
       ┌───────┴───────┐
       │               │
       ▼               ▼
┌──────────────────┐ ┌──────────────────┐
│  01_Auth-Profile │ │   02_Projects    │
│  (Port 3001)     │ │  (Port 3004)     │
│                  │ │                  │
│ - Login          │ │ - CRUD projects  │
│ - JWT issue      │ │ - Validate JWT   │
│ - User profile   │ │ - Associate user │
└──────────────────┘ └──────────────────┘
       │
       ▼
   ┌─────────────┐
   │ PostgreSQL  │
   │ Centralizado│
   └─────────────┘
```

---

## 1. Fluxo de Autenticação (01_auth-profile)

### 1.1 Processo de Login

**Fluxo do usuário**:

1. Usuário preenche formulário de login no 00_dashboard
2. Formulário envia para 01_auth-profile `/auth/login`
3. Serviço de auth valida credenciais
4. Emite token JWT
5. Dashboard armazena JWT localmente
6. Usuário pode acessar outros serviços

**Endpoint**: `POST /auth/login`

**Request**:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Resposta**:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-123",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Exemplo de código** (00_dashboard):

```typescript
async function login(email: string, password: string) {
  const response = await fetch('http://localhost:3001/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (response.ok) {
    const data = await response.json();
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  }

  throw new Error('Login failed');
}
```

### 1.2 Armazenamento e Uso do Token JWT

**Onde é armazenado**:

- Browser localStorage: chave `token`
- Expira em 24 horas (configurável)

**Uso em outras requisições**:

```typescript
const token = localStorage.getItem('token');

fetch('http://localhost:3004/projects', {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

### 1.3 Validação JWT

**Estrutura do token**:

```
Header.Payload.Signature
```

**Payload** (decodificado):

```json
{
  "sub": "user-uuid", // user ID
  "email": "user@example.com",
  "iat": 1694000000, // issued at
  "exp": 1694086400 // expires in 24h
}
```

**Validação** (em 02_projects):

```typescript
import jwt from 'jsonwebtoken';

export async function validateJWT(token: string): Promise<string | null> {
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return payload.sub; // user ID
  } catch {
    return null; // Invalid token
  }
}
```

### 1.4 Fluxo de Logout

**Endpoint**: `POST /auth/logout`

**Request**:

```bash
curl -X POST http://localhost:3001/auth/logout \
  -H "Authorization: Bearer <token>"
```

**Resposta**:

```json
{
  "message": "Logged out successfully"
}
```

**Lado do cliente** (00_dashboard):

```typescript
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  // Redirect to login
  window.location.href = '/login';
}
```

---

## 2. Fluxo de Projetos (02_projects)

### 2.1 Buscar Lista de Projetos

**Usuário logado com token JWT**

**Endpoint**: `GET /projects`

**Headers da requisição**:

```
Authorization: Bearer eyJhbGc...
```

**Fluxo**:

1. 00_dashboard envia GET request para 02_projects com JWT
2. 02_projects recebe a requisição
3. Extrai JWT do header Authorization
4. Valida JWT (verifica assinatura, expiração)
5. Extrai user ID do payload JWT
6. Consulta banco: `SELECT * FROM projects WHERE user_id = ?`
7. Retorna lista de projetos

**Exemplo de código** (02_projects):

```typescript
// routes/projects/+server.ts

export async function GET({ request }) {
  // Extract JWT
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return new Response(JSON.stringify({ error: 'No token' }), { status: 401 });
  }

  // Validate JWT
  const userId = await validateJWT(token);
  if (!userId) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401 });
  }

  // Get user's projects
  const projects = await db.query('SELECT * FROM projects WHERE user_id = $1', [userId]);

  return new Response(JSON.stringify(projects), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
```

### 2.2 Criar Projeto

**Endpoint**: `POST /projects`

**Request**:

```json
{
  "name": "My Project",
  "description": "Project description",
  "status": "active"
}
```

**Headers**:

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Exemplo de código** (02_projects):

```typescript
export async function POST({ request }) {
  // Validate JWT
  const userId = await validateTokenFromRequest(request);
  if (!userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const body = await request.json();

  // Insert project
  const result = await db.query(
    `INSERT INTO projects (user_id, name, description, status, created_at)
     VALUES ($1, $2, $3, $4, NOW())
     RETURNING *`,
    [userId, body.name, body.description, body.status || 'active']
  );

  return new Response(JSON.stringify(result.rows[0]), { status: 201 });
}
```

### 2.3 Atualizar Projeto

**Endpoint**: `PATCH /projects/:id`

**Request**:

```json
{
  "name": "Updated name",
  "status": "archived"
}
```

### 2.4 Deletar Projeto

**Endpoint**: `DELETE /projects/:id`

**Importante**: Só deleta se o usuário for dono do projeto

---

## 3. Fluxo de Perfil do Usuário (01_auth-profile)

### 3.1 Obter Perfil do Usuário

**Endpoint**: `GET /profile`

**Request**:

```bash
curl http://localhost:3001/profile \
  -H "Authorization: Bearer <token>"
```

**Resposta**:

```json
{
  "id": "uuid-123",
  "email": "user@example.com",
  "name": "John Doe",
  "createdAt": "2024-03-07T10:00:00Z"
}
```

### 3.2 Atualizar Perfil do Usuário

**Endpoint**: `PATCH /profile`

**Request**:

```json
{
  "name": "New Name"
}
```

---

## 4. Integração do Dashboard

### 4.1 Fluxo da Página de Login

```
┌──────────────────┐
│ Login Page       │
│ (00_dashboard)   │
└────────┬─────────┘
         │
         │ User submits form
         ▼
    ┌─────────────────────────────────┐
    │ POST /auth/login                 │
    │ (01_auth-profile)               │
    │ { email, password }              │
    └────────┬────────────────────────┘
             │
             │ Validate credentials
             │ Generate JWT
             ▼
    ┌──────────────────────────────┐
    │ Response: { token, user }     │
    └────────┬─────────────────────┘
             │
             │ Store in localStorage
             ▼
    ┌──────────────────────────┐
    │ Dashboard Home           │
    │ Now authenticated        │
    └──────────────────────────┘
```

### 4.2 Fluxo da Home do Dashboard

```
┌────────────────────────────────┐
│ Dashboard Home                  │
│ Load on mount:                  │
│ 1. Check for token              │
│ 2. Fetch user projects          │
└────────┬───────────────────────┘
         │
         ├──► localStorage.getItem('token')
         │
         │ (if no token)
         ├──► Redirect to /login
         │
         │ (if token exists)
         ├──► GET /projects (02_projects)
         │    with JWT in headers
         │
         ▼
    ┌──────────────────────────┐
    │ Display Projects         │
    │ List all user projects   │
    └──────────────────────────┘
```

### 4.3 Fluxo de Criar Projeto

```
Create Project Form
        │
        ├──► Validate input locally
        │
        ├──► POST /projects (02_projects)
        │    Headers: { Authorization: Bearer <token> }
        │    Body: { name, description, status }
        │
        ├──► 02_projects validates JWT
        │
        ├──► Insert to database
        │
        ├──► Response: { id, name, ... }
        │
        ▼
   Refresh projects list
   Show success toast
```

---

## 5. Tratamento de Erros

### 5.1 Token Expirado

**Fluxo**:

```
Request to 02_projects
    ↓
JWT validation fails
    ↓
Return 401 Unauthorized
    ↓
00_dashboard receives 401
    ↓
Clear localStorage
    ↓
Redirect to /login
```

**Código** (00_dashboard):

```typescript
async function fetchProjects() {
  const token = localStorage.getItem('token');

  const response = await fetch('http://localhost:3004/projects', {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (response.status === 401) {
    // Token expired or invalid
    localStorage.removeItem('token');
    window.location.href = '/login';
    return;
  }

  const projects = await response.json();
  return projects;
}
```

### 5.2 Erros de Rede

**Fallback**:

```typescript
try {
  const response = await fetch(url);
  const data = await response.json();
  return data;
} catch (error) {
  console.error('Network error:', error);
  throw new Error('Failed to fetch projects');
}
```

---

## 6. Testes em Desenvolvimento

### Testes Locais com cURL

**Login**:

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Buscar Projetos** (substitua TOKEN):

```bash
curl http://localhost:3004/projects \
  -H "Authorization: Bearer TOKEN"
```

**Criar Projeto**:

```bash
curl -X POST http://localhost:3004/projects \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"My Project","description":"Test"}'
```

---

## 7. Considerações de Deploy

### URLs em Produção

Desenvolvimento:

```
Dashboard:      http://localhost:3000
Auth-Profile:   http://localhost:3001
Projects:       http://localhost:3004
```

Produção (VM com Caddy reverse proxy):

```
Dashboard:      http://<VM_IP>/dashboard
Auth-Profile:   http://<VM_IP>/api/auth
Projects:       http://<VM_IP>/api/projects
```

> **Nota**: O deploy principal é feito em VM (GCP Compute Engine) com Caddy como reverse proxy. Todos os serviços usam `expose` (rede Docker interna) e são acessados exclusivamente via Caddy na porta 80.

### Configuração CORS

Se os serviços rodam em domínios diferentes, configure CORS:

**02_projects (+server.ts)**:

```typescript
const headers = {
  'Access-Control-Allow-Origin': process.env.DASHBOARD_URL,
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};
```

---

## Resumo

| Fluxo          | De        | Para         | Auth     | Dados         |
| -------------- | --------- | ------------ | -------- | ------------- |
| Login          | Dashboard | Auth-Profile | Senha    | JWT + Usuário |
| Buscar Projetos| Dashboard | Projects     | JWT      | Lista projetos|
| Criar Projeto  | Dashboard | Projects     | JWT      | Dados projeto |
| Obter Perfil   | Dashboard | Auth-Profile | JWT      | Perfil usuário|

Toda comunicação entre serviços é **baseada em HTTP**, **autenticada por JWT** e **stateless**.
