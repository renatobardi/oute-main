# Testes E2E - Servico Auth Profile

## Visao Geral

Testes end-to-end para o servico de autenticacao e gerenciamento de perfil usando **Playwright**.

### Arquivos de Teste

- **`auth.spec.ts`** - Fluxos de autenticacao (login, registro, validacao de token)
  - 8 casos de teste
  - Cobertura: Sucesso/falhas de login, registro, validacao JWT

- **`profile.spec.ts`** - Endpoint de perfil (rotas protegidas) + fluxos de integracao completa
  - 13 casos de teste
  - Cobertura: Rotas protegidas, headers de autenticacao, fluxos completos

**Total: 21 testes E2E**

## Setup

### Pre-requisitos

1. Node.js v20+
2. npm workspaces instalado
3. PostgreSQL rodando (ou mock adapter configurado)
4. Servidor de dev SvelteKit rodando em `http://localhost:5173`

### Instalacao

```bash
cd packages/01_auth-profile

# Instalar Playwright (se nao estiver instalado)
npm install -D @playwright/test

# Instalar outras dependencias de teste E2E
npm install -D playwright
```

### Configuracao

A configuracao do Playwright esta em `playwright.config.ts`:

```typescript
// Configuracoes principais:
// - baseURL: http://localhost:5173
// - webServer: inicia automaticamente servidor de dev SvelteKit
// - browser: chromium
// - reporter: html
```

## Executando Testes

### Iniciar o Servidor de Dev (se nao estiver rodando)

```bash
npm run dev
```

O servidor de dev iniciara em `http://localhost:5173` e recarregara automaticamente ao detectar mudancas.

### Executar Todos os Testes E2E

```bash
npm run test:e2e
```

### Executar Arquivo de Teste Especifico

```bash
npx playwright test auth.spec.ts
npx playwright test profile.spec.ts
```

### Executar Caso de Teste Especifico

```bash
npx playwright test -g "should login successfully with valid credentials"
npx playwright test -g "Profile Endpoint"
```

### Executar em Modo Watch (Desenvolvimento)

```bash
npx playwright test --watch
```

### Executar em Modo UI (Interativo)

```bash
npx playwright test --ui
```

Isso abre um debugger interativo onde voce pode:

- Percorrer testes passo a passo
- Inspecionar requisicoes de rede
- Visualizar snapshots
- Pausar/retomar execucao

### Executar em Modo Debug

```bash
npx playwright test --debug
```

Isso abre o Inspector com capacidades completas de debugging.

### Executar com Saida Detalhada

```bash
npx playwright test --reporter=verbose
```

## Visualizando Relatorios de Teste

Apos executar os testes, visualize o relatorio HTML:

```bash
npx playwright show-report
```

Isso abre um relatorio interativo mostrando:

- Resultados dos testes (passou/falhou)
- Comparacoes de screenshot
- Gravacoes de video (se habilitado)
- Timeline de execucao

## Estrutura dos Testes

### Testes de Autenticacao (`auth.spec.ts`)

#### Testes de Login

1. ✅ Login com credenciais validas → 200 + token
2. ❌ Login com formato de email invalido → 400
3. ❌ Login com senha incorreta → 401
4. ❌ Login com email ausente → 400

#### Testes de Registro

5. ✅ Registro com dados validos → 201 + token
6. ❌ Registro com senha fraca → 400
7. ❌ Registro com email invalido → 400
8. ❌ Registro com campos ausentes → 400

#### Validacao de Token

9. ✅ Token JWT possui estrutura valida de 3 partes (header.payload.signature)

### Testes de Perfil (`profile.spec.ts`)

#### Testes de Rotas Protegidas

1. ✅ Obter perfil com JWT valido → 200 + dados do usuario
2. ❌ Obter perfil sem header de autenticacao → 401
3. ❌ Obter perfil com token invalido → 401
4. ❌ Obter perfil com header malformado → 401
5. ✅ Perfil inclui todos os detalhes do usuario (id, email, nome, roles, timestamps)
6. ✅ Multiplas requisicoes sequenciais com mesmo token
7. ❌ Acesso ao perfil com token expirado → 401
8. ❌ Verificacao de case-sensitive do prefixo Bearer

#### Fluxos de Integracao Completa

9. ✅ Registro → Login → Acesso ao perfil (fluxo completo)
10. ❌ Login falho impede acesso ao perfil
11. ✅ Requisicoes concorrentes de autenticacao tratadas

## Cenarios de Teste Principais

### Cenarios de Sucesso ✅

