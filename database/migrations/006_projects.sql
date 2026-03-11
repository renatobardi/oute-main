-- =============================================================================
-- Migration 006: Project Management
-- =============================================================================
-- Tables: projects, project_members, tags, project_tags
-- =============================================================================

-- ─── projects ────────────────────────────────────────────────────────────────

CREATE TABLE projects (
  id               uuid            PRIMARY KEY DEFAULT uuid_generate_v7(),
  organization_id  uuid            NOT NULL REFERENCES organizations(id),
  created_by       uuid            NOT NULL REFERENCES users(id),
  code             varchar(20)     NOT NULL,
  name             varchar(255)    NOT NULL,
  description      text,
  status           project_status  NOT NULL DEFAULT 'draft',
  type             project_type    NOT NULL DEFAULT 'greenfield',
  progress_percent integer         NOT NULL DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
  created_at       timestamptz     NOT NULL DEFAULT now(),
  updated_at       timestamptz     NOT NULL DEFAULT now(),
  deleted_at       timestamptz
);

CREATE UNIQUE INDEX idx_projects_code
  ON projects (code) WHERE deleted_at IS NULL;

CREATE INDEX idx_projects_org_status
  ON projects (organization_id, status) WHERE deleted_at IS NULL;

CREATE INDEX idx_projects_org_id
  ON projects (organization_id);

CREATE INDEX idx_projects_created_by
  ON projects (created_by);

CREATE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── project_members ─────────────────────────────────────────────────────────

CREATE TABLE project_members (
  id         uuid         PRIMARY KEY DEFAULT uuid_generate_v7(),
  project_id uuid         NOT NULL REFERENCES projects(id),
  user_id    uuid         NOT NULL REFERENCES users(id),
  role       varchar(50)  NOT NULL DEFAULT 'developer',
  created_at timestamptz  NOT NULL DEFAULT now(),
  updated_at timestamptz  NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE UNIQUE INDEX idx_proj_members_proj_user
  ON project_members (project_id, user_id) WHERE deleted_at IS NULL;

CREATE INDEX idx_proj_members_project_id
  ON project_members (project_id);

CREATE INDEX idx_proj_members_user_id
  ON project_members (user_id);

CREATE TRIGGER trg_proj_members_updated_at
  BEFORE UPDATE ON project_members
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── tags ────────────────────────────────────────────────────────────────────

CREATE TABLE tags (
  id              uuid         PRIMARY KEY DEFAULT uuid_generate_v7(),
  organization_id uuid         NOT NULL REFERENCES organizations(id),
  name            varchar(100) NOT NULL,
  color           varchar(7)   NOT NULL DEFAULT '#6B7280',
  category        varchar(50),
  created_at      timestamptz  NOT NULL DEFAULT now(),
  updated_at      timestamptz  NOT NULL DEFAULT now(),
  deleted_at      timestamptz
);

CREATE UNIQUE INDEX idx_tags_org_name
  ON tags (organization_id, name) WHERE deleted_at IS NULL;

CREATE INDEX idx_tags_org_id
  ON tags (organization_id);

CREATE TRIGGER trg_tags_updated_at
  BEFORE UPDATE ON tags
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── project_tags ────────────────────────────────────────────────────────────

CREATE TABLE project_tags (
  id         uuid        PRIMARY KEY DEFAULT uuid_generate_v7(),
  project_id uuid        NOT NULL REFERENCES projects(id),
  tag_id     uuid        NOT NULL REFERENCES tags(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_project_tags_proj_tag
  ON project_tags (project_id, tag_id);

CREATE INDEX idx_project_tags_project_id
  ON project_tags (project_id);

CREATE INDEX idx_project_tags_tag_id
  ON project_tags (tag_id);
