-- =============================================================================
-- Migration 012: Counter Cache Triggers
-- =============================================================================
-- Automatic counter updates for denormalized fields.
-- =============================================================================

-- ─── interviews.total_messages ───────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_interview_message_count()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE interviews
    SET total_messages = total_messages + 1
    WHERE id = NEW.interview_id;
    RETURN NEW;

  ELSIF TG_OP = 'DELETE' THEN
    UPDATE interviews
    SET total_messages = total_messages - 1
    WHERE id = OLD.interview_id;
    RETURN OLD;

  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle soft delete
    IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
      UPDATE interviews
      SET total_messages = total_messages - 1
      WHERE id = NEW.interview_id;
    -- Handle restore
    ELSIF OLD.deleted_at IS NOT NULL AND NEW.deleted_at IS NULL THEN
      UPDATE interviews
      SET total_messages = total_messages + 1
      WHERE id = NEW.interview_id;
    END IF;
    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_messages_count
  AFTER INSERT OR DELETE OR UPDATE OF deleted_at ON messages
  FOR EACH ROW EXECUTE FUNCTION update_interview_message_count();

-- ─── sdlc_templates counters ─────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_template_milestone_count()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE sdlc_templates
    SET total_milestones = total_milestones + 1
    WHERE id = NEW.template_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE sdlc_templates
    SET total_milestones = total_milestones - 1
    WHERE id = OLD.template_id;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
      UPDATE sdlc_templates
      SET total_milestones = total_milestones - 1
      WHERE id = NEW.template_id;
    ELSIF OLD.deleted_at IS NOT NULL AND NEW.deleted_at IS NULL THEN
      UPDATE sdlc_templates
      SET total_milestones = total_milestones + 1
      WHERE id = NEW.template_id;
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_milestones_count
  AFTER INSERT OR DELETE OR UPDATE OF deleted_at ON template_milestones
  FOR EACH ROW EXECUTE FUNCTION update_template_milestone_count();

-- Epic count: count via milestone → template
CREATE OR REPLACE FUNCTION update_template_epic_count()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_template_id uuid;
BEGIN
  IF TG_OP = 'DELETE' THEN
    SELECT template_id INTO v_template_id FROM template_milestones WHERE id = OLD.milestone_id;
  ELSE
    SELECT template_id INTO v_template_id FROM template_milestones WHERE id = NEW.milestone_id;
  END IF;

  IF v_template_id IS NOT NULL THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE sdlc_templates SET total_epics = total_epics + 1 WHERE id = v_template_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE sdlc_templates SET total_epics = total_epics - 1 WHERE id = v_template_id;
    ELSIF TG_OP = 'UPDATE' THEN
      IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
        UPDATE sdlc_templates SET total_epics = total_epics - 1 WHERE id = v_template_id;
      ELSIF OLD.deleted_at IS NOT NULL AND NEW.deleted_at IS NULL THEN
        UPDATE sdlc_templates SET total_epics = total_epics + 1 WHERE id = v_template_id;
      END IF;
    END IF;
  END IF;

  IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$;

CREATE TRIGGER trg_epics_count
  AFTER INSERT OR DELETE OR UPDATE OF deleted_at ON template_epics
  FOR EACH ROW EXECUTE FUNCTION update_template_epic_count();

-- Issue count: count via epic → milestone → template
CREATE OR REPLACE FUNCTION update_template_issue_count()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_template_id uuid;
BEGIN
  IF TG_OP = 'DELETE' THEN
    SELECT tm.template_id INTO v_template_id
    FROM template_epics te
    JOIN template_milestones tm ON tm.id = te.milestone_id
    WHERE te.id = OLD.epic_id;
  ELSE
    SELECT tm.template_id INTO v_template_id
    FROM template_epics te
    JOIN template_milestones tm ON tm.id = te.milestone_id
    WHERE te.id = NEW.epic_id;
  END IF;

  IF v_template_id IS NOT NULL THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE sdlc_templates SET total_issues = total_issues + 1 WHERE id = v_template_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE sdlc_templates SET total_issues = total_issues - 1 WHERE id = v_template_id;
    ELSIF TG_OP = 'UPDATE' THEN
      IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
        UPDATE sdlc_templates SET total_issues = total_issues - 1 WHERE id = v_template_id;
      ELSIF OLD.deleted_at IS NOT NULL AND NEW.deleted_at IS NULL THEN
        UPDATE sdlc_templates SET total_issues = total_issues + 1 WHERE id = v_template_id;
      END IF;
    END IF;
  END IF;

  IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$;

CREATE TRIGGER trg_issues_count
  AFTER INSERT OR DELETE OR UPDATE OF deleted_at ON template_issues
  FOR EACH ROW EXECUTE FUNCTION update_template_issue_count();
