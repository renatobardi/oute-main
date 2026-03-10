-- =============================================================================
-- Migration 008: SDLC Template Engine
-- =============================================================================
-- Tables: sdlc_templates, template_milestones, template_epics,
--         template_issues, template_checklist_items
-- =============================================================================

-- ─── sdlc_templates ──────────────────────────────────────────────────────────

CREATE TABLE sdlc_templates (
  id               uuid         PRIMARY KEY DEFAULT uuid_generate_v7(),
  version          varchar(20)  NOT NULL,
  name             varchar(255) NOT NULL,
  description      text,
  is_active        boolean      NOT NULL DEFAULT false,
  total_milestones integer      NOT NULL DEFAULT 0,
  total_epics      integer      NOT NULL DEFAULT 0,
  total_issues     integer      NOT NULL DEFAULT 0,
  published_at     timestamptz,
  created_at       timestamptz  NOT NULL DEFAULT now(),
  updated_at       timestamptz  NOT NULL DEFAULT now(),
  deleted_at       timestamptz
);

CREATE UNIQUE INDEX idx_sdlc_templates_version
  ON sdlc_templates (version) WHERE deleted_at IS NULL;

CREATE INDEX idx_sdlc_templates_active
  ON sdlc_templates (is_active) WHERE is_active = true AND deleted_at IS NULL;

CREATE TRIGGER trg_sdlc_templates_updated_at
  BEFORE UPDATE ON sdlc_templates
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── template_milestones ─────────────────────────────────────────────────────

CREATE TABLE template_milestones (
  id                 uuid         PRIMARY KEY DEFAULT uuid_generate_v7(),
  template_id        uuid         NOT NULL REFERENCES sdlc_templates(id),
  sort_order         integer      NOT NULL,
  code               varchar(20)  NOT NULL,
  name               varchar(255) NOT NULL,
  objective          text,
  applicability_tags jsonb        NOT NULL DEFAULT '[]',
  is_required        boolean      NOT NULL DEFAULT true,
  created_at         timestamptz  NOT NULL DEFAULT now(),
  updated_at         timestamptz  NOT NULL DEFAULT now(),
  deleted_at         timestamptz
);

CREATE UNIQUE INDEX idx_milestones_template_order
  ON template_milestones (template_id, sort_order) WHERE deleted_at IS NULL;

CREATE INDEX idx_milestones_template_id
  ON template_milestones (template_id);

CREATE TRIGGER trg_template_milestones_updated_at
  BEFORE UPDATE ON template_milestones
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── template_epics ──────────────────────────────────────────────────────────

CREATE TABLE template_epics (
  id                 uuid         PRIMARY KEY DEFAULT uuid_generate_v7(),
  milestone_id       uuid         NOT NULL REFERENCES template_milestones(id),
  sort_order         integer      NOT NULL,
  name               varchar(255) NOT NULL,
  description        text,
  applicability_tags jsonb        NOT NULL DEFAULT '[]',
  created_at         timestamptz  NOT NULL DEFAULT now(),
  updated_at         timestamptz  NOT NULL DEFAULT now(),
  deleted_at         timestamptz
);

CREATE UNIQUE INDEX idx_epics_milestone_order
  ON template_epics (milestone_id, sort_order) WHERE deleted_at IS NULL;

CREATE INDEX idx_epics_milestone_id
  ON template_epics (milestone_id);

CREATE TRIGGER trg_template_epics_updated_at
  BEFORE UPDATE ON template_epics
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── template_issues ─────────────────────────────────────────────────────────

CREATE TABLE template_issues (
  id                   uuid         PRIMARY KEY DEFAULT uuid_generate_v7(),
  epic_id              uuid         NOT NULL REFERENCES template_epics(id),
  parent_issue_id      uuid         REFERENCES template_issues(id),
  sort_order           integer      NOT NULL,
  name                 varchar(255) NOT NULL,
  how_to_fill          text,
  description_template text,
  applicability_tags   jsonb        NOT NULL DEFAULT '[]',
  metadata             jsonb        NOT NULL DEFAULT '{}',
  depth                integer      NOT NULL DEFAULT 0 CHECK (depth BETWEEN 0 AND 2),
  created_at           timestamptz  NOT NULL DEFAULT now(),
  updated_at           timestamptz  NOT NULL DEFAULT now(),
  deleted_at           timestamptz
);

CREATE INDEX idx_issues_epic_order
  ON template_issues (epic_id, sort_order);

CREATE INDEX idx_issues_epic_id
  ON template_issues (epic_id);

CREATE INDEX idx_issues_parent_id
  ON template_issues (parent_issue_id) WHERE parent_issue_id IS NOT NULL;

CREATE TRIGGER trg_template_issues_updated_at
  BEFORE UPDATE ON template_issues
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── template_checklist_items ────────────────────────────────────────────────

CREATE TABLE template_checklist_items (
  id          uuid        PRIMARY KEY DEFAULT uuid_generate_v7(),
  issue_id    uuid        NOT NULL REFERENCES template_issues(id),
  sort_order  integer     NOT NULL,
  label       text        NOT NULL,
  is_critical boolean     NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  deleted_at  timestamptz
);

CREATE INDEX idx_checklist_issue_order
  ON template_checklist_items (issue_id, sort_order);

CREATE INDEX idx_checklist_issue_id
  ON template_checklist_items (issue_id);

CREATE TRIGGER trg_checklist_items_updated_at
  BEFORE UPDATE ON template_checklist_items
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
