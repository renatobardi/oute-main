# Guia TDD Red-Green-Refactor - OUTE

## Visao Geral

O projeto OUTE adota **TDD (Test-Driven Development)** como pratica obrigatoria de desenvolvimento. Este guia explica o ciclo Red-Green-Refactor e como aplica-lo em cada camada da arquitetura hexagonal do projeto.

**Referencia**: O pacote `01_auth-profile` e o exemplo canonico de TDD no projeto, com 178+ testes e 80%+ de cobertura.

---

## 1. O que e TDD

TDD (Test-Driven Development) e uma tecnica de desenvolvimento onde os **testes sao escritos antes do codigo de producao**. Criada por Kent Beck, a pratica se baseia em tres leis:

1. **Nao escreva codigo de producao** sem antes ter um teste que falhe
2. **Nao escreva mais teste** do que o suficiente para falhar (erro de compilacao conta como falha)
3. **Nao escreva mais codigo de producao** do que o suficiente para fazer o teste passar

### Por que TDD no OUTE?

- **Feedback de design**: Testes escritos primeiro revelam problemas de acoplamento e coesao
- **Seguranca contra regressao**: Cada funcionalidade tem cobertura de teste desde o inicio
- **Documentacao viva**: Os testes documentam o comportamento esperado do sistema
- **Confianca para refatorar**: Com testes solidos, refatoracao e segura
- **Qualidade consistente**: Garante os 80%+ de cobertura exigidos pelo CI/CD

---

## 2. O Ciclo Red-Green-Refactor

```
  ┌─────────┐     ┌─────────┐     ┌──────────┐
  │   RED   │────>│  GREEN  │────>│ REFACTOR │
  │ (teste  │     │ (codigo │     │ (limpar  │
  │  falha) │     │ minimo) │     │  codigo) │
  └─────────┘     └─────────┘     └──────────┘
       ^                               │
       └───────────────────────────────┘
```

### RED - Escreva um teste que falha

- Escreva **um unico teste** que descreve o comportamento desejado
- O teste deve falhar pelo motivo certo (asserção falha ou erro de compilação, não erro de runtime)
- Use nomes descritivos: `it('should create email with valid format', ...)`

### GREEN - Faca o teste passar

- Escreva o **minimo de codigo** necessario para o teste passar
- Nao otimize, nao generalize, nao refatore — apenas faca passar
- E aceitavel usar codigo "feio" nesta fase

### REFACTOR - Limpe o codigo

- Melhore a estrutura mantendo **todos os testes verdes**
- Extraia metodos, renomeie variaveis, remova duplicacao
- Refatore tanto o codigo de producao quanto os testes
- Se algum teste quebrar, desfaca a refatoracao

### Regras do Ciclo

- Cada ciclo deve levar **1-5 minutos**
- **Commite apos cada GREEN ou REFACTOR** bem-sucedido
- Use mensagens de commit que evidenciem o ciclo TDD:
  ```
  test(projects): add ProjectName empty validation test       ← RED
  feat(projects): implement ProjectName empty validation      ← GREEN
  refactor(projects): extract ProjectName.validate method     ← REFACTOR
  ```
- Execute a suite completa antes de fazer push

---

## 3. TDD por Camada Arquitetural

### Resumo

| Camada | Tipo de Teste | Runner | O que Mockar | Referencia |
|--------|--------------|--------|-------------|-----------|
| Domain (entities, VOs, errors) | Unit | Vitest | Nada — logica pura | `Email.test.ts`, `User.test.ts` |
| Application (use cases, DTOs) | Unit | Vitest | Todos os ports via `vi.fn()` | `LoginUseCase.test.ts` |
| Infrastructure (adapters) | Integration | Vitest | Sistemas externos quando necessario | `JwtTokenAdapter.test.ts` |
| Presentation (handlers) | Unit | Vitest | Use cases via `vi.fn()` | `LoginHandler.test.ts` |
| Componentes Svelte | Unit | Vitest | API calls, stores | `@testing-library/svelte` |
| Fluxos completos | E2E | Playwright | Nada — sistema real | `auth.spec.ts` |

### Proporcao alvo

- **60%** testes unitarios
- **25%** testes de integracao
- **15%** testes E2E

