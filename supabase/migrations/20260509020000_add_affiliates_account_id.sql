-- Phase 3 affiliates ownership pilot.
-- RLS and NOT NULL enforcement are intentionally deferred until affiliates
-- backfill and runtime query scoping are verified in production.

ALTER TABLE affiliates
  ADD COLUMN IF NOT EXISTS account_id uuid REFERENCES accounts(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS affiliates_account_id_idx
  ON affiliates(account_id);

COMMENT ON COLUMN affiliates.account_id IS
  'Nullable tenant owner for the affiliates ownership pilot. Backfill, NOT NULL enforcement, and RLS policies will be added in later migrations.';
