# Aplicando o Padrao de Arquitetura Hexagonal a Outros Servicos

## Visao Geral

Este documento fornece um **template e guia passo a passo** para aplicar o mesmo padrao de Arquitetura Hexagonal + DDD + Clean Code + TDD utilizado no `01_auth-profile` aos demais servicos:

- **00_dashboard** - Interface do dashboard e gerenciamento de widgets (Prioridade 2)
- **02_projects** - Gerenciamento de projetos e colaboracao (Prioridade 1)

## Status Atual

**✅ Ja Refatorado**:
- `01_auth-profile` - Arquitetura Hexagonal + DDD + TDD completa (178 testes, 80%+ cobertura)

**✅ Ja Implementado** (Marketing & Entrevista):
- `99_home` - Landing page com hero + CTA + estatisticas
- `03_interview` - Interface de chat com 3 paineis e anotacoes

**🔄 Proximos a Refatorar** (em ordem):
1. `02_projects` - API de gerenciamento de projetos (~5-6 semanas)
2. `00_dashboard` - Interface principal do dashboard (~5-6 semanas)

## Template de Arquitetura

Todo servico deve seguir esta estrutura:

```
packages/XX_service/
├── src/
│   ├── domain/                          # Logica de negocio pura
│   │   ├── entities/
│   │   │   └── [Entity].ts
│   │   ├── value-objects/
│   │   │   └── [ValueObject].ts
│   │   ├── services/
│   │   │   └── [DomainService].ts
│   │   ├── repositories/
│   │   │   └── I[Entity]Repository.ts
│   │   └── errors/
│   │       └── [Error].ts
│   │
│   ├── application/                     # Orquestracao
│   │   ├── use-cases/
│   │   │   └── [use-case]/[UseCase].ts
│   │   ├── dto/
│   │   │   └── [Request|Response].ts
│   │   ├── dto/mappers/
│   │   │   └── [Entity]Mapper.ts
│   │   └── ports/
│   │       └── I[Adapter].ts
│   │
│   ├── infrastructure/                  # Adaptadores
│   │   ├── adapters/
│   │   │   └── [Adapter].ts
│   │   └── config/
│   │       └── [config].ts
│   │
│   ├── presentation/                    # Camada HTTP/API
│   │   ├── handlers/
│   │   │   └── [Handler].ts
│   │   ├── middleware/
│   │   │   └── [middleware].ts
│   │   ├── errors/
│   │   │   └── ErrorMapper.ts
│   │   └── routes/
│   │       └── api/[endpoint]/+server.ts
│   │
│   ├── app.ts                           # Ponto de entrada
│   ├── hooks.server.ts                  # Configuracao de DI
│   └── __tests__/
│       ├── unit/
│       ├── integration/
│       └── e2e/
│
├── playwright.config.ts                 # E2E config
├── tsconfig.json
├── package.json
├── README.md
└── REFACTORING_COMPLETION.md            # Documentacao da refatoracao
```

---

## Padroes Especificos por Servico

### Servico 00_dashboard

#### Camada de Dominio

**Entidades Principais**:

```typescript
// domain/entities/Dashboard.ts
export class Dashboard {
  private constructor(
    public readonly id: DashboardId,
    public readonly userId: UserId,
    public name: string,
    public description: string,
    private widgets: Widget[],
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  static create(props: { userId: UserId; name: string; description: string }): Dashboard {
    // Metodo factory com validacao
  }

  addWidget(widget: Widget): void {
    if (this.widgets.length >= 10) {
      throw new DashboardLimitExceededError('Max 10 widgets');
    }
    this.widgets.push(widget);
  }

  removeWidget(widgetId: WidgetId): void {
    this.widgets = this.widgets.filter((w) => !w.id.equals(widgetId));
  }

  getWidgets(): Widget[] {
    return [...this.widgets]; // Imutavel para uso externo
  }
}

// domain/entities/Widget.ts
export class Widget {
  private constructor(
    public readonly id: WidgetId,
    public readonly dashboardId: DashboardId,
    public title: string,
    public type: WidgetType, // CHART, TABLE, METRIC, etc.
    public config: Record<string, unknown>,
    public readonly createdAt: Date
  ) {}

  static create(props: {
    dashboardId: DashboardId;
    title: string;
    type: WidgetType;
    config: Record<string, unknown>;
  }): Widget {
    // Validacao e construcao
  }

  updateConfig(config: Record<string, unknown>): void {
    // Logica de dominio para atualizacao de configuracao
  }
}
```

