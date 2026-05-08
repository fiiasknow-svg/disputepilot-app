-- Phase 3 disputes ownership pilot.
-- RLS and NOT NULL enforcement are intentionally deferred until disputes
-- backfill and runtime query scoping are verified in production.

ALTER TABLE disputes
  ADD COLUMN IF NOT EXISTS account_id uuid REFERENCES accounts(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS disputes_account_id_idx
  ON disputes(account_id);

COMMENT ON COLUMN disputes.account_id IS
  'Nullable tenant owner for the disputes ownership pilot. Backfill, NOT NULL enforcement, and RLS policies will be added in later migrations.';
