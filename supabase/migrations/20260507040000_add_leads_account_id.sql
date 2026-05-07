-- Phase 3 leads ownership pilot.
-- RLS and NOT NULL enforcement are intentionally deferred until leads
-- backfill and runtime query scoping are verified in production.

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS account_id uuid REFERENCES accounts(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS leads_account_id_idx
  ON leads(account_id);

COMMENT ON COLUMN leads.account_id IS
  'Nullable tenant owner for the leads ownership pilot. Backfill, NOT NULL enforcement, and RLS policies will be added in later migrations.';
