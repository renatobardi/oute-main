# Plano: Implementar TDD Red-Green-Refactor como Padrão no OUTE

## Contexto

O projeto OUTE já possui uma base sólida de testes no pacote `01_auth-profile` (178+ testes, arquitetura hexagonal, 80%+ coverage), mas não há um guia formal de TDD nem a prática é documentada como padrão obrigatório. Os demais pacotes (`00_dashboard`, `02_projects`, `03_interview`, `design-system`) têm testes mínimos. O objetivo é formalizar o ciclo Red-Green-Refactor como metodologia padrão de desenvolvimento, usando a documentação e exemplos concretos do próprio projeto.

---

## Entregáveis

### 1. CRIAR: `TDD_GUIDE.md` (na raiz do projeto, em PT-BR)

Guia completo com as seguintes seções:

**Seção 1 - Introdução ao TDD**
- O que é TDD e por que o OUTE adota
- As três leis do TDD (Kent Beck / Robert C. Martin)
- Benefícios: feedback de design, segurança contra regressão, documentação viva

**Seção 2 - O Ciclo Red-Green-Refactor**
- **RED**: Escrever teste que falha descrevendo o comportamento desejado
- **GREEN**: Escrever o mínimo de código de produção para o teste passar
- **REFACTOR**: Limpar código de produção e de teste mantendo tudo verde
- Regras: cada ciclo deve levar 1-5 minutos, commitar após GREEN/REFACTOR

**Seção 3 - TDD por Camada Arquitetural** (com exemplos completos usando `02_projects`)

| Camada | Tipo de Teste | O que Mockar | Padrão de Referência |
|--------|--------------|-------------|---------------------|
| Domain (entities, VOs) | Unit | Nada - lógica pura | `Email.test.ts`, `User.test.ts` |
| Application (use cases) | Unit | Todos os ports/adapters via `vi.fn()` | `LoginUseCase.test.ts` |
| Infrastructure (adapters) | Integration | Sistemas externos (DB) | `JwtTokenAdapter.test.ts` |
| Presentation (handlers) | Unit | Use cases via `vi.fn()` | `LoginHandler.test.ts` |
| Componentes Svelte | Unit | API calls, stores | `@testing-library/svelte` |
| Fluxos completos | E2E | Nada - sistema real | Playwright specs |

Exemplos concretos Red-Green-Refactor para cada camada:
- **Value Object `ProjectName`**: criação → validação vazio → validação tamanho → `equals()`
- **Entity `Project`**: `create()` → `addMember()` → guarda duplicata → transição de status
- **Use Case `CreateProjectUseCase`**: happy path → output DTO → propagação de erro
- **Handler `CreateProjectHandler`**: resposta 201 → validação 400 → error mapping
- **Componente Svelte `ProjectCard`**: renderiza nome → badge status → evento click

**Seção 4 - Quando Usar Cada Tipo de Teste**
- Proporção alvo: 60% unit, 25% integration, 15% E2E

**Seção 5 - Regras e Boas Práticas**
- Test-first obrigatório para features e bug fixes
- Um conceito de asserção por teste
- Padrão Arrange-Act-Assert com linhas em branco separando
- Sem interdependência entre testes (`beforeEach` para setup)
- Testes de domain/application devem rodar em < 1ms cada

**Seção 6 - Checklist TDD para Pull Requests**
- Testes escritos ANTES da implementação (evidenciado no histórico de commits)
- Coverage >= 80%
- Sem `.skip` ou `.only`
- Testes seguem Arrange-Act-Assert

**Seção 7 - Ferramentas e Comandos**
- `npx vitest --watch` para ciclo TDD
- `npx vitest run --coverage` para verificar thresholds
- Scripts de conveniência

---

### 2. MODIFICAR: `contributing.md`

- Atualizar seção "Develop your feature" (linha ~83) para incluir fluxo TDD:
  ```
  1. Escreva o teste (RED)
  2. Implemente o mínimo (GREEN)
  3. Refatore (REFACTOR)
  4. Repita
  ```
- Adicionar seção "Desenvolvimento com TDD" entre "Testing" e "Documentation" com link para `TDD_GUIDE.md`
- Atualizar coverage de "70%+" para "80%+ (enforced by CI). Follow TDD — see TDD_GUIDE.md"
- Adicionar item ao PR checklist: "Tests written before implementation (TDD)"

---

### 3. MODIFICAR: `QUALITY_STANDARDS.md`

- Adicionar subseção "2.1 TDD (Test-Driven Development) - Prática Obrigatória" na seção "Test Coverage" (após linha 49):
  - Referência ao `TDD_GUIDE.md`
  - Verificação no code review: histórico de commits evidenciando testes antes da implementação
- Adicionar ao PR Requirements Checklist (linha ~217):
  - `[ ] TDD praticado (testes antes da implementação - ver TDD_GUIDE.md)`

---

## Arquivos Críticos

| Ação | Arquivo |
|------|---------|
| CRIAR | `/home/user/oute-main/TDD_GUIDE.md` |
| MODIFICAR | `/home/user/oute-main/contributing.md` |
| MODIFICAR | `/home/user/oute-main/QUALITY_STANDARDS.md` |

**Arquivos de referência** (para basear exemplos):
- `/home/user/oute-main/packages/01_auth-profile/src/__tests__/unit/domain/value-objects/Email.test.ts`
- `/home/user/oute-main/packages/01_auth-profile/src/__tests__/unit/application/use-cases/LoginUseCase.test.ts`
- `/home/user/oute-main/packages/01_auth-profile/src/__tests__/unit/presentation/handlers/LoginHandler.test.ts`
- `/home/user/oute-main/packages/01_auth-profile/src/domain/value-objects/Email.ts`
- `/home/user/oute-main/packages/01_auth-profile/src/domain/entities/User.ts`

---

## Verificação

1. Revisar que `TDD_GUIDE.md` contém exemplos compiláveis e consistentes com os padrões do `01_auth-profile`
2. Verificar que `contributing.md` e `QUALITY_STANDARDS.md` referenciam corretamente o guia TDD
3. Confirmar que os exemplos usam as convenções existentes: `vi.fn()`, `describe/it`, Arrange-Act-Assert, nomes de arquivo `*.test.ts`
4. Executar `npm run lint` e `npm run format` para garantir formatação dos arquivos modificados

---

## O que NÃO será alterado

- **Nenhuma mudança em CI/CD** — o pipeline existente já enforce coverage e testes
- **Nenhuma dependência nova** — usa apenas Vitest, Playwright e ferramentas já instaladas
- **Nenhum código de produção** — apenas documentação e guias
