-- Phase 3 clients ownership pilot.
-- RLS and NOT NULL enforcement are intentionally deferred until clients
-- backfill and runtime query scoping are verified in production.

ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS account_id uuid REFERENCES accounts(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS clients_account_id_idx
  ON clients(account_id);

COMMENT ON COLUMN clients.account_id IS
  'Nullable tenant owner for the clients ownership pilot. Backfill, NOT NULL enforcement, and RLS policies will be added in later migrations.';
