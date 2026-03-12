# Guia de Configuração do ESLint

## Arquitetura do Monorepo & TypeScript

Este monorepo utiliza uma arquitetura multi-pacote com TypeScript configurado em múltiplos níveis.

### Por que múltiplos tsconfig.json?

Cada pacote tem necessidades diferentes:

- **Pacotes SvelteKit**: Precisam de configuração especial para Vite e SvelteKit
- **Design System**: Biblioteca de componentes isolada
- **Shared**: Código utilitário compartilhado

A raiz `tsconfig.json` serve como base e cada pacote estende com suas próprias paths e configurações.

## Como o ESLint Funciona

### 1. Descoberta de Arquivos

O ESLint procura por arquivos TypeScript/JavaScript de acordo com a configuração.

### 2. Resolução de tsconfig.json

Para cada arquivo, ESLint precisa encontrar o `tsconfig.json` apropriado:

```
Arquivo: packages/00_dashboard/src/routes/+page.svelte
↓
ESLint procura em: packages/00_dashboard/tsconfig.json ✅
Se não encontrar, tenta: ./tsconfig.json (raiz)
```

### 3. Validação de Tipos

ESLint usa o TypeScript compiler para validar tipos e regras avançadas.

## Configuração: parserOptions.project

### Problema Original

```json
"parserOptions": {
  "project": "./tsconfig.json"  // ❌ Só procura na raiz!
}
```

Isso fazia ESLint procurar por `packages/00_dashboard/src/app.ts` em `./tsconfig.json`, mas esse arquivo não estava incluído lá.

### Solução Implementada

```json
"parserOptions": {
  "project": [
    "./tsconfig.json",
    "./packages/*/tsconfig.json",
    "./shared/tsconfig.json"
  ]  // ✅ Procura em múltiplos locais!
}
```

Agora ESLint pode encontrar o tsconfig.json correto para cada pacote.

## Estrutura de Includes

### Padrão Geral

Cada `tsconfig.json` deve incluir:

1. **Código fonte**: `src/**/*`
2. **Arquivos de config** que serão lintados

### Exemplo: packages/00_dashboard/tsconfig.json

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": ".svelte-kit/output",
    "rootDir": "src",
    "paths": { ... }
  },
  "include": [
    "src",
    "vite.config.ts",
    "vitest.config.ts",
    "svelte.config.js"
  ]
}
```

## Overrides: Regras Especiais por Tipo de Arquivo

### 1. Arquivos Svelte

```json
{
  "files": ["*.svelte"],
  "parser": "svelte-eslint-parser",
  "parserOptions": {
    "parser": "@typescript-eslint/parser",
    "project": [...]
  }
}
```

Arquivos Svelte precisam de um parser especial que entenda a sintaxe `.svelte`.

### 2. Arquivos de Configuração

```json
{
  "files": [
    "**/vite.config.ts",
    "**/vitest.config.ts",
    "**/svelte.config.js",
    "**/playwright.config.ts",
    "**/tailwind.config.js"
  ],
  "parserOptions": {
    "project": null
  },
  "rules": {
    "@typescript-eslint/no-floating-promises": "off",
    "@typescript-eslint/no-misused-promises": "off",
    "@typescript-eslint/await-thenable": "off",
    "@typescript-eslint/strict-boolean-expressions": "off",
    "@typescript-eslint/no-unnecessary-type-assertion": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/explicit-function-return-types": "off"
  }
}
```

Arquivos de configuração podem ser mais flexíveis com types e promises porque são executados em build-time, não em runtime.

## Checklist: Adicionando um Novo Pacote

Se você adicionar um novo pacote ao monorepo:

- [ ] Criar `packages/seu-pacote/tsconfig.json`
- [ ] Estender: `"extends": "../../tsconfig.json"`
- [ ] Incluir: `src` e config files necessários
- [ ] ESLint encontrará automaticamente (padrão glob já existe)

Exemplo:

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "rootDir": "src"
  },
  "include": ["src", "vitest.config.ts"]
}
```

## Depurando Problemas de ESLint

### Comandos Úteis

```bash
# Ver qual tsconfig.json ESLint está usando
npm run lint -- --debug 2>&1 | grep tsconfig
```

### Erro Comum: "File not included in any tsconfig"

**Solução**: Adicionar o arquivo/padrão ao `include` do tsconfig.json apropriado.

### Verificar Configuração

```bash
# Simular lint de um arquivo específico
npm run lint -- packages/seu-pacote/src/file.ts --debug
```

## Regras de Lint: Severidades

- **error** ❌: Bloqueia o build/push
- **warn** ⚠️: Mostra aviso mas não bloqueia
- **off** 🚫: Ignorado

Todas as regras críticas estão em **warn** para manter pragmatismo:

- Código funciona
- Warnings alertam sobre melhorias
- Fácil de atualizar para `error` quando cobertura melhorar

## Desempenho

O padrão glob `./packages/*/tsconfig.json` é eficiente porque:

1. Node.js faz cache dos globs resolvidos
2. ESLint faz cache dos resultados de parsing
3. TypeScript faz cache incremental

Para repositórios maiores, considere ser específico:

```json
"project": [
  "./tsconfig.json",
  "./packages/00_dashboard/tsconfig.json",
  "./packages/01_auth-profile/tsconfig.json",
  "./packages/02_projects/tsconfig.json",
  "./packages/design-system/tsconfig.json",
  "./shared/tsconfig.json"
]
```

## Referências

- `.eslintrc.json`: Configuração principal
- `.eslintignore`: Arquivos ignorados
- Scripts em `package.json`:
  - `npm run lint`: Verificar código
  - `npm run lint:fix`: Corrigir automaticamente
