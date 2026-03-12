# Quality Gates e Configuracao ESLint

## Visao Geral

Este documento descreve a configuração de quality gates implementada para garantir alta qualidade de código, segurança e confiabilidade em todo o monorepo.

## Configuracao TypeScript (tsconfig.json)

### Estrutura de Configuracao

O monorepo está organizado com uma configuração raiz e configurações específicas para cada pacote:

```
tsconfig.json (raiz)
├── packages/00_dashboard/tsconfig.json
├── packages/01_auth-profile/tsconfig.json
├── packages/02_projects/tsconfig.json
├── packages/design-system/tsconfig.json
└── shared/tsconfig.json
```

### Configuracao por Pacote

Cada pacote estende a configuração raiz e adiciona suas próprias paths e includes:

- **Pacotes SvelteKit** (00_dashboard, 01_auth-profile, 02_projects):
  - `outDir`: `.svelte-kit/output`
  - `include`: src files + config files (vite.config.ts, vitest.config.ts, svelte.config.js, playwright.config.ts)

- **Design System**:
  - Biblioteca de componentes Svelte
  - `include`: src files + config files

- **Shared**:
  - Código compartilhado entre pacotes
  - `include`: todos os arquivos TypeScript

## Configuracao ESLint

### Configuracao Raiz (.eslintrc.json)

A configuração ESLint utiliza um padrão de glob para encontrar todos os tsconfig.json:

```json
"parserOptions": {
  "project": [
    "./tsconfig.json",
    "./packages/*/tsconfig.json",
    "./shared/tsconfig.json"
  ]
}
```

### Regras de Lint

As regras foram ajustadas para serem pragmaticas, permitindo warnings mas bloqueando apenas erros criticos:

| Regra                                           | Severidade | Objetivo                               |
| ----------------------------------------------- | ---------- | -------------------------------------- |
| `no-console`                                    | warn       | Evitar logs de debug em producao       |
| `prefer-const`                                  | warn       | Preferir const quando possivel         |
| `no-var`                                        | warn       | Evitar uso de var                      |
| `require-await`                                 | warn       | Detectar funcoes async sem await       |
| `@typescript-eslint/no-unused-vars`             | warn       | Detectar variaveis nao utilizadas      |
| `@typescript-eslint/no-explicit-any`            | warn       | Encorajar type safety                  |
| `@typescript-eslint/explicit-module-boundary-types` | warn   | Tipos explicitos em funcoes exportadas |
| `@typescript-eslint/no-floating-promises`       | warn       | Prevenir promises nao tratadas         |
| `@typescript-eslint/no-misused-promises`        | warn       | Prevenir uso incorreto de promises     |
| `@typescript-eslint/await-thenable`             | warn       | Prevenir await em nao-thenables        |
| `@typescript-eslint/no-unnecessary-type-assertion` | warn    | Evitar type assertions desnecessarias  |
| `@typescript-eslint/strict-boolean-expressions` | warn       | Comparacoes explicitas em condicionais |
| `svelte/no-at-html-tags`                        | off        | Permitir @html em componentes Svelte   |

### Overrides Especiais

#### 1. Arquivos Svelte

- Parser: `svelte-eslint-parser`
- Regras padrao aplicadas com suporte a TypeScript

#### 2. Arquivos de Configuracao (vite.config.ts, vitest.config.ts, etc.)

- Regras de type-checking desabilitadas
- Permite flexibilidade na configuracao
- Regras desabilitadas:
  - `@typescript-eslint/no-floating-promises`
  - `@typescript-eslint/no-misused-promises`
  - `@typescript-eslint/await-thenable`
  - `@typescript-eslint/strict-boolean-expressions`
  - `@typescript-eslint/no-unnecessary-type-assertion`
  - `@typescript-eslint/no-explicit-any`
  - `@typescript-eslint/explicit-function-return-types`

## Status do Lint

### Resultado Atual

- **Erros**: 0 ❌ (bloqueador)
- **Warnings**: 127 ⚠️ (não-bloqueador)

### Execução Local

```bash
npm run lint
```

### Execucao em CI/CD

O lint executa automaticamente em:

- Pull Requests via `1-pull-request.yml` (job: `Lint & Format`)
- Deploy em main via `deploy-to-vm.yml`

## Cobertura de Testes (vitest)

Thresholds configurados no `vitest.config.ts` de cada pacote:

| Metrica    | Threshold |
| ---------- | --------- |
| Lines      | 80%       |
| Branches   | 75%       |
| Functions  | 80%       |
| Statements | 80%       |

Provider de cobertura: `v8`
Reporters: `text`, `json`, `html`, `lcov`

## Proximas Fases

### Fase 2: Cobertura de Testes

- [x] Implementar unit tests em todos os pacotes
- [x] Target: 80% code coverage minimo (lines/functions/statements), 75% branches
- [ ] Coverage gates em PRs

### Fase 3: Seguranca

- [ ] Configurar SonarCloud obrigatorio
- [ ] npm audit com fail em HIGH+CRITICAL
- [ ] OWASP Dependency Check

### Fase 4: Testes E2E

- [x] Playwright para caminhos criticos
- [x] Auth flow testing
- [x] Dashboard integration tests

## Solucao de Problemas

### Erro: "ESLint was configured to run on ... However, that TSConfig does not include this file"

**Solução**: Verificar se o arquivo está incluído no tsconfig.json correto:

1. Para arquivos em `packages/*/src/*` → verificar `packages/*/tsconfig.json`
2. Para config files → verificar se `include` contém o padrão do arquivo
3. Para arquivos em `shared/` → verificar `shared/tsconfig.json`

### Como ignorar regras de lint especificas

Em casos especiais, voce pode desabilitar regras:

```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data: any = response.data;
```

Ou em blocos:

```typescript
/* eslint-disable @typescript-eslint/no-explicit-any */
// código aqui
/* eslint-enable @typescript-eslint/no-explicit-any */
```

## Referencias

- [Documentacao ESLint](https://eslint.org/)
- [TypeScript ESLint](https://typescript-eslint.io/)
- [Svelte ESLint](https://github.com/sveltejs/eslint-plugin-svelte)