**Value Objects Principais**:

```typescript
// domain/value-objects/DashboardId.ts
export class DashboardId {
  private constructor(private value: string) {
    if (!isValidUUID(value)) {
      throw new InvalidDashboardIdError();
    }
  }

  static generate(): DashboardId {
    return new DashboardId(uuidv4());
  }

  static fromString(value: string): DashboardId {
    return new DashboardId(value);
  }

  getValue(): string {
    return this.value;
  }
}

// domain/value-objects/WidgetType.ts
export class WidgetType {
  static CHART = new WidgetType('CHART');
  static TABLE = new WidgetType('TABLE');
  static METRIC = new WidgetType('METRIC');
  static CUSTOM = new WidgetType('CUSTOM');

  private constructor(public readonly value: string) {}

  static fromString(value: string): WidgetType {
    const types = [WidgetType.CHART, WidgetType.TABLE, WidgetType.METRIC, WidgetType.CUSTOM];
    const type = types.find((t) => t.value === value);
    if (!type) throw new InvalidWidgetTypeError();
    return type;
  }

  equals(other: WidgetType): boolean {
    return this.value === other.value;
  }
}
```

**Portas Principais**:

```typescript
// domain/repositories/IDashboardRepository.ts
export interface IDashboardRepository {
  save(dashboard: Dashboard): Promise<void>;
  findById(id: DashboardId): Promise<Dashboard | null>;
  findByUserId(userId: UserId): Promise<Dashboard[]>;
  delete(id: DashboardId): Promise<void>;
}

// domain/repositories/IWidgetRepository.ts
export interface IWidgetRepository {
  save(widget: Widget): Promise<void>;
  findById(id: WidgetId): Promise<Widget | null>;
  findByDashboardId(dashboardId: DashboardId): Promise<Widget[]>;
  delete(id: WidgetId): Promise<void>;
}
```

#### Camada de Aplicacao

**Casos de Uso**:

```typescript
// application/use-cases/create-dashboard/CreateDashboardUseCase.ts
export class CreateDashboardUseCase {
  constructor(
    private dashboardRepository: IDashboardRepository,
    private authService: IAuthService // From 01_auth-profile
  ) {}

  async execute(input: CreateDashboardInput): Promise<CreateDashboardOutput> {
    // Validate user authenticated
    const user = await this.authService.getCurrentUser();
    if (!user) throw new UnauthorizedError();

    // Create dashboard
    const dashboard = Dashboard.create({
      userId: UserId.fromString(user.id),
      name: input.name,
      description: input.description,
    });

    // Persist
    await this.dashboardRepository.save(dashboard);

    return new CreateDashboardOutput({
      id: dashboard.id.getValue(),
      name: dashboard.name,
      description: dashboard.description,
    });
  }
}

// application/use-cases/add-widget/AddWidgetUseCase.ts
export class AddWidgetUseCase {
  constructor(
    private dashboardRepository: IDashboardRepository,
    private widgetRepository: IWidgetRepository
  ) {}

  async execute(input: AddWidgetInput): Promise<AddWidgetOutput> {
    // Load dashboard
    const dashboard = await this.dashboardRepository.findById(
      DashboardId.fromString(input.dashboardId)
    );
    if (!dashboard) throw new DashboardNotFoundError();

    // Create widget
    const widget = Widget.create({
      dashboardId: dashboard.id,
      title: input.title,
      type: WidgetType.fromString(input.type),
      config: input.config,
    });

    // Add to dashboard
    dashboard.addWidget(widget);

    // Persist both
    await this.widgetRepository.save(widget);
    await this.dashboardRepository.save(dashboard);

    return toDashboardOutput(dashboard);
  }
}
```

#### Test Strategy (TDD)

