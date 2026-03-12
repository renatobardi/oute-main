# Fase 5: Enforcement de Coverage Gates

## Visao Geral

A Fase 5 implementa enforcement automatizado de cobertura de codigo no pipeline de CI/CD. Todos os PRs devem atingir os limites minimos de cobertura antes do merge.

## Limites de Cobertura

| Metrica | Alvo | Status |
|---------|------|--------|
| Lines | 80% | ✅ Ativo |
| Branches | 75% | ✅ Ativo |
| Functions | 80% | ✅ Ativo |
| Statements | 80% | ✅ Ativo |

## Detalhes de Implementacao

### 1. Configuracao Vitest

Todos os pacotes possuem configuracao de cobertura em `vitest.config.ts`:

```typescript
coverage: {
  provider: 'v8',
  reporter: ['text', 'json', 'html', 'lcov'],
  lines: 80,
  branches: 75,
  functions: 80,
  statements: 80,
  exclude: ['node_modules/', 'dist/', 'build/', '**/*.test.ts', '**/*.spec.ts'],
}
```

**Pacotes cobertos:**
- `packages/00_dashboard`
- `packages/01_auth-profile`
- `packages/02_projects`
- `packages/design-system`
- `shared`

### 2. Integracao com CI/CD

O workflow de PR (`1-pull-request.yml`) aplica cobertura com:

1. **Execucao de testes com cobertura**: `npm run test -- --run --coverage`
2. **Validacao de limites de cobertura**: Parse do `coverage/coverage-final.json` e verificacao:
   - Lines: >= 80%
   - Branches: >= 75%
   - Functions: >= 80%
   - Statements: >= 80%
3. **Artefatos de cobertura**: Relatorios armazenados por 30 dias

### 3. Relatorios de Cobertura

Relatorios de cobertura sao gerados em:
- `coverage/lcov.info` - Formato LCOV (para SonarCloud)
- `coverage/index.html` - Relatorio HTML (visualizacao no navegador)
- `coverage/coverage-final.json` - Formato JSON (para parsing)

## Como Funcionam os Coverage Gates

### Na Criacao do PR

```
1. Codigo enviado → PR criado
2. GitHub Actions acionado
3. Testes executados com coleta de cobertura
4. Limites de cobertura validados
5. Se cobertura < limites → PR bloqueado ❌
6. Se cobertura >= limites → PR permitido ✅
```

### Verificando Cobertura Localmente

Execute testes com cobertura antes de fazer push:

```bash
npm run test -- --coverage
```

Isso gera relatorios de cobertura e mostra o resumo no terminal.

### Visualizar Relatorio de Cobertura

Apos executar os testes:

```bash
open coverage/index.html  # macOS
xdg-open coverage/index.html  # Linux
start coverage/index.html  # Windows
```

## Exclusoes

Os seguintes arquivos sao excluidos do calculo de cobertura:

- `node_modules/`
- `dist/`
- `build/`
- `**/*.test.ts`
- `**/*.spec.ts`
- `**/index.ts` (barrel files)

## Abordagem Pragmatica

- **Limite de 80%**: Aplicado para metricas criticas (lines, functions, statements)
- **Limite de 75%**: Ligeiramente relaxado para branches (logica condicional complexa)
- **Exclusoes**: Arquivos de teste e build nao contabilizados (apenas codigo de producao)

## Integracao com SonarCloud

Relatorios de cobertura tambem sao consumidos pelo SonarCloud:

- **Relatorio LCOV**: `coverage/lcov.info`
- **Metrica SonarCloud**: Linhas de codigo com cobertura
- **Quality gate**: Combina cobertura com outras metricas

## Solucao de Problemas

### Relatorios de cobertura nao gerados

```bash
# Verificar se cobertura esta habilitada no vitest.config.ts
npm run test -- --coverage --reporter=verbose
```

### Cobertura abaixo do limite

1. Analise o relatorio HTML: `open coverage/index.html`
2. Identifique linhas nao cobertas
3. Adicione testes para cobrir o codigo
4. Re-execute os testes localmente para verificar

### Falsos positivos

Se a cobertura esta genuinamente baixa mas aceitavel:
- Documente o motivo na descricao do PR
- Solicite revisao dos mantenedores
- Considere se o codigo eh realmente testavel

## Proximas Fases

- **Fase 6**: SonarCloud Enforcement (quality gates)
- **Fase 7**: Padroes de Documentacao

## Documentacao Relacionada

- [PHASE6_SONARQUBE_ENFORCEMENT.md](./PHASE6_SONARQUBE_ENFORCEMENT.md) - Quality gates SonarCloud
- [PHASE7_DOCUMENTATION_STANDARDS.md](./PHASE7_DOCUMENTATION_STANDARDS.md) - Padroes de documentacao