---

### 3.1 Domain Layer — Value Objects

Value Objects sao imutaveis, validados na criacao e comparados por valor. Testes de domain sao **puros** — sem mocks, sem I/O.

**Padrao de referencia**: `packages/01_auth-profile/src/__tests__/unit/domain/value-objects/Email.test.ts`

#### Exemplo: Value Object `ProjectName`

**Ciclo 1 — RED: Criacao basica**

```typescript
// src/__tests__/unit/domain/value-objects/ProjectName.test.ts
import { describe, it, expect } from 'vitest';
import { ProjectName } from '../../../../domain/value-objects/ProjectName';

describe('ProjectName Value Object', () => {
  it('should create ProjectName with valid value', () => {
    const name = ProjectName.create('Meu Projeto');
    expect(name.getValue()).toBe('Meu Projeto');
  });
});
```

> O teste falha: `ProjectName` nao existe.

**Ciclo 1 — GREEN: Implementacao minima**

```typescript
// src/domain/value-objects/ProjectName.ts
export class ProjectName {
  private constructor(private readonly value: string) {}

  static create(value: string): ProjectName {
    return new ProjectName(value);
  }

  getValue(): string {
    return this.value;
  }
}
```

> Teste passa. Commit: `feat(projects): implement ProjectName value object creation`

---

**Ciclo 2 — RED: Validacao de nome vazio**

```typescript
it('should throw error for empty name', () => {
  expect(() => ProjectName.create('')).toThrow(InvalidProjectNameError);
});

it('should throw error for whitespace-only name', () => {
  expect(() => ProjectName.create('   ')).toThrow(InvalidProjectNameError);
});
```

> Testes falham: nao ha validacao.

**Ciclo 2 — GREEN: Adicionar validacao**

```typescript
import { InvalidProjectNameError } from '../errors/InvalidProjectNameError';

export class ProjectName {
  private constructor(private readonly value: string) {}

  static create(value: string): ProjectName {
    if (!value || value.trim().length === 0) {
      throw new InvalidProjectNameError('Project name cannot be empty');
    }
    return new ProjectName(value.trim());
  }

  getValue(): string {
    return this.value;
  }
}
```

> Testes passam. Commit.

---

**Ciclo 3 — RED: Validacao de tamanho maximo**

```typescript
it('should throw error for name longer than 100 characters', () => {
  const longName = 'a'.repeat(101);
  expect(() => ProjectName.create(longName)).toThrow(InvalidProjectNameError);
});
```

**Ciclo 3 — GREEN**

```typescript
static create(value: string): ProjectName {
  if (!value || value.trim().length === 0) {
    throw new InvalidProjectNameError('Project name cannot be empty');
  }
  if (value.trim().length > 100) {
    throw new InvalidProjectNameError('Project name must be 100 characters or less');
  }
  return new ProjectName(value.trim());
}
```

**Ciclo 3 — REFACTOR: Extrair validacao**

```typescript
export class ProjectName {
  private constructor(private readonly value: string) {}

  static create(value: string): ProjectName {
    ProjectName.validate(value);
    return new ProjectName(value.trim());
  }

  private static validate(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new InvalidProjectNameError('Project name cannot be empty');
    }
    if (value.trim().length > 100) {
      throw new InvalidProjectNameError('Project name must be 100 characters or less');
    }
  }

  getValue(): string {
    return this.value;
  }
}
```

> Todos os testes continuam verdes. Commit: `refactor(projects): extract ProjectName.validate method`

---

**Ciclo 4 — RED: Comparacao de igualdade**

```typescript
it('should compare two ProjectNames by value', () => {
  const name1 = ProjectName.create('Projeto A');
  const name2 = ProjectName.create('Projeto A');
  const name3 = ProjectName.create('Projeto B');

  expect(name1.equals(name2)).toBe(true);
  expect(name1.equals(name3)).toBe(false);
});
```

**Ciclo 4 — GREEN**

```typescript
equals(other: ProjectName): boolean {
  return this.value === other.value;
}
```

> Commit. Seguindo o padrao do `Email.ts` do auth-profile.

---

### 3.2 Domain Layer — Entities

