DROP TRIGGER IF EXISTS trg_issues_count ON template_issues;
DROP FUNCTION IF EXISTS update_template_issue_count();

DROP TRIGGER IF EXISTS trg_epics_count ON template_epics;
DROP FUNCTION IF EXISTS update_template_epic_count();

DROP TRIGGER IF EXISTS trg_milestones_count ON template_milestones;
DROP FUNCTION IF EXISTS update_template_milestone_count();

DROP TRIGGER IF EXISTS trg_messages_count ON messages;
DROP FUNCTION IF EXISTS update_interview_message_count();
