# OUTE Database - Architecture Decisions

> Decisoes arquiteturais para performance, desacoplamento e escalabilidade.

---

## 1. UUID v7 como Primary Key

**Decisao**: Todas as PKs usam UUID v7 ao inves de UUID v4 ou SERIAL.

**Motivo**:
- UUID v7 eh time-ordered (timestamp nos primeiros 48 bits), garantindo melhor localidade no B-tree do PostgreSQL
- Insercoes sequenciais evitam page splits frequentes que UUID v4 causa
- Permite geracao de IDs no lado do cliente (sem roundtrip ao DB)
- Compativel com sistemas distribuidos futuros

**Trade-off**: 16 bytes vs 4 bytes (SERIAL). O ganho em flexibilidade e distribuicao compensa o custo de storage.

---

## 2. Soft Deletes com deleted_at

**Decisao**: Todas as tabelas (exceto `audit_log`) possuem coluna `deleted_at timestamptz`.

**Motivo**:
- Permite auditoria retroativa e recuperacao de dados
- Simplifica compliance (LGPD/GDPR) com retencao antes de purge definitivo
- Queries de listagem filtram automaticamente com `WHERE deleted_at IS NULL`

**Trade-off**: Tabelas crescem mais e queries precisam do filtro. Mitigado com partial indexes (`WHERE deleted_at IS NULL`).

---

## 3. JSONB para Metadados Variaveis

**Decisao**: Uso de JSONB em colunas onde a estrutura eh altamente variavel.

**Onde**:
| Tabela | Coluna | Conteudo |
|--------|--------|----------|
| `organizations` | `settings` | Preferencias da org |
| `messages` | `metadata` | Modelo AI, tokens usados, refs |
| `interview_notes` | `metrics` | Progress, hours, budget |
| `interview_notes` | `tags_snapshot` | Snapshot de tags no momento |
| `template_milestones` | `applicability_tags` | WEB, MOBILE, DATA, AI... |
| `template_epics` | `applicability_tags` | ENTERPRISE, STARTUP... |
| `template_issues` | `applicability_tags` | Tags de aplicabilidade |
| `template_issues` | `metadata` | Config extra por issue |
| `estimation_sessions` | `config` | Tags selecionadas, tipo projeto |
| `estimation_responses` | `structured_data` | Dados parseados |
| `estimation_outputs` | `result` | Relatorio completo |
| `estimation_outputs` | `architecture_decisions` | Stack, patterns |
| `estimation_outputs` | `compliance_summary` | Checklist regulatorio |
| `integration_connections` | `credentials_encrypted` | Tokens (encrypted at rest) |
| `integration_connections` | `config` | Workspace IDs, project keys |
| `export_sessions` | `error_log` | Detalhes de falha |
| `export_sessions` | `export_config` | Regras de mapeamento |
| `export_mappings` | `sync_metadata` | Estado da ultima sync |
| `audit_log` | `old_values` / `new_values` | Before/after snapshot |

**Motivo**: Normalizar esses dados criaria dezenas de tabelas adicionais com pouco beneficio. JSONB no PostgreSQL suporta GIN indexes para queries eficientes.

---

## 4. Multi-Tenancy via Organizations

**Decisao**: Modelo de multi-tenancy baseado em Organizations com scoping explicito.

**Estrutura**:
```
Organization
  ├── Members (users com roles)
  ├── Projects
  │     ├── Project Members
  │     ├── Interviews
  │     └── Estimation Sessions
  ├── Tags (registry org-scoped)
  └── Integration Connections
```

**Motivo**:
- Isola dados entre organizacoes
- Permite diferentes planos/limites por org
- Tags e integracoes sao compartilhadas dentro da org

**Isolamento**: Row-level via `organization_id` FK. Nao usa schemas separados (overhead de manutenção nao justifica nesta fase).

---

## 5. Template Versioning

**Decisao**: Estimation sessions sao vinculadas a uma versao especifica do template (`template_id` FK).

**Motivo**:
- Templates evoluem (v4 -> v5 -> v6)
- Estimacoes existentes nao devem ser invalidadas quando o template muda
- Permite comparar estimacoes feitas com diferentes versoes

**Mecanismo**: `sdlc_templates.is_active` indica qual versao eh o default atual. Sessions antigas continuam referenciando sua versao original.

---

## 6. Hybrid Interview Tracking

**Decisao**: `estimation_milestone_statuses` rastreia o progresso por milestone com status granular.

