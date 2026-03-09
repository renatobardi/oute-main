# E2E Testing with Playwright

## Overview

Este documento descreve a estratégia de testes E2E (End-to-End) implementada usando Playwright para garantir que os caminhos críticos do OUTE funcionem corretamente em um ambiente integrado.

## E2E Test Coverage

### 1. Auth-Profile Package (`packages/01_auth-profile/`)

#### Authentication Flow

- ✅ Login com credenciais válidas
- ✅ Login com email inválido (rejected)
- ✅ Login com senha incorreta (rejected)
- ✅ Login com campos faltando (rejected)
- ✅ Registro com dados válidos
- ✅ Registro com senha fraca (rejected)
- ✅ Registro com email inválido (rejected)
- ✅ Registro com campos faltando (rejected)
- ✅ Validação de formato JWT token
- ✅ **9 testes de autenticação**

#### Profile Endpoint

- ✅ GET /api/profile com token válido
- ✅ GET /api/profile sem header de autenticação (rejected)
- ✅ GET /api/profile com token inválido (rejected)
- ✅ GET /api/profile com Authorization header malformado (rejected)
- ✅ Profile retorna todos os detalhes do usuário
- ✅ Múltiplos requests sequenciais com mesmo token
- ✅ GET /api/profile com token expirado (rejected)
- ✅ GET /api/profile requer "Bearer" case-sensitive
- ✅ **8 testes de profile endpoint**

#### Integration Flow

- ✅ Fluxo completo: Register → Profile
- ✅ Fluxo completo: Login → Profile
- ✅ Failed login previne profile access
- ✅ Concurrent authentication requests
- ✅ **4 testes de integração**

**Total: 21 testes E2E para auth-profile**

---

### 2. Dashboard Package (`packages/00_dashboard/`)

#### Navigation

- ✅ Carregar home page do dashboard
- ✅ Navegar para login page
- ✅ Navegar de login para home
- ✅ Layout responsivo (desktop + mobile)
- ✅ HTML semântico correto
- ✅ **5 testes de navegação**

#### Login Flow

- ✅ Submit login form com credenciais válidas
- ✅ Mostrar erro para email inválido
- ✅ Campo email é required
- ✅ Campo password é required
- ✅ Campo password é masked (type="password")
- ✅ Submit button está visível e enabled
- ✅ **6 testes de login flow**

#### Accessibility

- ✅ Todos os form inputs têm labels
- ✅ Navegação com keyboard (Tab)
- ✅ Links são focusable
- ✅ **3 testes de acessibilidade**

**Total: 14 testes E2E para dashboard**

---

### 3. Projects Package (`packages/02_projects/`)

#### CRUD Operations

- ✅ Criar novo projeto (POST /api/projects)
- ✅ Recuperar projeto por ID (GET /api/projects/:id)
- ✅ Listar todos os projetos (GET /api/projects)
- ✅ Atualizar detalhes do projeto (PUT /api/projects/:id)
- ✅ Deletar projeto (DELETE /api/projects/:id)
- ✅ **5 testes de CRUD**

#### Authorization

- ✅ Rejeitar criação sem autenticação
- ✅ Rejeitar listagem sem autenticação
- ✅ Rejeitar acesso com token inválido
- ✅ **3 testes de autorização**

#### Validation

- ✅ Rejeitar criação sem campo name
- ✅ Rejeitar acesso a projeto inexistente
- ✅ Validar comprimento do nome do projeto
- ✅ **3 testes de validação**

**Total: 11 testes E2E para projects**

---

## Playwright Configuration

Cada pacote tem seu próprio `playwright.config.ts`:

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

## Running E2E Tests

### Local Development

```bash
# Run E2E tests for auth-profile
cd packages/01_auth-profile
npm run test:e2e

# Run E2E tests with UI
npx playwright test --ui

# Run tests in debug mode
npx playwright test --debug

# Run specific test file
npx playwright test auth.spec.ts

# Run specific test
npx playwright test -g "should login successfully"
```

### CI/CD Pipeline

E2E tests rodam automáticamente em PRs (workflow: `4-e2e-tests.yml`)

**Trigger conditions:**

- ✅ Todos os pacotes (se houver mudanças)
- ✅ Após unit tests passarem
- ✅ Gera HTML report como artifact

---

## Test Structure

### API Testing Pattern

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

### UI Testing Pattern

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

## Common Issues & Fixes

### E2E tests failing with "baseURL not responding"

```bash
# Ensure dev server is running
npm run dev

# Or configure webServer in playwright.config.ts
webServer: {
  command: 'npm run dev',
  url: 'http://localhost:5173',
  reuseExistingServer: !process.env.CI
}
```

### Tests failing due to async timing

```typescript
// Use waitFor instead of fixed delays
await page.waitForNavigation({ waitUntil: 'networkidle' });
await page.waitForSelector('button.success');

// Or retry logic
await expect(page.locator('.success')).toBeVisible({ timeout: 5000 });
```

### Database state issues in E2E

```typescript
test.beforeEach(async ({ page }) => {
  // Setup test data
  await setupTestUser();
});

test.afterEach(async ({ page }) => {
  // Cleanup
  await cleanupTestData();
});
```

---

## Reports & Artifacts

### HTML Report

Cada run de E2E tests gera um `html` report:

```bash
# Open locally
npx playwright show-report

# Reports are stored in
packages/{package}/playwright-report/
```

### CI Artifacts

GitHub Actions armazena reports como artifacts:

- `playwright-report-auth-profile`
- `playwright-report-dashboard`
- `playwright-report-projects`

---

## Best Practices

### ✅ DO:

- Teste caminhos críticos do usuário (login, CRUD, integration)
- Use `test.skip()` para testes que dependem de estado
- Use `test.beforeEach()` para setup comum
- Teste tanto sucesso quanto falha
- Valide status codes HTTP nas API tests

### ❌ DON'T:

- Não teste detalhes de UI que mudam frequentemente
- Não use `test.only()` em PRs
- Não deixe testes flaky (intermitentes)
- Não hardcode timeouts (use smart waits)
- Não testes que dependem de estado global do BD

---

## Adding New E2E Tests

1. **Criar arquivo** `src/__tests__/e2e/feature.spec.ts`
2. **Estruturar com describe blocks** por feature
3. **Usar padrões existentes** como template
4. **Rodar localmente** antes de commitar
5. **Adicionar a documentação** quando novo padrão emerge

---

## References

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Test API](https://playwright.dev/docs/api/class-test)
- [Best Practices for E2E Testing](https://playwright.dev/docs/best-practices)
- [Debugging Tests](https://playwright.dev/docs/debug)
