-- Phase 3 invoices ownership pilot.
-- RLS and NOT NULL enforcement are intentionally deferred until invoices
-- backfill and runtime query scoping are verified in production.

ALTER TABLE invoices
  ADD COLUMN IF NOT EXISTS account_id uuid REFERENCES accounts(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS invoices_account_id_idx
  ON invoices(account_id);

COMMENT ON COLUMN invoices.account_id IS
  'Nullable tenant owner for the invoices ownership pilot. Backfill, NOT NULL enforcement, and RLS policies will be added in later migrations.';