Entities possuem identidade, estado mutavel e regras de negocio. Usam constructors privados com factory methods `create()` e `reconstruct()`.

**Padrao de referencia**: `packages/01_auth-profile/src/__tests__/unit/domain/entities/User.test.ts`

#### Exemplo: Entity `Project`

**Ciclo 1 — RED: Criacao via factory**

```typescript
// src/__tests__/unit/domain/entities/Project.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { Project } from '../../../../domain/entities/Project';
import { ProjectName } from '../../../../domain/value-objects/ProjectName';
import { ProjectStatus } from '../../../../domain/value-objects/ProjectStatus';

describe('Project Entity', () => {
  describe('create', () => {
    it('should create a new project with valid data', () => {
      const project = Project.create({
        name: ProjectName.create('Meu Projeto'),
        description: 'Descricao do projeto',
        ownerId: 'user-123',
      });

      expect(project.name.getValue()).toBe('Meu Projeto');
      expect(project.description).toBe('Descricao do projeto');
      expect(project.id).toBeDefined();
      expect(project.status).toBe(ProjectStatus.DRAFT);
      expect(project.createdAt).toBeDefined();
    });
  });
});
```

**Ciclo 1 — GREEN: Implementacao minima**

```typescript
// src/domain/entities/Project.ts
export class Project {
  private constructor(
    public readonly id: ProjectId,
    public readonly name: ProjectName,
    public readonly description: string,
    public readonly status: ProjectStatus,
    public readonly ownerId: string,
    public readonly createdAt: Date
  ) {}

  static create(props: {
    name: ProjectName;
    description: string;
    ownerId: string;
  }): Project {
    return new Project(
      ProjectId.generate(),
      props.name,
      props.description,
      ProjectStatus.DRAFT,
      props.ownerId,
      new Date()
    );
  }
}
```

---

**Ciclo 2 — RED: Adicionar membro**

```typescript
describe('addMember', () => {
  let project: Project;

  beforeEach(() => {
    project = Project.create({
      name: ProjectName.create('Meu Projeto'),
      description: 'Descricao',
      ownerId: 'user-123',
    });
  });

  it('should add a member to the project', () => {
    project.addMember('user-456', MemberRole.EDITOR);
    expect(project.hasMember('user-456')).toBe(true);
  });
});
```

**Ciclo 2 — GREEN**: Implementar `addMember()` e `hasMember()` com array interno.

---

**Ciclo 3 — RED: Guarda contra membro duplicado**

```typescript
it('should throw error when adding duplicate member', () => {
  project.addMember('user-456', MemberRole.EDITOR);
  expect(() => project.addMember('user-456', MemberRole.VIEWER))
    .toThrow(UserAlreadyMemberError);
});
```

**Ciclo 3 — GREEN**: Adicionar guard clause com `if (this.hasMember(...))`.

**Ciclo 3 — REFACTOR**: Extrair busca de membro para metodo privado `findMember()`, seguindo o padrao de `User.hasRole()` / `User.addRole()` do auth-profile.

---

### 3.3 Domain Layer — Errors

Errors de dominio estendem `DomainError` (base class em `packages/01_auth-profile/src/domain/errors/DomainError.ts`).

**Ciclo RED-GREEN rapido:**

```typescript
// RED
import { describe, it, expect } from 'vitest';
import { InvalidProjectNameError } from '../../../../domain/errors/InvalidProjectNameError';
import { DomainError } from '../../../../domain/errors/DomainError';

describe('InvalidProjectNameError', () => {
  it('should have correct code and message', () => {
    const error = new InvalidProjectNameError('Name too long');

    expect(error).toBeInstanceOf(DomainError);
    expect(error.code).toBe('INVALID_PROJECT_NAME');
    expect(error.message).toBe('Name too long');
  });
});
```

```typescript
// GREEN
import { DomainError } from './DomainError';

export class InvalidProjectNameError extends DomainError {
  constructor(message: string) {
    super(message, 'INVALID_PROJECT_NAME');
  }
}
```

---

### 3.4 Application Layer — Use Cases

Use Cases orquestram a logica de dominio. Dependencias sao injetadas via construtor e mockadas nos testes com `vi.fn()`.