```typescript
// __tests__/unit/domain/entities/Dashboard.test.ts
describe('Dashboard Entity', () => {
  it('should create dashboard with valid data', async () => {
    const userId = UserId.fromString('550e8400-e29b-41d4-a716-446655440000');
    const dashboard = Dashboard.create({
      userId,
      name: 'My Dashboard',
      description: 'Dashboard description'
    });

    expect(dashboard.name).toBe('My Dashboard');
    expect(dashboard.getWidgets()).toHaveLength(0);
  });

  it('should add widget to dashboard', async () => {
    const dashboard = Dashboard.create({
      userId,
      name: 'My Dashboard',
      description: 'desc'
    });

    const widget = Widget.create({
      dashboardId: dashboard.id,
      title: 'Chart Widget',
      type: WidgetType.CHART,
      config: { datasource: 'api' }
    });

    dashboard.addWidget(widget);
    expect(dashboard.getWidgets()).toHaveLength(1);
  });

  it('should reject more than 10 widgets', async () => {
    const dashboard = Dashboard.create({...});

    for (let i = 0; i < 10; i++) {
      const widget = Widget.create({...});
      dashboard.addWidget(widget);
    }

    const extraWidget = Widget.create({...});
    expect(() => dashboard.addWidget(extraWidget))
      .toThrow(DashboardLimitExceededError);
  });
});

// __tests__/integration/repositories/PostgresDashboardRepository.test.ts
describe('PostgresDashboardRepository', () => {
  it('should persist and retrieve dashboard', async () => {
    const repository = new PostgresDashboardRepository(db);
    const dashboard = Dashboard.create({
      userId,
      name: 'Test Dashboard',
      description: 'desc'
    });

    await repository.save(dashboard);
    const retrieved = await repository.findById(dashboard.id);

    expect(retrieved).toBeDefined();
    expect(retrieved?.name).toBe('Test Dashboard');
  });
});

// __tests__/e2e/dashboard.spec.ts
describe('Dashboard E2E', () => {
  test('should create dashboard and add widget', async ({ page }) => {
    // Login
    const token = await login(page, 'test@example.com', 'SecurePass123!');

    // Create dashboard
    const dashResponse = await page.request.post('/api/dashboard', {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        name: 'E2E Dashboard',
        description: 'Testing dashboard'
      }
    });

    expect(dashResponse.status()).toBe(201);
    const dashboard = await dashResponse.json();
    const dashboardId = dashboard.id;

    // Add widget
    const widgetResponse = await page.request.post('/api/dashboard/:id/widgets', {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        title: 'Chart',
        type: 'CHART',
        config: { datasource: 'api' }
      }
    });

    expect(widgetResponse.status()).toBe(201);
    const widget = await widgetResponse.json();
    expect(widget.title).toBe('Chart');
  });
});
```

---

### Servico 02_projects

#### Camada de Dominio

**Entidades Principais**:

