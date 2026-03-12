# Testes E2E com Playwright

## Visao Geral

Este documento descreve a estrategia de testes E2E (End-to-End) implementada usando Playwright para garantir que os caminhos criticos do OUTE funcionem corretamente em um ambiente integrado.

## Cobertura de Testes E2E

### 1. Auth-Profile Package (`packages/01_auth-profile/`)

#### Fluxo de Autenticacao

- ✅ Login com credenciais válidas
- ✅ Login com email inválido (rejected)
- ✅ Login com senha incorreta (rejected)
- ✅ Login com campos faltando (rejected)
- ✅ Registro com dados válidos
- ✅ Registro com senha fraca (rejected)
- ✅ Registro com email inválido (rejected)
- ✅ Registro com campos faltando (rejected)
- ✅ Validacao de formato JWT token
- ✅ **9 testes de autenticacao**

#### Endpoint de Profile

- ✅ GET /api/profile com token válido
- ✅ GET /api/profile sem header de autenticação (rejected)
- ✅ GET /api/profile com token inválido (rejected)
- ✅ GET /api/profile com Authorization header malformado (rejected)
- ✅ Profile retorna todos os detalhes do usuário
- ✅ Multiplos requests sequenciais com mesmo token
- ✅ GET /api/profile com token expirado (rejected)
- ✅ GET /api/profile requer "Bearer" case-sensitive
- ✅ **8 testes de profile endpoint**

#### Fluxo de Integracao

- ✅ Fluxo completo: Register → Profile
- ✅ Fluxo completo: Login → Profile
- ✅ Failed login previne profile access
- ✅ Concurrent authentication requests
- ✅ **4 testes de integracao**

**Total: 21 testes E2E para auth-profile**

---

### 2. Dashboard Package (`packages/00_dashboard/`)

#### Navegacao

- ✅ Carregar home page do dashboard
- ✅ Navegar para login page
- ✅ Navegar de login para home
- ✅ Layout responsivo (desktop + mobile)
- ✅ HTML semantico correto
- ✅ **5 testes de navegacao**

#### Fluxo de Login

- ✅ Submit login form com credenciais válidas
- ✅ Mostrar erro para email inválido
- ✅ Campo email é required
- ✅ Campo password é required
- ✅ Campo password é masked (type="password")
- ✅ Submit button está visível e enabled
- ✅ **6 testes de login flow**

#### Acessibilidade

- ✅ Todos os form inputs têm labels
- ✅ Navegação com keyboard (Tab)
- ✅ Links são focusable
- ✅ **3 testes de acessibilidade**

**Total: 14 testes E2E para dashboard**

---

### 3. Projects Package (`packages/02_projects/`)

#### Operacoes CRUD

- ✅ Criar novo projeto (POST /api/projects)
- ✅ Recuperar projeto por ID (GET /api/projects/:id)
- ✅ Listar todos os projetos (GET /api/projects)
- ✅ Atualizar detalhes do projeto (PUT /api/projects/:id)
- ✅ Deletar projeto (DELETE /api/projects/:id)
- ✅ **5 testes de CRUD**

#### Autorizacao

- ✅ Rejeitar criação sem autenticação
- ✅ Rejeitar listagem sem autenticação
- ✅ Rejeitar acesso com token inválido
- ✅ **3 testes de autorização**

#### Validacao

- ✅ Rejeitar criação sem campo name
- ✅ Rejeitar acesso a projeto inexistente
- ✅ Validar comprimento do nome do projeto
- ✅ **3 testes de validação**

**Total: 11 testes E2E para projects**

---

## Configuracao do Playwright

Cada pacote tem seu proprio `playwright.config.ts`:

```typescript
// Key settings:
- testDir: './src/__tests__/e2e'
- testMatch: '**/*.spec.ts'
- fullyParallel: true
- retries: 2 (CI), 0 (local)
- workers: 1 (CI), undefined (local)
- reporter: 'html'
- baseURL: 'http://localhost:5173' (or 5174 para projects)
- trace: 'on-first-retry'
```

## Executando Testes E2E

### Desenvolvimento Local

