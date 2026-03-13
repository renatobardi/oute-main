-- =============================================================================
-- Migration 007: Interview & Conversation
-- =============================================================================
-- Tables: interviews, messages, interview_notes
-- =============================================================================

-- ─── interviews ──────────────────────────────────────────────────────────────

CREATE TABLE interviews (
  id              uuid              PRIMARY KEY DEFAULT uuid_generate_v7(),
  project_id      uuid              NOT NULL REFERENCES projects(id),
  conducted_by    uuid              NOT NULL REFERENCES users(id),
  title           varchar(255)      NOT NULL,
  status          interview_status  NOT NULL DEFAULT 'scheduled',
  interview_code  varchar(30)       NOT NULL,
  total_messages  integer           NOT NULL DEFAULT 0,
  started_at      timestamptz,
  completed_at    timestamptz,
  created_at      timestamptz       NOT NULL DEFAULT now(),
  updated_at      timestamptz       NOT NULL DEFAULT now(),
  deleted_at      timestamptz
);

CREATE UNIQUE INDEX idx_interviews_code
  ON interviews (interview_code) WHERE deleted_at IS NULL;

CREATE INDEX idx_interviews_project_id
  ON interviews (project_id);

CREATE INDEX idx_interviews_project_status
  ON interviews (project_id, status) WHERE deleted_at IS NULL;

CREATE INDEX idx_interviews_conducted_by
  ON interviews (conducted_by);

CREATE TRIGGER trg_interviews_updated_at
  BEFORE UPDATE ON interviews
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── messages ────────────────────────────────────────────────────────────────

CREATE TABLE messages (
  id           uuid            PRIMARY KEY DEFAULT uuid_generate_v7(),
  interview_id uuid            NOT NULL REFERENCES interviews(id),
  user_id      uuid            REFERENCES users(id),
  sender       message_sender  NOT NULL,
  type         message_type    NOT NULL DEFAULT 'text',
  content      text            NOT NULL,
  metadata     jsonb           DEFAULT '{}',
  created_at   timestamptz     NOT NULL DEFAULT now(),
  updated_at   timestamptz     NOT NULL DEFAULT now(),
  deleted_at   timestamptz
);

CREATE INDEX idx_messages_interview_time
  ON messages (interview_id, created_at);

CREATE INDEX idx_messages_interview_id
  ON messages (interview_id);

CREATE TRIGGER trg_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── interview_notes ─────────────────────────────────────────────────────────

CREATE TABLE interview_notes (
  id              uuid        PRIMARY KEY DEFAULT uuid_generate_v7(),
  interview_id    uuid        NOT NULL REFERENCES interviews(id),
  last_edited_by  uuid        NOT NULL REFERENCES users(id),
  summary         text,
  content         text,
  metrics         jsonb       NOT NULL DEFAULT '{"progress": 0, "estimatedHours": "", "budget": ""}',
  tags_snapshot   jsonb       NOT NULL DEFAULT '[]',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  deleted_at      timestamptz
);

CREATE UNIQUE INDEX idx_interview_notes_interview_id
  ON interview_notes (interview_id) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_interview_notes_updated_at
  BEFORE UPDATE ON interview_notes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
