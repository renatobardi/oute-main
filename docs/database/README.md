# OUTE Database Schema

> Documentacao completa do schema de banco de dados da plataforma OUTE.
> PostgreSQL 15 | 25 tabelas | 7 bounded contexts
> 12 arquivos de migracao (001-012) em `database/migrations/`

---

## Arquivos

| # | Arquivo | Descricao |
|---|---------|-----------|
| 1 | [schema.dbml](./schema.dbml) | Schema DBML completo - tabelas, refs, indexes, enums, TableGroups |
| 2 | [schema-er-diagram.md](./schema-er-diagram.md) | Diagrama ER Mermaid completo (todas as 25 tabelas) |
| 3 | [schema-excalidraw.md](./schema-excalidraw.md) | 8 diagramas Mermaid separados por contexto (para import no Excalidraw) |
| 4 | [architecture-decisions.md](./architecture-decisions.md) | Decisoes arquiteturais: performance, JSONB, indexes, tenancy |

---

## Bounded Contexts

```
┌─────────────┬──────────────┬──────────────┬────────────────────────────┐
│  1. IAM     │ 2. PROJECT   │ 3. INTERVIEW │ 4. TEMPLATE ENGINE         │
│  (4 tables) │  (4 tables)  │  (3 tables)  │  (5 tables)                │
│             │              │              │                            │
│ users       │ projects     │ interviews   │ sdlc_templates             │
│ orgs        │ proj_members │ messages     │ template_milestones (14)   │
│ org_members │ tags         │ int_notes    │ template_epics (40+)       │
│ refresh_tok │ project_tags │              │ template_issues (80+)      │
│             │              │              │ template_checklist_items    │
├─────────────┴──────────────┴──────────────┼────────────────────────────┤
│  5. ESTIMATION ENGINE (5 tables)          │ 6. INTEGRATIONS (3 tables) │
│                                           │                            │
│ estimation_sessions                       │ integration_connections     │
│ estimation_milestone_statuses             │ export_sessions             │
│ estimation_responses                      │ export_mappings             │
│ estimation_checklist_results              │                            │
│ estimation_outputs                        │                            │
├───────────────────────────────────────────┴────────────────────────────┤
│  7. AUDIT (1 table)                                                    │
│                                                                        │
│ audit_log (append-only, immutable)                                     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Como Usar

### Visualizar no dbdiagram.io
1. Abrir [dbdiagram.io](https://dbdiagram.io)
2. Colar o conteudo de `schema.dbml`
3. O diagrama ER eh gerado automaticamente

### Visualizar no Excalidraw
1. Abrir [excalidraw.com](https://excalidraw.com)
2. Menu > Insert > Mermaid
3. Colar um dos 8 diagramas de `schema-excalidraw.md`
4. Repetir para cada bounded context

### Visualizar no GitHub
Os arquivos `.md` com blocos Mermaid renderizam automaticamente no GitHub.

---

## Stack

- **Database**: PostgreSQL 15
- **PKs**: UUID v7 (time-ordered)
- **Soft Deletes**: `deleted_at` em todas as tabelas (exceto audit_log)
- **Metadados**: JSONB para dados variaveis
- **Tenancy**: Organizations (row-level isolation)
