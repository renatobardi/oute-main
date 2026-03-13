-- =============================================================================
-- Migration 010: Integrations
-- =============================================================================
-- Tables: integration_connections, export_sessions, export_mappings
-- =============================================================================

-- ─── integration_connections ─────────────────────────────────────────────────

CREATE TABLE integration_connections (
  id                    uuid                  PRIMARY KEY DEFAULT uuid_generate_v7(),
  organization_id       uuid                  NOT NULL REFERENCES organizations(id),
  created_by            uuid                  NOT NULL REFERENCES users(id),
  provider              integration_provider  NOT NULL,
  name                  varchar(255)          NOT NULL,
  credentials_encrypted jsonb                 NOT NULL DEFAULT '{}',
  config                jsonb                 NOT NULL DEFAULT '{}',
  is_active             boolean               NOT NULL DEFAULT true,
  last_synced_at        timestamptz,
  created_at            timestamptz           NOT NULL DEFAULT now(),
  updated_at            timestamptz           NOT NULL DEFAULT now(),
  deleted_at            timestamptz
);

CREATE INDEX idx_integrations_org_provider
  ON integration_connections (organization_id, provider) WHERE deleted_at IS NULL;

CREATE INDEX idx_integrations_org_id
  ON integration_connections (organization_id);

CREATE TRIGGER trg_integration_connections_updated_at
  BEFORE UPDATE ON integration_connections
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── export_sessions ─────────────────────────────────────────────────────────

CREATE TABLE export_sessions (
  id                        uuid          PRIMARY KEY DEFAULT uuid_generate_v7(),
  estimation_session_id     uuid          NOT NULL REFERENCES estimation_sessions(id),
  integration_connection_id uuid          NOT NULL REFERENCES integration_connections(id),
  triggered_by              uuid          NOT NULL REFERENCES users(id),
  status                    export_status NOT NULL DEFAULT 'pending',
  items_total               integer       NOT NULL DEFAULT 0,
  items_exported            integer       NOT NULL DEFAULT 0,
  error_log                 jsonb,
  export_config             jsonb         NOT NULL DEFAULT '{}',
  started_at                timestamptz,
  completed_at              timestamptz,
  created_at                timestamptz   NOT NULL DEFAULT now(),
  updated_at                timestamptz   NOT NULL DEFAULT now(),
  deleted_at                timestamptz
);

CREATE INDEX idx_export_sessions_est_session
  ON export_sessions (estimation_session_id);

CREATE INDEX idx_export_sessions_integration
  ON export_sessions (integration_connection_id);

CREATE INDEX idx_export_sessions_triggered_by
  ON export_sessions (triggered_by);

CREATE INDEX idx_export_sessions_status
  ON export_sessions (status) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_export_sessions_updated_at
  BEFORE UPDATE ON export_sessions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── export_mappings ─────────────────────────────────────────────────────────

CREATE TABLE export_mappings (
  id                   uuid         PRIMARY KEY DEFAULT uuid_generate_v7(),
  export_session_id    uuid         NOT NULL REFERENCES export_sessions(id),
  internal_entity_type varchar(50)  NOT NULL,
  internal_entity_id   uuid         NOT NULL,
  external_entity_type varchar(50)  NOT NULL,
  external_entity_id   varchar(255) NOT NULL,
  external_url         varchar(512),
  sync_metadata        jsonb        NOT NULL DEFAULT '{}',
  last_synced_at       timestamptz  NOT NULL DEFAULT now(),
  created_at           timestamptz  NOT NULL DEFAULT now(),
  updated_at           timestamptz  NOT NULL DEFAULT now(),
  deleted_at           timestamptz
);

CREATE INDEX idx_export_mappings_session
  ON export_mappings (export_session_id);

CREATE INDEX idx_export_mappings_internal
  ON export_mappings (export_session_id, internal_entity_type, internal_entity_id);

CREATE INDEX idx_export_mappings_external
  ON export_mappings (external_entity_type, external_entity_id);

CREATE TRIGGER trg_export_mappings_updated_at
  BEFORE UPDATE ON export_mappings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
