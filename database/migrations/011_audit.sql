-- =============================================================================
-- Migration 011: Audit Log
-- =============================================================================
-- Append-only, immutable table. No updated_at, no deleted_at.
-- No FK constraints (must reference deleted entities).
-- =============================================================================

CREATE TABLE audit_log (
  id              uuid         PRIMARY KEY DEFAULT uuid_generate_v7(),
  organization_id uuid,
  user_id         uuid,
  entity_type     varchar(50)  NOT NULL,
  entity_id       uuid         NOT NULL,
  action          varchar(50)  NOT NULL,
  old_values      jsonb,
  new_values      jsonb,
  ip_address      varchar(45),
  user_agent      varchar(512),
  created_at      timestamptz  NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_entity
  ON audit_log (entity_type, entity_id);

CREATE INDEX idx_audit_org_time
  ON audit_log (organization_id, created_at) WHERE organization_id IS NOT NULL;

CREATE INDEX idx_audit_user_id
  ON audit_log (user_id) WHERE user_id IS NOT NULL;

CREATE INDEX idx_audit_created_at
  ON audit_log (created_at);

-- ─── Immutability rule ───────────────────────────────────────────────────────
-- Prevent UPDATE and DELETE on audit_log

CREATE OR REPLACE FUNCTION audit_log_immutable()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'audit_log is immutable: % operations are not allowed', TG_OP;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_audit_log_no_update
  BEFORE UPDATE ON audit_log
  FOR EACH ROW EXECUTE FUNCTION audit_log_immutable();

CREATE TRIGGER trg_audit_log_no_delete
  BEFORE DELETE ON audit_log
  FOR EACH ROW EXECUTE FUNCTION audit_log_immutable();