```typescript
// domain/entities/Project.ts
export class Project {
  private constructor(
    public readonly id: ProjectId,
    public name: ProjectName,
    public description: string,
    public readonly owner: UserId,
    private members: ProjectMember[],
    public status: ProjectStatus,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  static create(props: { name: ProjectName; description: string; owner: UserId }): Project {
    const project = new Project(
      ProjectId.generate(),
      props.name,
      props.description,
      props.owner,
      [],
      ProjectStatus.DRAFT,
      new Date(),
      new Date()
    );

    // Owner is always added as member
    project.addMember(props.owner, MemberRole.OWNER);
    return project;
  }

  addMember(userId: UserId, role: MemberRole): void {
    if (this.members.some((m) => m.userId.equals(userId))) {
      throw new UserAlreadyMemberError();
    }

    const member = ProjectMember.create({
      projectId: this.id,
      userId,
      role,
    });

    this.members.push(member);
  }

  removeMember(userId: UserId): void {
    if (this.owner.equals(userId)) {
      throw new CannotRemoveOwnerError();
    }

    this.members = this.members.filter((m) => !m.userId.equals(userId));
  }

  canUserEdit(userId: UserId): boolean {
    const member = this.members.find((m) => m.userId.equals(userId));
    return member?.isEditor() ?? false;
  }

  getMembers(): ProjectMember[] {
    return [...this.members];
  }

  transitionStatus(newStatus: ProjectStatus): void {
    // Business logic: validate state transitions
    const validTransitions: Record<string, ProjectStatus[]> = {
      [ProjectStatus.DRAFT]: [ProjectStatus.ACTIVE],
      [ProjectStatus.ACTIVE]: [ProjectStatus.COMPLETED, ProjectStatus.DRAFT],
      [ProjectStatus.COMPLETED]: [],
    };

    if (!validTransitions[this.status.value].includes(newStatus)) {
      throw new InvalidStatusTransitionError();
    }

    this.status = newStatus;
    this.updatedAt = new Date();
  }
}

// domain/entities/ProjectMember.ts
export class ProjectMember {
  private constructor(
    public readonly id: ProjectMemberId,
    public readonly projectId: ProjectId,
    public readonly userId: UserId,
    public role: MemberRole,
    public readonly joinedAt: Date
  ) {}

  static create(props: { projectId: ProjectId; userId: UserId; role: MemberRole }): ProjectMember {
    return new ProjectMember(
      ProjectMemberId.generate(),
      props.projectId,
      props.userId,
      props.role,
      new Date()
    );
  }

  isEditor(): boolean {
    return this.role.equals(MemberRole.EDITOR) || this.role.equals(MemberRole.OWNER);
  }

  isOwner(): boolean {
    return this.role.equals(MemberRole.OWNER);
  }
}
```

**Value Objects Principais**:

```typescript
// domain/value-objects/ProjectName.ts
export class ProjectName {
  private constructor(private value: string) {
    if (!value || value.trim().length === 0) {
      throw new InvalidProjectNameError('Name cannot be empty');
    }
    if (value.length > 100) {
      throw new InvalidProjectNameError('Name must be <= 100 chars');
    }
  }

  static create(value: string): ProjectName {
    return new ProjectName(value.trim());
  }

  getValue(): string {
    return this.value;
  }

  equals(other: ProjectName): boolean {
    return this.value === other.value;
  }
}

// domain/value-objects/ProjectStatus.ts
export class ProjectStatus {
  static DRAFT = new ProjectStatus('DRAFT');
  static ACTIVE = new ProjectStatus('ACTIVE');
  static COMPLETED = new ProjectStatus('COMPLETED');

  private constructor(public readonly value: string) {}

  static fromString(value: string): ProjectStatus {
    const statuses = [ProjectStatus.DRAFT, ProjectStatus.ACTIVE, ProjectStatus.COMPLETED];
    const status = statuses.find((s) => s.value === value);
    if (!status) throw new InvalidProjectStatusError();
    return status;
  }

  equals(other: ProjectStatus): boolean {
    return this.value === other.value;
  }
}

// domain/value-objects/MemberRole.ts
export class MemberRole {
  static OWNER = new MemberRole('OWNER');
  static EDITOR = new MemberRole('EDITOR');
  static VIEWER = new MemberRole('VIEWER');

  private constructor(public readonly value: string) {}

  static fromString(value: string): MemberRole {
    const roles = [MemberRole.OWNER, MemberRole.EDITOR, MemberRole.VIEWER];
    const role = roles.find((r) => r.value === value);
    if (!role) throw new InvalidMemberRoleError();
    return role;
  }

  equals(other: MemberRole): boolean {
    return this.value === other.value;
  }
}
```

**Portas Principais**:

```typescript
// domain/repositories/IProjectRepository.ts
export interface IProjectRepository {
  save(project: Project): Promise<void>;
  findById(id: ProjectId): Promise<Project | null>;
  findByOwnerId(userId: UserId): Promise<Project[]>;
  findByMemberId(userId: UserId): Promise<Project[]>;
  delete(id: ProjectId): Promise<void>;
}

// domain/repositories/IProjectMemberRepository.ts
export interface IProjectMemberRepository {
  save(member: ProjectMember): Promise<void>;
  findById(id: ProjectMemberId): Promise<ProjectMember | null>;
  findByProjectId(projectId: ProjectId): Promise<ProjectMember[]>;
  findByUserId(userId: UserId): Promise<ProjectMember[]>;
  delete(id: ProjectMemberId): Promise<void>;
}
```

