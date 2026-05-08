-- Phase 3 calendar_events ownership pilot.
-- RLS and NOT NULL enforcement are intentionally deferred until calendar_events
-- backfill and runtime query scoping are verified in production.

ALTER TABLE calendar_events
  ADD COLUMN IF NOT EXISTS account_id uuid REFERENCES accounts(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS calendar_events_account_id_idx
  ON calendar_events(account_id);

COMMENT ON COLUMN calendar_events.account_id IS
  'Nullable tenant owner for the calendar_events ownership pilot. Backfill, NOT NULL enforcement, and RLS policies will be added in later migrations.';
