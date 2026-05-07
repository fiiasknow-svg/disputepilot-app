-- Phase 3 employees ownership pilot.
-- RLS and NOT NULL enforcement are intentionally deferred until employees
-- backfill and runtime query scoping are verified in production.

ALTER TABLE employees
  ADD COLUMN IF NOT EXISTS account_id uuid REFERENCES accounts(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS employees_account_id_idx
  ON employees(account_id);

COMMENT ON COLUMN employees.account_id IS
  'Nullable tenant owner for the employees ownership pilot. Backfill, NOT NULL enforcement, and RLS policies will be added in later migrations.';