#### Camada de Aplicacao

**Casos de Uso**:

```typescript
// application/use-cases/create-project/CreateProjectUseCase.ts
export class CreateProjectUseCase {
  constructor(private projectRepository: IProjectRepository) {}

  async execute(input: CreateProjectInput): Promise<CreateProjectOutput> {
    const ownerUserId = UserId.fromString(input.userId);
    const projectName = ProjectName.create(input.name);

    const project = Project.create({
      name: projectName,
      description: input.description,
      owner: ownerUserId,
    });

    await this.projectRepository.save(project);

    return new CreateProjectOutput({
      id: project.id.getValue(),
      name: project.name.getValue(),
      description: project.description,
      owner: project.owner.getValue(),
      status: project.status.value,
      members: project.getMembers().map((m) => ({
        userId: m.userId.getValue(),
        role: m.role.value,
      })),
    });
  }
}

// application/use-cases/add-member/AddMemberUseCase.ts
export class AddMemberUseCase {
  constructor(
    private projectRepository: IProjectRepository,
    private memberRepository: IProjectMemberRepository
  ) {}

  async execute(input: AddMemberInput): Promise<void> {
    const project = await this.projectRepository.findById(ProjectId.fromString(input.projectId));
    if (!project) throw new ProjectNotFoundError();

    // Only owner can add members
    if (!project.owner.equals(UserId.fromString(input.requestingUserId))) {
      throw new UnauthorizedError('Only project owner can add members');
    }

    const member = ProjectMember.create({
      projectId: project.id,
      userId: UserId.fromString(input.userId),
      role: MemberRole.fromString(input.role),
    });

    project.addMember(member.userId, member.role);

    await this.memberRepository.save(member);
    await this.projectRepository.save(project);
  }
}
```

---

## Roteiro de Implementacao

### Etapa 1: Camada de Dominio (1-2 semanas)

1. **Identificar Entidades**: Quais sao os conceitos centrais de negocio?
2. **Definir Value Objects**: Quais objetos imutaveis e validados precisamos?
3. **Projetar Repositorios**: Quais operacoes de persistencia sao necessarias?
4. **Criar Erros**: Quais erros especificos de dominio podem ocorrer?
5. **Escrever Testes**: TDD - testes antes da implementacao

**Entregas**: Camada de dominio completa com 60+ testes unitarios

### Etapa 2: Camada de Infraestrutura (1 semana)

1. **Implementar Repositorios**: Persistir entidades
2. **Criar Adapters**: Integracoes externas (APIs, bancos de dados)
3. **Configurar DI**: Configurar dependencias
4. **Escrever Testes de Integracao**: Testar adapters com recursos reais/mock

**Entregas**: Camada de infraestrutura completa com 30+ testes de integracao

### Etapa 3: Camada de Aplicacao (1 semana)

1. **Criar Casos de Uso**: Orquestrar dominio + infraestrutura
2. **Projetar DTOs**: Contratos de entrada/saida
3. **Implementar Mappers**: Conversao Entidade → DTO
4. **Escrever Testes**: Validacao dos casos de uso

**Entregas**: Camada de aplicacao completa com 40+ testes

### Etapa 4: Camada de Apresentacao (1 semana)

1. **Criar Handlers**: Orquestracao de requisicoes HTTP
2. **Configurar Rotas**: Rotas de API do SvelteKit
3. **Implementar Middleware**: Autenticacao, autorizacao
4. **Mapeamento de Erros**: Erros de dominio → respostas HTTP

**Entregas**: Camada de apresentacao completa com 40+ testes

### Etapa 5: Testes E2E (1 semana)

1. **Configurar Playwright**: Configuracao e fixtures
2. **Escrever Fluxos**: Fluxos completos de usuario
3. **Testes de Seguranca**: Autenticacao, autorizacao
4. **Testes de Integracao**: Chamadas entre servicos

**Entregas**: Suite de testes E2E completa com 20+ testes

### Esforco Total: ~5-6 semanas por servico

---

## Script de Geracao de Codigo

Para acelerar o scaffolding, crie:

