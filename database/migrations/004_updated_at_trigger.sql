-- =============================================================================
-- Migration 004: Generic updated_at Trigger Function
-- =============================================================================
-- Reusable trigger function applied to all tables with updated_at column.
-- Created early so table migrations can reference it.
-- =============================================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