**Status possiveis**:
- `pending` - Nao iniciado
- `in_progress` - Em andamento
- `completed` - Concluido
- `skipped` - Pulado pelo usuario (requer `skip_reason`)
- `needs_revisit` - Marcado para revisitar no futuro
- `not_applicable` - Researcher/AI determinou que nao se aplica

**Campos de revisao**:
- `skip_reason` - Motivo do skip (preenchido pelo usuario)
- `reviewer_verdict` - Veredicto do reviewer: `confirmed_skip`, `must_revisit`, `not_needed`
- `reviewed_by` - Quem revisou (user ou AI)

**Motivo**: O fluxo hibrido permite que usuarios pulem milestones, mas items pulados afetam a acuracidade da estimativa. O tracking granular permite que o sistema sinalize o que precisa ser revisitado.

---

## 7. Generic Integration Model

**Decisao**: Modelo generico para integracoes externas ao inves de tabelas especificas por provider.

**Estrutura**:
```
integration_connections (org-level)
  └── export_sessions (per export run)
        └── export_mappings (entity-level)
```

**Providers suportados**: Linear, Jira, Asana, GitHub, GitLab (enum extensivel).

**Motivo**:
- Adicionar novo provider = novo valor no enum, sem migration de schema
- `export_mappings` usa referencia polimorfica (`internal_entity_type` + `internal_entity_id`)
- Permite rastreamento bidirecional (interno <-> externo)

---

## 8. Indexes para Hot Paths

**Decisao**: Indexes compostos nas queries mais frequentes.

| Index | Tabela | Colunas | Use Case |
|-------|--------|---------|----------|
| Login | `users` | `email` (unique, where deleted_at IS NULL) | Autenticacao |
| Dashboard | `projects` | `(organization_id, status)` | Listagem de projetos |
| Chat | `messages` | `(interview_id, created_at)` | Timeline de chat |
| Progress | `estimation_milestone_statuses` | `(session_id, milestone_id)` | Tracking de progresso |
| Token lookup | `refresh_tokens` | `token_hash` (unique) | JWT refresh |
| Org projects | `projects` | `(organization_id, created_at)` | Projetos recentes |
| Template tree | `template_milestones` | `(template_id, sort_order)` | Arvore do template |
| Active tokens | `refresh_tokens` | `(user_id)` where revoked=false | Tokens ativos |
| Audit trail | `audit_log` | `(entity_type, entity_id)` | Historico de entidade |
| Audit by org | `audit_log` | `(organization_id, created_at)` | Log por org |

**Partial indexes** (WHERE deleted_at IS NULL) em todas as tabelas com soft delete para evitar scan de registros deletados.

---

## 9. Audit Log Imutavel

**Decisao**: `audit_log` eh append-only, sem `updated_at` ou `deleted_at`.

**Motivo**:
- Garantia de integridade do historico
- Compliance com requisitos de auditoria
- Nenhuma operacao UPDATE ou DELETE permitida nesta tabela

**Campos**: `old_values` e `new_values` em JSONB permitem reconstruir o estado anterior de qualquer entidade.

---

## 10. Normalizacao Maxima 3NF

**Decisao**: Schema segue no maximo Third Normal Form (3NF), com desnormalizacao controlada via JSONB.

**Exemplos de desnormalizacao intencional**:
- `interviews.total_messages` - Counter cache para evitar COUNT(*) em messages
- `estimation_outputs.estimated_hours_min/max` - Valores extraidos do JSONB `result` para queries diretas
- `interview_notes.tags_snapshot` - Snapshot de tags no momento da nota (evita join com tags que podem mudar)

**Motivo**: Over-normalizacao gera JOINs excessivos. Desnormalizacao controlada em pontos estrategicos melhora performance de leitura sem sacrificar integridade.

---

## Resumo

| Aspecto | Decisao | Justificativa |
|---------|---------|---------------|
| PKs | UUID v7 | Time-ordered, client-side, distributed-ready |
| Deletes | Soft (deleted_at) | Auditoria, compliance, recuperacao |
| Metadados | JSONB | Flexibilidade sem explosao de tabelas |
| Tenancy | Organizations | Row-level isolation, escalavel |
| Templates | Versionados | Estimacoes nao invalidam com mudancas |
| Tracking | Hybrid status | Skip/revisit/not_applicable granular |
| Integracoes | Generico | Extensivel por enum, sem schema changes |
| Indexes | Compostos + partial | Hot paths otimizados |
| Audit | Append-only | Integridade garantida |
| Normalizacao | Max 3NF + JSONB | Balance entre integridade e performance |