**Padrao de referencia**: `packages/01_auth-profile/src/__tests__/unit/application/use-cases/LoginUseCase.test.ts`

#### Exemplo: `CreateProjectUseCase`

**Setup: Mockando dependencias**

```typescript
// src/__tests__/unit/application/use-cases/CreateProjectUseCase.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateProjectUseCase } from '../../../../application/use-cases/CreateProjectUseCase';
import type { IProjectRepository } from '../../../../domain/repositories/IProjectRepository';

describe('CreateProjectUseCase', () => {
  let useCase: CreateProjectUseCase;
  let projectRepository: IProjectRepository;

  beforeEach(() => {
    // Mock do repositorio — seguindo o padrao do LoginUseCase.test.ts
    projectRepository = {
      save: vi.fn(),
      findById: vi.fn(),
      findByOwnerId: vi.fn(),
      delete: vi.fn(),
      exists: vi.fn(),
      count: vi.fn(),
    };

    useCase = new CreateProjectUseCase(projectRepository);
  });
```

**Ciclo 1 — RED: Happy path**

```typescript
  describe('execute', () => {
    it('should create project and save to repository', async () => {
      const request = {
        name: 'Meu Projeto',
        description: 'Descricao do projeto',
        ownerId: 'user-123',
      };

      vi.mocked(projectRepository.save).mockResolvedValue(undefined);

      const result = await useCase.execute(request);

      expect(result.id).toBeDefined();
      expect(result.name).toBe('Meu Projeto');
      expect(projectRepository.save).toHaveBeenCalled();
    });
  });
```

**Ciclo 1 — GREEN**

```typescript
export class CreateProjectUseCase {
  constructor(private projectRepository: IProjectRepository) {}

  async execute(request: CreateProjectRequest): Promise<CreateProjectOutput> {
    const project = Project.create({
      name: ProjectName.create(request.name),
      description: request.description,
      ownerId: request.ownerId,
    });

    await this.projectRepository.save(project);

    return {
      id: project.id.getValue(),
      name: project.name.getValue(),
      description: project.description,
      status: project.status,
    };
  }
}
```

---

**Ciclo 2 — RED: Propagacao de erro de dominio**

```typescript
it('should propagate InvalidProjectNameError for invalid name', async () => {
  const request = {
    name: '',
    description: 'Descricao',
    ownerId: 'user-123',
  };

  await expect(useCase.execute(request)).rejects.toThrow(InvalidProjectNameError);
});
```

**Ciclo 2 — GREEN**: Nenhuma mudanca necessaria — a validacao ja esta no `ProjectName.create()`. O teste verifica que o erro de dominio propaga corretamente atraves do use case.

---

**Ciclo 3 — RED: Verificar argumentos passados ao repositorio**

```typescript
it('should save project with correct data to repository', async () => {
  const request = {
    name: 'Projeto TDD',
    description: 'Projeto de exemplo',
    ownerId: 'user-123',
  };

  vi.mocked(projectRepository.save).mockResolvedValue(undefined);

  await useCase.execute(request);

  expect(projectRepository.save).toHaveBeenCalledWith(
    expect.objectContaining({
      name: expect.objectContaining({ getValue: expect.any(Function) }),
    })
  );
});
```

> Padrao: `expect(dependency.method).toHaveBeenCalledWith(...)` — igual ao `LoginUseCase.test.ts`.

---

### 3.5 Presentation Layer — Handlers

Handlers lidam com HTTP. Mockam o use case inteiro.

**Padrao de referencia**: `packages/01_auth-profile/src/__tests__/unit/presentation/handlers/LoginHandler.test.ts`

#### Exemplo: `CreateProjectHandler`

**Setup**

```typescript
// src/__tests__/unit/presentation/handlers/CreateProjectHandler.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateProjectHandler } from '../../../../presentation/handlers/CreateProjectHandler';
import { InvalidProjectNameError } from '../../../../domain/errors/InvalidProjectNameError';
import type { CreateProjectUseCase } from '../../../../application/use-cases/CreateProjectUseCase';

describe('CreateProjectHandler', () => {
  let handler: CreateProjectHandler;
  let createProjectUseCase: CreateProjectUseCase;

  beforeEach(() => {
    createProjectUseCase = {
      execute: vi.fn(),
    } as unknown as CreateProjectUseCase;

    handler = new CreateProjectHandler(createProjectUseCase);
  });
```