```bash
# Executar testes E2E para auth-profile
cd packages/01_auth-profile
npm run test:e2e

# Executar testes E2E com UI
npx playwright test --ui

# Executar testes em modo debug
npx playwright test --debug

# Executar arquivo de teste especifico
npx playwright test auth.spec.ts

# Executar teste especifico
npx playwright test -g "should login successfully"
```

### Pipeline CI/CD

Testes E2E rodam automaticamente em PRs para main (workflow: `4-e2e-tests.yml`)

**Condicoes de disparo:**

- ✅ PRs para branch `main` com mudancas em `packages/**`
- ✅ Matrix com 3 pacotes em paralelo (01_auth-profile, 00_dashboard, 02_projects)
- ✅ Gera HTML report como artifact
- ✅ Comenta no PR com sumario dos resultados

---

## Estrutura dos Testes

### Padrao para Testes de API

```typescript
test('should perform action', async ({ page }) => {
  // Setup auth if needed
  const authToken = getTokenFromLogin();

  // Make API request
  const response = await page.request.post('/api/endpoint', {
    headers: { Authorization: `Bearer ${authToken}` },
    data: {
      /* payload */
    },
  });

  // Assert response
  expect(response.status()).toBe(200);
  const data = await response.json();
  expect(data).toHaveProperty('expectedField');
});
```

### Padrao para Testes de UI

```typescript
test('should interact with UI', async ({ page }) => {
  // Navigate to page
  await page.goto('/path');

  // Interact with elements
  await page.fill('input[type="email"]', 'test@example.com');
  await page.click('button[type="submit"]');

  // Assert results
  await expect(page.locator('main')).toBeVisible();
  await expect(page).toHaveURL('/expected-url');
});
```

---

## Problemas Comuns e Solucoes

### Testes E2E falhando com "baseURL not responding"

```bash
# Verifique se o servidor dev esta rodando
npm run dev

# Ou configure webServer no playwright.config.ts
webServer: {
  command: 'npm run dev',
  url: 'http://localhost:5173',
  reuseExistingServer: !process.env.CI
}
```

### Testes falhando por problemas de timing assincrono

```typescript
// Use waitFor ao inves de delays fixos
await page.waitForNavigation({ waitUntil: 'networkidle' });
await page.waitForSelector('button.success');

// Ou logica de retry
await expect(page.locator('.success')).toBeVisible({ timeout: 5000 });
```

### Problemas de estado do banco de dados em E2E

```typescript
test.beforeEach(async ({ page }) => {
  // Preparar dados de teste
  await setupTestUser();
});

test.afterEach(async ({ page }) => {
  // Limpeza
  await cleanupTestData();
});
```

---

## Relatorios e Artefatos

### Relatorio HTML

Cada execucao de testes E2E gera um relatorio `html`:

```bash
# Abrir localmente
npx playwright show-report

# Relatorios ficam em
packages/{package}/playwright-report/
```

### Artefatos do CI

GitHub Actions armazena relatorios como artefatos (retencao de 7 dias):

- `playwright-report-auth-profile`
- `playwright-report-dashboard`
- `playwright-report-projects`

---

## Boas Praticas

### ✅ FACA:

- Teste caminhos criticos do usuario (login, CRUD, integracao)
- Use `test.skip()` para testes que dependem de estado
- Use `test.beforeEach()` para setup comum
- Teste tanto sucesso quanto falha
- Valide status codes HTTP nos testes de API

### ❌ NAO FACA:

- Nao teste detalhes de UI que mudam frequentemente
- Nao use `test.only()` em PRs
- Nao deixe testes flaky (intermitentes)
- Nao hardcode timeouts (use smart waits)
- Nao crie testes que dependem de estado global do BD

---

## Adicionando Novos Testes E2E

1. **Criar arquivo** `src/__tests__/e2e/feature.spec.ts`
2. **Estruturar com describe blocks** por feature
3. **Usar padroes existentes** como template
4. **Rodar localmente** antes de commitar
5. **Adicionar a documentacao** quando novo padrao surgir

---

## Referencias

- [Documentacao Playwright](https://playwright.dev/)
- [API de Testes Playwright](https://playwright.dev/docs/api/class-test)
- [Boas Praticas para Testes E2E](https://playwright.dev/docs/best-practices)
- [Depuracao de Testes](https://playwright.dev/docs/debug)