```typescript
// Login e obter perfil
POST /api/auth?action=login { email, password }
  → 200 + { token, user }

GET /api/profile (Authorization: Bearer <token>)
  → 200 + { id, email, name, roles, createdAt, lastLogin }

// Registro e obter perfil
POST /api/auth?action=register { email, password, name }
  → 201 + { token, user }

GET /api/profile (Authorization: Bearer <token>)
  → 200 + dados do usuario
```

### Cenarios de Erro ❌

```typescript
// Sem header de autenticacao
GET /api/profile
  → 401 + { error }

// Token invalido
GET /api/profile (Authorization: Bearer invalid)
  → 401 + { error }

// Header malformado
GET /api/profile (Authorization: InvalidFormat token)
  → 401 + { error }

// Case sensitivity
GET /api/profile (Authorization: bearer <token>)  // minusculo
  → 401 + { error }

// Token expirado
GET /api/profile (Authorization: Bearer <expired-token>)
  → 401 + { error }
```

## Boas Praticas de Teste

### 1. Usar Dados de Teste Unicos

Testes usam `Date.now()` para emails unicos:

```typescript
const testEmail = `flow-test-${Date.now()}@example.com`;
```

Isso previne conflitos ao executar testes multiplas vezes.

### 2. Isolamento de Testes

Cada teste eh independente:

- Sem estado compartilhado
- Registro/login dentro de cada teste
- Sem dependencias entre testes

### 3. Cenarios de Erro Abrangentes

Testes cobrem:

- Happy path (sucesso)
- Campos obrigatorios ausentes
- Formatos invalidos
- Falhas de autenticacao
- Verificacoes de seguranca (case sensitivity, formato de token)

### 4. Teste de Integracao Completa

`profile.spec.ts` inclui workflows completos:

- Registro → Login → Perfil (valida fluxo inteiro)
- Requisicoes concorrentes (valida estabilidade do sistema)

## Problemas Comuns e Solucoes

### Problema: `Target page, context or browser has been closed`

**Causa**: Servidor de dev nao esta rodando ou baseURL incorreta

**Solucao**:

```bash
npm run dev  # Iniciar servidor de dev primeiro
npm run test:e2e  # Depois executar testes
```

### Problema: `Timeout waiting for predicate`

**Causa**: Requisicoes demorando muito ou servidor sem resposta

**Solucao**: Aumentar timeout em `playwright.config.ts`:

```typescript
expect.setDefaultTimeout(5000); // 5 segundos
```

### Problema: `Navigation to "http://localhost:5173/" failed`

**Causa**: Servidor de dev inacessivel

**Solucao**:

```bash
# Verificar se o servidor de dev esta rodando
curl http://localhost:5173
```

### Problema: Testes passam localmente mas falham no CI

**Causa**: Ambiente diferente, dados de teste diferentes

**Solucao**:

- Usar variaveis de ambiente para endpoints da API
- Nao hardcodar URLs localhost
- Usar seeding de dados de teste no CI

## Integracao CI/CD

### Exemplo GitHub Actions

```yaml
name: Testes E2E

on: [pull_request, push]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'

      - run: npm ci
      - run: npm run dev & # Iniciar servidor de dev
      - run: npm run test:e2e

      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Consideracoes de Performance

### Tempo de Execucao dos Testes

- **auth.spec.ts**: ~5-10 segundos (8 testes)
- **profile.spec.ts**: ~10-15 segundos (13 testes)
- **Total**: ~20-30 segundos

### Execucao Paralela

Playwright executa testes em paralelo por padrao:

```bash
npx playwright test --workers=4  # 4 workers paralelos
```

Para executar sequencialmente (para debugging):

```bash
npx playwright test --workers=1
```

## Proximos Passos

### Cobertura de Teste Adicional

Considere adicionar:

- [ ] Testes de refresh de token
- [ ] Testes de funcionalidade de logout
- [ ] Testes de controle de acesso baseado em roles
- [ ] Testes de rate limiting
- [ ] Testes de validacao CORS
- [ ] Testes de prevencao de SQL injection
- [ ] Testes de prevencao de XSS

### Testes de Performance

```bash
npx playwright test --reporter=json > results.json
# Analisar tempos de resposta, throughput
```

### Testes de Regressao Visual

Adicionar comparacoes de screenshot:

```typescript
await expect(page).toHaveScreenshot();
```

## Recursos

- [Documentacao Playwright](https://playwright.dev)
- [Playwright Test](https://playwright.dev/docs/intro)
- [Relatorios de Teste](https://playwright.dev/docs/test-reporters)
- [Guia de Debugging](https://playwright.dev/docs/debug)

## Solucao de Problemas

Para mais ajuda, verifique:

- `playwright.config.ts` - Configuracao do Playwright
- `.env.example` - Variaveis de ambiente
- Logs do GitHub Actions - Problemas de CI/CD
- `npm run test:e2e -- --help` - Opcoes de CLI