```bash
#!/bin/bash
# scripts/generate-service.sh

SERVICE_NAME=$1
SERVICE_DESC=$2

echo "Generating service: $SERVICE_NAME - $SERVICE_DESC"

# Create directories
mkdir -p packages/$SERVICE_NAME/src/{domain,application,infrastructure,presentation}/__tests__
mkdir -p packages/$SERVICE_NAME/src/domain/{entities,value-objects,services,repositories,errors}
mkdir -p packages/$SERVICE_NAME/src/application/{use-cases,dto/mappers,ports}
mkdir -p packages/$SERVICE_NAME/src/infrastructure/{adapters,config}
mkdir -p packages/$SERVICE_NAME/src/presentation/{handlers,middleware,routes/api,errors}

# Generate boilerplate files...
# (Copy from template files)

echo "✅ Service generated: $SERVICE_NAME"
```

---

## Padroes Reutilizaveis

### 1. Padrao Entity Factory

```typescript
export class Entity {
  private constructor(...props) {}

  // Criar nova instancia com validacao
  static create(props: CreateProps): Entity {
    // Validar
    // Retornar nova instancia
  }

  // Reconstruir a partir do BD
  static reconstruct(props: DBProps): Entity {
    // Retornar nova instancia a partir dos dados do BD
  }

  // Metodos de negocio...
}
```

### 2. Padrao Value Object

```typescript
export class ValueObject {
  private constructor(value: string) {
    ValueObject.validate(value);
    this.value = value;
  }

  static create(value: string): ValueObject {
    return new ValueObject(value);
  }

  static fromString(value: string): ValueObject {
    return new ValueObject(value);
  }

  private static validate(value: string): void {
    // Lancar erro especifico se invalido
  }

  getValue(): string {
    return this.value;
  }

  equals(other: ValueObject): boolean {
    return this.value === other.value;
  }
}
```

### 3. Padrao de Porta de Repositorio

```typescript
export interface IRepository {
  save(entity: Entity): Promise<void>;
  findById(id: EntityId): Promise<Entity | null>;
  findBy(criteria: SearchCriteria): Promise<Entity[]>;
  delete(id: EntityId): Promise<void>;
}
```

### 4. Padrao de Caso de Uso

```typescript
export class UseCase {
  constructor(
    private repository: IRepository,
    private dependency: IDependency
  ) {}

  async execute(input: Input): Promise<Output> {
    // 1. Validar entrada
    // 2. Carregar entidades
    // 3. Executar logica de dominio
    // 4. Persistir alteracoes
    // 5. Retornar saida
  }
}
```

### 5. Padrao de Handler

```typescript
export class Handler {
  async handle(request: Request): Promise<Response> {
    try {
      // 1. Extrair e validar requisicao
      // 2. Chamar caso de uso
      // 3. Retornar resposta formatada
    } catch (error) {
      return ErrorMapper.toHttpResponse(error);
    }
  }
}
```

### 6. Padrao de Mapeamento de Erros

```typescript
export class ErrorMapper {
  static toHttpResponse(error: unknown): HttpResponse {
    if (error instanceof DomainError) {
      return this.mapDomainError(error);
    }
    return this.mapUnknownError(error);
  }

  private static mapDomainError(error: DomainError): HttpResponse {
    const mapping: Record<string, number> = {
      InvalidEmailError: 400,
      UserNotFoundError: 404,
      UnauthorizedError: 401,
    };

    return {
      status: mapping[error.constructor.name] || 500,
      body: { error: error.message, code: error.code },
    };
  }
}
```

---

## Estratégia de Testes

Cada serviço deve ter:

### Testes Unitários (60%+)

- Camada de domínio (entidades, value objects, erros)
- Camada de aplicação (use cases, DTOs)
- Utilitários e helpers

### Testes de Integração (20%+)

- Adaptadores de infraestrutura
- Implementações de repositório
- Integrações com serviços externos

### Testes E2E (15%+)

- Fluxos completos do usuário
- Contratos de API
- Comunicação entre serviços

### Cobertura Total: 80%+

