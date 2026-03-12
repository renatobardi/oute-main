# Fase 6: SonarCloud Enforcement - Quality Gates (Minimo A-)

## Visao Geral

A Fase 6 implementa quality gates obrigatorios do SonarCloud no pipeline de CI/CD. Todos os PRs devem atingir uma **nota minima A-** antes do merge.

## Metricas do Quality Gate

| Metrica | Alvo | Requisito |
|---------|------|-----------|
| **Nota Geral** | **A-** | OBRIGATORIO |
| Nota de Confiabilidade | A | 0 bugs |
| Nota de Seguranca | A | 0 vulnerabilidades |
| Nota de Manutenibilidade | B+ | Code smells < limite |
| Cobertura de Codigo | 80% | Da Fase 5 |
| Linhas Duplicadas | < 3% | Deduplicacao de codigo |

## Detalhes de Implementacao

### 1. Arquivos de Configuracao

#### `sonar-project.properties`
Configuracao no nivel raiz para analise do SonarCloud:
- Identificacao e versionamento do projeto
- Padroes de source/test/exclusao
- Caminhos dos relatorios de cobertura
- Configuracoes especificas por linguagem

#### `.sonarcloud.yml`
Configuracao do SonarCloud com regras de quality gate:
- Limites de metricas
- Requisitos de nota (minimo A-)
- Limites de codigo duplicado
- Requisitos de cobertura

### 2. Requisitos do Quality Gate

**Todas as metricas devem passar:**

```
✅ Confiabilidade: 0 bugs permitidos (nota A)
✅ Seguranca: 0 vulnerabilidades permitidas (nota A)
✅ Manutenibilidade: Code smells dentro do limite (nota B+ = A- geral)
✅ Cobertura: 80% minimo (da Fase 5)
✅ Duplicacao: Menos de 3% do codigo
```

### 3. Integracao com CI/CD

O workflow de PR aplica SonarCloud como OBRIGATORIO:

1. **Testes executam** com coleta de cobertura (Fase 5)
2. **Scan do SonarCloud** analisa qualidade do codigo
3. **Verificacao do quality gate**: Nota deve ser A- ou melhor
4. **Se FALHOU**: PR bloqueado ❌ - Botao de merge desabilitado
5. **Se PASSOU**: PR permitido ✅ - Botao de merge habilitado

Flag chave: `-Dsonar.qualitygate.wait=true` garante que o workflow aguarda o resultado do quality gate.

## Dashboard do SonarCloud

Acesse o dashboard (requer conta no SonarCloud):

```
https://sonarcloud.io/project/overview?id=oute-main
```

**O dashboard mostra:**
- Nota geral (alvo: A-)
- Historico de notas (tendencia)
- Status do quality gate (passou/falhou)
- Detalhamento de metricas:
  - Bugs (alvo: 0)
  - Vulnerabilidades (alvo: 0)
  - Code smells (maximo A-)
  - Cobertura (alvo 80%)
  - Duplicacoes (< 3%)

## Como os Quality Gates Bloqueiam PRs

### Cenario 1: Nota A- ✅ (PASSOU)
```
Codigo enviado → Testes executam → Cobertura 85% ✅
→ Scan SonarCloud → Nota: A- ✅
→ Todas as metricas passam ✅
→ Merge do PR permitido ✅
```

### Cenario 2: Nota B (FALHOU)
```
Codigo enviado → Testes executam → Cobertura 85% ✅
→ Scan SonarCloud → Nota: B ❌
→ Muitos code smells ❌
→ Merge do PR BLOQUEADO ❌
```

## Metricas Explicadas

### Nota de Confiabilidade
- **Medida**: Bugs detectados pelo SonarCloud
- **Nota A**: 0 bugs (OBRIGATORIO)
- **Como corrigir**: Corrija todos os bugs reportados