**Ciclo 1 — RED: Resposta 201 no sucesso**

```typescript
  describe('handle', () => {
    it('should return 201 with project data on success', async () => {
      const body = {
        name: 'Meu Projeto',
        description: 'Descricao',
        ownerId: 'user-123',
      };

      vi.mocked(createProjectUseCase.execute).mockResolvedValue({
        id: 'project-123',
        name: 'Meu Projeto',
        description: 'Descricao',
        status: 'DRAFT',
      });

      const result = await handler.handle(body);

      expect(result.status).toBe(201);
      expect((result.body as Record<string, unknown>).id).toBe('project-123');
    });
```

**Ciclo 1 — GREEN**: Implementar handler que chama use case e retorna 201.

---

**Ciclo 2 — RED: Validacao de campos obrigatorios**

```typescript
    it('should return 400 when name is missing', async () => {
      const body = { description: 'Descricao', ownerId: 'user-123' };

      const result = await handler.handle(body);

      expect(result.status).toBe(400);
      expect((result.body as Record<string, unknown>).error).toContain('name');
    });
```

**Ciclo 2 — GREEN**: Adicionar validacao de campos no handler.

---

**Ciclo 3 — RED: Mapeamento de erro de dominio**

```typescript
    it('should return 400 on domain validation error', async () => {
      const body = { name: '', description: 'Descricao', ownerId: 'user-123' };

      vi.mocked(createProjectUseCase.execute).mockRejectedValue(
        new InvalidProjectNameError('Project name cannot be empty')
      );

      const result = await handler.handle(body);

      expect(result.status).toBe(400);
      expect((result.body as Record<string, unknown>).error).toContain('Project name');
    });
  });
});
```

**Ciclo 3 — GREEN**: Adicionar try/catch com `ErrorMapper.toHttpResponse()`.

---

### 3.6 Infrastructure Layer — Adapters

Testes de integracao verificam que o adapter cumpre o contrato do port. Podem usar banco de dados real ou in-memory.

**Padrao de referencia**: `packages/01_auth-profile/src/__tests__/integration/adapters/JwtTokenAdapter.test.ts`

```typescript
// src/__tests__/integration/adapters/PostgresProjectRepository.test.ts
describe('PostgresProjectRepository', () => {
  it('should save and retrieve a project', async () => {
    // Arrange
    const project = Project.create({
      name: ProjectName.create('Projeto Teste'),
      description: 'Descricao de teste',
      ownerId: 'user-123',
    });

    // Act
    await repository.save(project);
    const found = await repository.findById(project.id.getValue());

    // Assert
    expect(found).not.toBeNull();
    expect(found?.name.getValue()).toBe('Projeto Teste');
  });
});
```

---

## 4. Regras e Boas Praticas

### Obrigatorio

1. **Test-first**: Toda feature nova e bug fix devem comecar com um teste que falha
2. **Um conceito por teste**: Multiplos `expect()` sao aceitaveis se verificam o mesmo conceito
3. **Arrange-Act-Assert**: Estruture todo teste com estas tres secoes, separadas por linhas em branco
4. **Sem interdependencia**: Cada teste configura seu proprio estado via `beforeEach`
5. **Testes rapidos**: Testes de domain/application devem rodar em < 1ms cada
6. **Coverage >= 80%**: Linhas, funcoes, statements (80%) e branches (75%)

### Nomenclatura de Testes

Use nomes descritivos em ingles seguindo o padrao do projeto:

```typescript
// Padrao: should [behavior] when [condition]
it('should create email with valid format', ...)
it('should throw error for empty email', ...)
it('should throw InvalidCredentialsError when user does not exist', ...)
```

### Estrutura de Arquivos