```bash
# Rodar todos os testes
npm run test --workspaces

# Rodar com cobertura
npm run test -- --coverage

# Rodar testes E2E
npm run test:e2e --workspaces
```

---

## Checklist para Cada Servico

### Antes de Comecar

- [ ] Entendimento claro do dominio
- [ ] Entidades principais identificadas
- [ ] Value objects projetados
- [ ] Use cases listados
- [ ] Contratos de API esbocados

### Camada de Dominio

- [ ] Entidades criadas com factories
- [ ] Value objects com validacao
- [ ] Ports de repositorio definidos
- [ ] Hierarquia de erros de dominio
- [ ] 60+ testes unitarios passando
- [ ] Sem imports de infraestrutura
- [ ] Logica de negocio isolada

### Camada de Infraestrutura

- [ ] Adaptadores de repositorio implementados
- [ ] Integracoes com banco/API
- [ ] Injecao de dependencia configurada
- [ ] 30+ testes de integracao
- [ ] Adaptadores substituiveis (suporte a mock)

### Camada de Aplicacao

- [ ] Use cases implementados
- [ ] DTOs projetados
- [ ] Mappers criados
- [ ] 40+ testes de use case
- [ ] Orquestracao clara
- [ ] Sem logica de negocio nos adaptadores

### Camada de Apresentacao

- [ ] Handlers HTTP criados
- [ ] Rotas SvelteKit configuradas
- [ ] Mapeamento de erros funcionando
- [ ] Autenticacao/autorizacao aplicada
- [ ] 40+ testes de apresentacao
- [ ] CORS configurado

### Testes E2E

- [ ] 20+ testes E2E
- [ ] Cenarios de caminho feliz
- [ ] Cenarios de erro
- [ ] Verificacoes de seguranca
- [ ] Pronto para CI/CD
- [ ] Documentacao completa

---

## Criterios de Sucesso

- **100% do checklist acima completado**
- **Todos os testes passando (unitario + integracao + E2E)**
- **80%+ de cobertura de codigo**
- **Arquitetura segue o template**
- **Documentacao completa**
- **Pronto para deploy em producao**

---

## Recursos

### Do 01_auth-profile (Template)

- Camada de dominio: `packages/01_auth-profile/src/domain/`
- Infraestrutura: `packages/01_auth-profile/src/infrastructure/`
- Aplicacao: `packages/01_auth-profile/src/application/`
- Apresentacao: `packages/01_auth-profile/src/presentation/`
- Testes E2E: `packages/01_auth-profile/src/__tests__/e2e/`

### Documentacao

- `REFACTORING_COMPLETION.md` - Detalhes completos da refatoracao, incluindo resumos de todas as fases (Domain, Infrastructure, Application, Presentation, E2E)

### Ferramentas e Comandos

```bash
# Gerar novo servico
./scripts/generate-service.sh 04_novo-servico "Descricao do Servico"

# Rodar testes
npm run test --workspaces
npm run test:e2e --workspaces

# Cobertura de codigo
npm run test -- --coverage

# Lint e formatacao
npm run lint --workspaces
npm run format --workspaces
```

---

## Estimativa de Tempo

| Fase           | 00_dashboard    | 02_projects     |
| -------------- | --------------- | --------------- |
| Dominio        | 1-2 semanas     | 1-2 semanas     |
| Infraestrutura | 1 semana        | 1 semana        |
| Aplicacao      | 1 semana        | 1 semana        |
| Apresentacao   | 1 semana        | 1 semana        |
| Testes E2E     | 1 semana        | 1 semana        |
| **Total**      | **5-6 semanas** | **5-6 semanas** |

**Total para ambos os servicos: 10-12 semanas**

---

## Conclusao

Seguindo este template e padrao, e possivel implementar consistentemente:

- **Arquitetura Hexagonal** em todos os servicos
- Principios de **Domain-Driven Design**
- Padroes de **Clean Code**
- **Testes Abrangentes** (TDD)
- **Praticas Profissionais** (DoD, DoR)

Isso garante **consistencia, manutenibilidade e qualidade** em todo o monorepo OUTE.

---

**Versao do Template**: 1.0
**Baseado em**: implementacao do 01_auth-profile
**Status**: Pronto para aplicacao