### Nota de Seguranca
- **Medida**: Vulnerabilidades de seguranca
- **Nota A**: 0 vulnerabilidades (OBRIGATORIO)
- **Como corrigir**: Corrija todos os problemas de seguranca (SAST)

### Nota de Manutenibilidade
- **Medida**: Code smells (complexidade, duplicacao, etc.)
- **Nota B+**: Code smells dentro do limite aceitavel
- **Combinado com outras notas → A- geral**
- **Como corrigir**: Refatore codigo complexo, reduza duplicacao

### Cobertura de Codigo
- **Medida**: % do codigo coberto por testes
- **Alvo 80%**: Aplicado pela Fase 5
- **Integracao SonarCloud**: Consome relatorios LCOV
- **Como corrigir**: Adicione mais testes unitarios/E2E

### Linhas Duplicadas
- **Medida**: % de codigo duplicado
- **Alvo < 3%**: Limite pragmatico
- **Como corrigir**: Extraia funcoes comuns, use utilitarios

## Solucao de Problemas

### PR mostra "SonarCloud Quality Gate Failed"

1. **Verifique o dashboard**: https://sonarcloud.io/project/overview?id=oute-main
2. **Identifique a metrica que falhou**: Bugs? Vulnerabilidades? Code smells? Cobertura?
3. **Corrija os problemas**:
   - Bugs: Revise os achados do SonarCloud e corrija
   - Vulnerabilidades: Corrija problemas de seguranca
   - Code smells: Refatore codigo complexo
   - Cobertura: Adicione testes
4. **Envie a correcao** → SonarCloud re-analisa → Nota melhora

### Nota eh A mas ainda mostra "Failed"

Isso pode ser devido a:
- Cobertura abaixo de 80% (Fase 5)
- Codigo duplicado > 3%
- Novos bugs/vulnerabilidades

Verifique o dashboard do SonarCloud para metricas exatas.

### Como verificar a nota localmente?

Nao eh possivel executar o SonarCloud localmente sem o token. A nota esta disponivel apenas em:
- Comentarios no Pull Request (bot do SonarCloud)
- Dashboard do SonarCloud
- Logs do workflow do GitHub Actions

## Integracao com Outras Fases

**Fase 5 (Cobertura)**:
- Fornece `coverage/lcov.info`
- SonarCloud consome o relatorio
- Ambos devem passar para aprovacao do PR

**Fase 4 (Testes E2E)**:
- Garante que a aplicacao funciona de ponta a ponta
- Funciona em conjunto com a cobertura de testes unitarios

**Stack de Qualidade Completa**:
```
ESLint (Fase 1) → Testes Unitarios (Fase 2) → Testes E2E (Fase 4)
        ↓              ↓                         ↓
    0 warnings    Cobertura 80%           46 testes passam
        ↓              ↓                         ↓
        └─────────────→ SonarCloud (Fase 6) ←────┘
                       Nota: A- minimo
                       (obrigatorio, bloqueia PR)
```

## SonarCloud

- **SonarCloud**: Servico gratuito na nuvem (usado neste projeto)
- Integracao com GitHub (gratuito para repos publicos)
- Comentarios automaticos no PR com resultados
- Acesso ao dashboard

## Boas Praticas

1. **Corrija problemas cedo**: Verifique os logs do GitHub Actions
2. **Priorize seguranca**: 0 vulnerabilidades eh inegociavel
3. **Reduza complexidade**: Mantenha funcoes com menos de 15 linhas quando possivel
4. **Melhore cobertura incrementalmente**: 80% eh o minimo, mire em 85%+
5. **Documente exclusoes**: Se codigo precisar ser excluido, adicione comentario

## Proximas Fases

- **Fase 7**: Padroes de Documentacao (QUALITY_STANDARDS.md)

## Documentacao Relacionada

- [PHASE5_COVERAGE_GATES.md](./PHASE5_COVERAGE_GATES.md) - Limites de cobertura
