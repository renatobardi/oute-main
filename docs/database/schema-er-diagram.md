# OUTE Database - Diagrama de Entidade-Relacionamento

> Diagrama ER completo em Mermaid para todas as 25 tabelas em 7 bounded contexts.
> Cole em qualquer renderizador compativel com Mermaid (GitHub, dbdocs, mermaid.live).

```mermaid
erDiagram
    %% ═══════════════════════════════════════
    %% BOUNDED CONTEXT 1: Identidade & Acesso
    %% ═══════════════════════════════════════

    users {
        uuid id PK "UUID v7"
        varchar email UK "RFC 5322, lowercase"
        varchar password_hash "bcrypt"
        varchar name "1-255 chars"
        varchar avatar_url "nullable"
        timestamptz last_login_at "nullable"
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at "soft delete"
    }

    organizations {
        uuid id PK "UUID v7"
        varchar name "1-255 chars"
        varchar slug UK "URL-friendly"
        varchar logo_url "nullable"
        jsonb settings "preferencias da org"
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at "soft delete"
    }

    organization_members {
        uuid id PK "UUID v7"
        uuid organization_id FK
        uuid user_id FK
        user_role role "owner/admin/member/viewer"
        timestamptz joined_at
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at "soft delete"
    }

    refresh_tokens {
        uuid id PK "UUID v7"
        uuid user_id FK
        varchar token_hash UK "hash SHA-256"
        varchar device_info "nullable"
        timestamptz expires_at
        boolean revoked "default false"
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at "soft delete"
    }

    %% ═══════════════════════════════════════
    %% BOUNDED CONTEXT 2: Gestao de Projetos
    %% ═══════════════════════════════════════

    projects {
        uuid id PK "UUID v7"
        uuid organization_id FK
        uuid created_by FK "usuario que criou"
        varchar code UK "OUT-101, OUT-102..."
        varchar name "1-255 chars"
        text description "nullable"
        project_status status "draft/active/archived"
        project_type type "greenfield/brownfield"
        integer progress_percent "0-100"
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at "soft delete"
    }

    project_members {
        uuid id PK "UUID v7"
        uuid project_id FK
        uuid user_id FK
        varchar role "lead/architect/developer/viewer"
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at "soft delete"
    }

    tags {
        uuid id PK "UUID v7"
        uuid organization_id FK
        varchar name UK "unico por org"
        varchar color "cor hexadecimal"
        varchar category "nullable: tech/maturity/custom"
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at "soft delete"
    }

    project_tags {
        uuid id PK "UUID v7"
        uuid project_id FK
        uuid tag_id FK
        timestamptz created_at
    }

    %% ═══════════════════════════════════════
    %% BOUNDED CONTEXT 3: Entrevista & Chat
    %% ═══════════════════════════════════════

    interviews {
        uuid id PK "UUID v7"
        uuid project_id FK
        uuid conducted_by FK "user_id"
        varchar title "1-255 chars"
        interview_status status "scheduled/in_progress/completed/cancelled"
        varchar interview_code "INT-2024-XXX"
        integer total_messages "cache de contagem"
        timestamptz started_at "nullable"
        timestamptz completed_at "nullable"
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at "soft delete"
    }

    messages {
        uuid id PK "UUID v7"
        uuid interview_id FK
        uuid user_id FK "nullable - null para msgs de IA"
        message_sender sender "user/ai/system"
        message_type type "text/code/image"
        text content "corpo da mensagem"
        jsonb metadata "nullable: modelo, tokens, refs"
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at "soft delete"
    }

    interview_notes {
        uuid id PK "UUID v7"
        uuid interview_id FK "um-para-um"
        uuid last_edited_by FK "user_id"
        text summary "nullable"
        text content "notas em rich text"
        jsonb metrics "progresso/horas/orcamento"
        jsonb tags_snapshot "tags no momento da nota"
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at "soft delete"
    }

    %% ═══════════════════════════════════════
    %% BOUNDED CONTEXT 4: Motor de Templates SDLC
    %% ═══════════════════════════════════════

    sdlc_templates {
        uuid id PK "UUID v7"
        varchar version UK "v4.0, v5.0"
        varchar name "Universal Software Template"
        text description "nullable"
        boolean is_active "default atual"
        integer total_milestones "14 (Phase0+M1-M13)"
        integer total_epics "40+"
        integer total_issues "80+"
        timestamptz published_at
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at "soft delete"
    }

    template_milestones {
        uuid id PK "UUID v7"
        uuid template_id FK
        integer sort_order "0-13"
        varchar code "PHASE-0, M1, M2..."
        varchar name "Governance, Discovery..."
        text objective "objetivo do milestone"
        jsonb applicability_tags "WEB/MOBILE/DATA/AI..."
        boolean is_required "obrigatorio ou opcional"
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at "soft delete"
    }

    template_epics {
        uuid id PK "UUID v7"
        uuid milestone_id FK
        integer sort_order
        varchar name "Regulatory Assessment..."
        text description "nullable"
        jsonb applicability_tags "ENTERPRISE/STARTUP..."
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at "soft delete"
    }

    template_issues {
        uuid id PK "UUID v7"
        uuid epic_id FK
        uuid parent_issue_id FK "nullable - sub-issues"
        integer sort_order
        varchar name "GDPR Compliance..."
        text how_to_fill "instrucoes"
        text description_template "template markdown"
        jsonb applicability_tags "array de tags"
        jsonb metadata "config extra"
        integer depth "0=issue, 1=sub-issue"
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at "soft delete"
    }

    template_checklist_items {
        uuid id PK "UUID v7"
        uuid issue_id FK
        integer sort_order
        text label "texto do checklist"
        boolean is_critical "bloqueia progresso?"
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at "soft delete"
    }

    %% ═══════════════════════════════════════
    %% BOUNDED CONTEXT 5: Motor de Estimativas
    %% ═══════════════════════════════════════

    estimation_sessions {
        uuid id PK "UUID v7"
        uuid project_id FK
        uuid template_id FK "versao fixada"
        uuid started_by FK "user_id"
        varchar status "draft/in_progress/completed/abandoned"
        integer overall_progress "0-100"
        jsonb config "tags selecionadas, tipo de projeto"
        timestamptz started_at "nullable"
        timestamptz completed_at "nullable"
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at "soft delete"
    }

    estimation_milestone_statuses {
        uuid id PK "UUID v7"
        uuid session_id FK
        uuid milestone_id FK "template_milestones"
        milestone_tracking_status status "pending/in_progress/completed/skipped/needs_revisit/not_applicable"
        text skip_reason "nullable - motivo do skip"
        varchar reviewer_verdict "nullable: confirmed_skip/must_revisit/not_needed"
        uuid reviewed_by FK "nullable - IA ou usuario"
        integer progress_percent "0-100"
        timestamptz started_at "nullable"
        timestamptz completed_at "nullable"
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at "soft delete"
    }

    estimation_responses {
        uuid id PK "UUID v7"
        uuid session_id FK
        uuid issue_id FK "template_issues"
        uuid answered_by FK "user_id"
        text answer "texto da resposta do usuario"
        jsonb structured_data "nullable - dados parseados"
        boolean is_complete "todos os campos obrigatorios preenchidos"
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at "soft delete"
    }

    estimation_checklist_results {
        uuid id PK "UUID v7"
        uuid session_id FK
        uuid checklist_item_id FK "template_checklist_items"
        boolean is_checked "true/false"
        text note "nullable - comentario do usuario"
        uuid checked_by FK "user_id"
        timestamptz checked_at "nullable"
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at "soft delete"
    }

    estimation_outputs {
        uuid id PK "UUID v7"
        uuid session_id FK
        varchar output_type "summary/detailed/executive"
        jsonb result "horas/orcamento/decisoes/recomendacoes"
        jsonb architecture_decisions "stack de tecnologia, patterns"
        jsonb compliance_summary "checklist regulatorio"
        integer confidence_score "0-100"
        integer estimated_hours_min "nullable"
        integer estimated_hours_max "nullable"
        integer estimated_budget_min "nullable"
        integer estimated_budget_max "nullable"
        varchar currency "BRL/USD/EUR"
        timestamptz generated_at
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at "soft delete"
    }

    %% ═══════════════════════════════════════
    %% BOUNDED CONTEXT 6: Integracoes
    %% ═══════════════════════════════════════

    integration_connections {
        uuid id PK "UUID v7"
        uuid organization_id FK
        uuid created_by FK "user_id"
        integration_provider provider "linear/jira/asana/github/gitlab"
        varchar name "My Linear Workspace"
        jsonb credentials_encrypted "Chaves de API, tokens (criptografados)"
        jsonb config "IDs de workspace, chaves de projeto"
        boolean is_active "habilitado/desabilitado"
        timestamptz last_synced_at "nullable"
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at "soft delete"
    }

    export_sessions {
        uuid id PK "UUID v7"
        uuid estimation_session_id FK
        uuid integration_connection_id FK
        uuid triggered_by FK "user_id"
        export_status status "pending/in_progress/completed/failed"
        integer items_total "total de itens para exportar"
        integer items_exported "itens exportados com sucesso"
        jsonb error_log "nullable - detalhes de falha"
        jsonb export_config "o que exportar, regras de mapeamento"
        timestamptz started_at "nullable"
        timestamptz completed_at "nullable"
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at "soft delete"
    }

    export_mappings {
        uuid id PK "UUID v7"
        uuid export_session_id FK
        varchar internal_entity_type "milestone/epic/issue/checklist"
        uuid internal_entity_id "ref para entidade do template"
        varchar external_entity_type "project/epic/issue/task"
        varchar external_entity_id "ID do Linear/Jira"
        varchar external_url "nullable - link para externo"
        jsonb sync_metadata "estado da ultima sync"
        timestamptz last_synced_at
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at "soft delete"
    }

    %% ═══════════════════════════════════════
    %% BOUNDED CONTEXT 7: Auditoria
    %% ═══════════════════════════════════════

    audit_log {
        uuid id PK "UUID v7"
        uuid organization_id FK "nullable"
        uuid user_id FK "nullable"
        varchar entity_type "user/project/interview..."
        uuid entity_id "entidade afetada"
        varchar action "create/update/delete/export"
        jsonb old_values "nullable - antes"
        jsonb new_values "nullable - depois"
        varchar ip_address "nullable"
        varchar user_agent "nullable"
        timestamptz created_at "imutavel, sem update/delete"
    }

    %% ═══════════════════════════════════════
    %% RELACIONAMENTOS
    %% ═══════════════════════════════════════

    %% IAM
    users ||--o{ organization_members : "possui membros"
    organizations ||--o{ organization_members : "possui membros"
    users ||--o{ refresh_tokens : "possui tokens"

    %% Gestao de Projetos
    organizations ||--o{ projects : "possui"
    users ||--o{ projects : "cria"
    projects ||--o{ project_members : "possui membros"
    users ||--o{ project_members : "participa de"
    organizations ||--o{ tags : "define"
    projects ||--o{ project_tags : "marcado com"
    tags ||--o{ project_tags : "aplicado a"

    %% Entrevista & Chat
    projects ||--o{ interviews : "possui entrevistas"
    users ||--o{ interviews : "conduz"
    interviews ||--o{ messages : "contem"
    users ||--o{ messages : "envia"
    interviews ||--|| interview_notes : "possui notas"
    users ||--o{ interview_notes : "edita"

    %% Template SDLC
    sdlc_templates ||--o{ template_milestones : "possui milestones"
    template_milestones ||--o{ template_epics : "possui epics"
    template_epics ||--o{ template_issues : "possui issues"
    template_issues ||--o{ template_issues : "possui sub-issues"
    template_issues ||--o{ template_checklist_items : "possui checklist"

    %% Motor de Estimativas
    projects ||--o{ estimation_sessions : "estimado via"
    sdlc_templates ||--o{ estimation_sessions : "usa template"
    users ||--o{ estimation_sessions : "inicia"
    estimation_sessions ||--o{ estimation_milestone_statuses : "rastreia milestones"
    template_milestones ||--o{ estimation_milestone_statuses : "rastreado em"
    estimation_sessions ||--o{ estimation_responses : "coleta respostas"
    template_issues ||--o{ estimation_responses : "respondido para"
    users ||--o{ estimation_responses : "responde"
    estimation_sessions ||--o{ estimation_checklist_results : "verifica itens"
    template_checklist_items ||--o{ estimation_checklist_results : "verificado em"
    users ||--o{ estimation_checklist_results : "verifica"
    estimation_sessions ||--o{ estimation_outputs : "gera"

    %% Integracoes
    organizations ||--o{ integration_connections : "conecta"
    users ||--o{ integration_connections : "configura"
    estimation_sessions ||--o{ export_sessions : "exportado via"
    integration_connections ||--o{ export_sessions : "usado por"
    users ||--o{ export_sessions : "aciona"
    export_sessions ||--o{ export_mappings : "mapeia entidades"

    %% Auditoria
    organizations ||--o{ audit_log : "auditado"
    users ||--o{ audit_log : "realizado por"
```
