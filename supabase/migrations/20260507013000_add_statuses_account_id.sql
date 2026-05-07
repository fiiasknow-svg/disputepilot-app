-- Phase 3 statuses ownership pilot.
-- RLS and NOT NULL enforcement are intentionally deferred until statuses
-- backfill and runtime query scoping are verified in production.

ALTER TABLE statuses
  ADD COLUMN IF NOT EXISTS account_id uuid REFERENCES accounts(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS statuses_account_id_idx
  ON statuses(account_id);

COMMENT ON COLUMN statuses.account_id IS
  'Nullable tenant owner for the statuses RLS pilot. Backfill, NOT NULL enforcement, and RLS policies will be added in later migrations.';
