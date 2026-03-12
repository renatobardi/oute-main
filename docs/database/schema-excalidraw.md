# OUTE Database - Diagramas Mermaid para Excalidraw

> 8 diagramas separados por bounded context para importar no Excalidraw.
> **Como importar**: Menu > Insert > Mermaid > colar o diagrama desejado.
> Diagramas menores renderizam melhor no Excalidraw do que um unico diagrama gigante.

---

## 1. Identidade & Acesso (IAM)

```mermaid
erDiagram
    users {
        uuid id PK
        varchar email UK
        varchar password_hash
        varchar name
        varchar avatar_url
        timestamptz last_login_at
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }

    organizations {
        uuid id PK
        varchar name
        varchar slug UK
        varchar logo_url
        jsonb settings
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }

    organization_members {
        uuid id PK
        uuid organization_id FK
        uuid user_id FK
        varchar role
        timestamptz joined_at
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }

    refresh_tokens {
        uuid id PK
        uuid user_id FK
        varchar token_hash UK
        varchar device_info
        timestamptz expires_at
        boolean revoked
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }

    users ||--o{ organization_members : "possui membros"
    organizations ||--o{ organization_members : "possui membros"
    users ||--o{ refresh_tokens : "possui tokens"
```

---

## 2. Gestao de Projetos

```mermaid
erDiagram
    projects {
        uuid id PK
        uuid organization_id FK
        uuid created_by FK
        varchar code UK
        varchar name
        text description
        varchar status
        varchar type
        integer progress_percent
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }

    project_members {
        uuid id PK
        uuid project_id FK
        uuid user_id FK
        varchar role
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }

    tags {
        uuid id PK
        uuid organization_id FK
        varchar name UK
        varchar color
        varchar category
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }

    project_tags {
        uuid id PK
        uuid project_id FK
        uuid tag_id FK
        timestamptz created_at
    }

    projects ||--o{ project_members : "possui membros"
    projects ||--o{ project_tags : "marcado com"
    tags ||--o{ project_tags : "aplicado a"
```

---

## 3. Entrevista & Chat

```mermaid
erDiagram
    interviews {
        uuid id PK
        uuid project_id FK
        uuid conducted_by FK
        varchar title
        varchar status
        varchar interview_code
        integer total_messages
        timestamptz started_at
        timestamptz completed_at
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }

    messages {
        uuid id PK
        uuid interview_id FK
        uuid user_id FK
        varchar sender
        varchar type
        text content
        jsonb metadata
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }

    interview_notes {
        uuid id PK
        uuid interview_id FK
        uuid last_edited_by FK
        text summary
        text content
        jsonb metrics
        jsonb tags_snapshot
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }

    interviews ||--o{ messages : "contem"
    interviews ||--|| interview_notes : "possui notas"
```

---

## 4. Motor de Templates SDLC

```mermaid
erDiagram
    sdlc_templates {
        uuid id PK
        varchar version UK
        varchar name
        text description
        boolean is_active
        integer total_milestones
        integer total_epics
        integer total_issues
        timestamptz published_at
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }

    template_milestones {
        uuid id PK
        uuid template_id FK
        integer sort_order
        varchar code
        varchar name
        text objective
        jsonb applicability_tags
        boolean is_required
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }

    template_epics {
        uuid id PK
        uuid milestone_id FK
        integer sort_order
        varchar name
        text description
        jsonb applicability_tags
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }

    template_issues {
        uuid id PK
        uuid epic_id FK
        uuid parent_issue_id FK
        integer sort_order
        varchar name
        text how_to_fill
        text description_template
        jsonb applicability_tags
        jsonb metadata
        integer depth
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }

    template_checklist_items {
        uuid id PK
        uuid issue_id FK
        integer sort_order
        text label
        boolean is_critical
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }

    sdlc_templates ||--o{ template_milestones : "possui milestones"
    template_milestones ||--o{ template_epics : "possui epics"
    template_epics ||--o{ template_issues : "possui issues"
    template_issues ||--o{ template_issues : "possui sub-issues"
    template_issues ||--o{ template_checklist_items : "possui checklist"
```

---

## 5. Motor de Estimativas