```
src/__tests__/
├── unit/
│   ├── domain/
│   │   ├── entities/          ← Entity.test.ts
│   │   ├── value-objects/     ← ValueObject.test.ts
│   │   └── errors/            ← Error.test.ts (opcional)
│   ├── application/
│   │   ├── use-cases/         ← UseCase.test.ts
│   │   └── mappers/           ← Mapper.test.ts
│   └── presentation/
│       ├── handlers/          ← Handler.test.ts
│       ├── middleware/        ← Middleware.test.ts
│       └── errors/            ← ErrorMapper.test.ts
├── integration/
│   ├── adapters/              ← Adapter.test.ts
│   └── repositories/         ← Repository.test.ts
└── e2e/
    └── feature.spec.ts        ← Playwright E2E
```

### Convencoes de Arquivo

- Testes unitarios e de integracao: `*.test.ts`
- Testes E2E (Playwright): `*.spec.ts`
- Localizacao: `src/__tests__/{unit,integration,e2e}/`

---

## 5. Checklist TDD para Pull Requests

Antes de abrir um PR, verifique:

- [ ] Testes escritos **ANTES** da implementacao (historico de commits evidencia ciclo TDD)
- [ ] Ciclo Red-Green-Refactor evidenciado nas mensagens de commit
- [ ] Testes unitarios para domain layer (entities, value objects, errors)
- [ ] Testes unitarios para application layer (use cases com mocks via `vi.fn()`)
- [ ] Testes unitarios para presentation layer (handlers com use cases mockados)
- [ ] Testes de integracao para infrastructure layer (adapters)
- [ ] Coverage >= 80% (linhas, funcoes, statements) e >= 75% (branches)
- [ ] Nenhum `.skip` ou `.only` nos testes
- [ ] Testes seguem padrao Arrange-Act-Assert
- [ ] Nomes de testes descritivos: `should [behavior] when [condition]`

---

## 6. Ferramentas e Comandos

### Ciclo TDD (desenvolvimento)

```bash
# Iniciar Vitest em modo watch (ideal para TDD)
npx vitest --watch --root packages/02_projects

# Rodar um arquivo de teste especifico
npx vitest run src/__tests__/unit/domain/value-objects/ProjectName.test.ts --root packages/02_projects

# Rodar todos os testes de um package
npx vitest run --root packages/02_projects
```

### Verificacao (antes do push)

```bash
# Rodar testes com cobertura
npx vitest run --coverage --root packages/02_projects

# Rodar todos os testes do monorepo
npm run test

# Rodar testes E2E
npx playwright test --root packages/02_projects
```

### Scripts de conveniencia no package.json

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test"
  }
}
```

---

## 7. Fluxo Completo de Desenvolvimento com TDD

```
1. Criar branch: git checkout -b feature/nome-da-feature develop
2. Abrir vitest em watch: npx vitest --watch --root packages/XX_service
3. Ciclo TDD:
   a. RED   → Escrever teste que falha
   b. GREEN → Codigo minimo para passar
   c. REFACTOR → Limpar mantendo verde
   d. Commit apos cada GREEN/REFACTOR
4. Repetir ciclo para cada comportamento
5. Verificar cobertura: npx vitest run --coverage
6. Lint e format: npm run lint && npm run format
7. Push e abrir PR
```

### Exemplo de Historico de Commits TDD

```
test(projects): add ProjectName creation test                    ← RED
feat(projects): implement ProjectName value object               ← GREEN
test(projects): add ProjectName empty validation test            ← RED
feat(projects): implement ProjectName empty validation           ← GREEN
test(projects): add ProjectName max length test                  ← RED
feat(projects): implement ProjectName max length validation      ← GREEN
refactor(projects): extract ProjectName.validate method          ← REFACTOR
test(projects): add ProjectName equality comparison test         ← RED
feat(projects): implement ProjectName.equals method              ← GREEN
```

---

## Referencias

- **Pacote referencia**: `packages/01_auth-profile/` — implementacao completa com TDD
- **Kent Beck**: "Test-Driven Development: By Example" (2002)
- **Robert C. Martin**: "Clean Code" (2008), "The Three Laws of TDD"
- **Arquitetura Hexagonal**: Ver `ARCHITECTURE.md`
- **Quality Gates**: Ver `QUALITY_STANDARDS.md`
- **Contributing**: Ver `contributing.md`

---

**Ultima atualizacao**: 2026-03-12
