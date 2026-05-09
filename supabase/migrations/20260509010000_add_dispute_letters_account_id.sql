-- Phase 3 dispute_letters ownership pilot.
-- RLS and NOT NULL enforcement are intentionally deferred until dispute_letters
-- backfill and runtime query scoping are verified in production.

ALTER TABLE dispute_letters
  ADD COLUMN IF NOT EXISTS account_id uuid REFERENCES accounts(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS dispute_letters_account_id_idx
  ON dispute_letters(account_id);

COMMENT ON COLUMN dispute_letters.account_id IS
  'Nullable tenant owner for the dispute_letters ownership pilot. Backfill, NOT NULL enforcement, and RLS policies will be added in later migrations.';