```mermaid
erDiagram
    estimation_sessions {
        uuid id PK
        uuid project_id FK
        uuid template_id FK
        uuid started_by FK
        varchar status
        integer overall_progress
        jsonb config
        timestamptz started_at
        timestamptz completed_at
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }

    estimation_milestone_statuses {
        uuid id PK
        uuid session_id FK
        uuid milestone_id FK
        varchar status
        text skip_reason
        varchar reviewer_verdict
        uuid reviewed_by FK
        integer progress_percent
        timestamptz started_at
        timestamptz completed_at
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }

    estimation_responses {
        uuid id PK
        uuid session_id FK
        uuid issue_id FK
        uuid answered_by FK
        text answer
        jsonb structured_data
        boolean is_complete
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }

    estimation_checklist_results {
        uuid id PK
        uuid session_id FK
        uuid checklist_item_id FK
        boolean is_checked
        text note
        uuid checked_by FK
        timestamptz checked_at
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }

    estimation_outputs {
        uuid id PK
        uuid session_id FK
        varchar output_type
        jsonb result
        jsonb architecture_decisions
        jsonb compliance_summary
        integer confidence_score
        integer estimated_hours_min
        integer estimated_hours_max
        integer estimated_budget_min
        integer estimated_budget_max
        varchar currency
        timestamptz generated_at
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }

    estimation_sessions ||--o{ estimation_milestone_statuses : "rastreia milestones"
    estimation_sessions ||--o{ estimation_responses : "coleta respostas"
    estimation_sessions ||--o{ estimation_checklist_results : "verifica itens"
    estimation_sessions ||--o{ estimation_outputs : "gera"
```

---

## 6. Integracoes

```mermaid
erDiagram
    integration_connections {
        uuid id PK
        uuid organization_id FK
        uuid created_by FK
        varchar provider
        varchar name
        jsonb credentials_encrypted
        jsonb config
        boolean is_active
        timestamptz last_synced_at
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }

    export_sessions {
        uuid id PK
        uuid estimation_session_id FK
        uuid integration_connection_id FK
        uuid triggered_by FK
        varchar status
        integer items_total
        integer items_exported
        jsonb error_log
        jsonb export_config
        timestamptz started_at
        timestamptz completed_at
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }

    export_mappings {
        uuid id PK
        uuid export_session_id FK
        varchar internal_entity_type
        uuid internal_entity_id
        varchar external_entity_type
        varchar external_entity_id
        varchar external_url
        jsonb sync_metadata
        timestamptz last_synced_at
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }

    integration_connections ||--o{ export_sessions : "usado por"
    export_sessions ||--o{ export_mappings : "mapeia entidades"
```

---

## 7. Auditoria

```mermaid
erDiagram
    audit_log {
        uuid id PK
        uuid organization_id FK
        uuid user_id FK
        varchar entity_type
        uuid entity_id
        varchar action
        jsonb old_values
        jsonb new_values
        varchar ip_address
        varchar user_agent
        timestamptz created_at
    }
```

---

## 8. Relacionamentos entre Contextos

> Diagrama mostrando como os bounded contexts se conectam entre si.
> Tabelas simplificadas (apenas PK/FK) para foco nos relacionamentos.

```mermaid
erDiagram
    users {
        uuid id PK
    }

    organizations {
        uuid id PK
    }

    projects {
        uuid id PK
        uuid organization_id FK
        uuid created_by FK
    }

    interviews {
        uuid id PK
        uuid project_id FK
        uuid conducted_by FK
    }

    sdlc_templates {
        uuid id PK
    }

    estimation_sessions {
        uuid id PK
        uuid project_id FK
        uuid template_id FK
        uuid started_by FK
    }

    integration_connections {
        uuid id PK
        uuid organization_id FK
        uuid created_by FK
    }

    export_sessions {
        uuid id PK
        uuid estimation_session_id FK
        uuid integration_connection_id FK
        uuid triggered_by FK
    }

    audit_log {
        uuid id PK
        uuid organization_id FK
        uuid user_id FK
    }

    %% Usuario eh o ator central
    users ||--o{ projects : "cria"
    users ||--o{ interviews : "conduz"
    users ||--o{ estimation_sessions : "inicia"
    users ||--o{ integration_connections : "configura"
    users ||--o{ export_sessions : "aciona"
    users ||--o{ audit_log : "realizado por"

    %% Org define o escopo de tudo
    organizations ||--o{ projects : "possui"
    organizations ||--o{ integration_connections : "conecta"
    organizations ||--o{ audit_log : "auditado"

    %% Fluxo principal: Projeto -> Entrevista -> Estimativa -> Exportacao
    projects ||--o{ interviews : "possui entrevistas"
    projects ||--o{ estimation_sessions : "estimado via"
    sdlc_templates ||--o{ estimation_sessions : "usa template"
    estimation_sessions ||--o{ export_sessions : "exportado via"
    integration_connections ||--o{ export_sessions : "usado por"
```
