-- Phase 3 disputes ownership backfill guard.
-- Assign unowned disputes only when this deployment has exactly one account.
-- If there are zero accounts or multiple accounts, this updates no rows.
-- Ambiguous multi-account ownership is intentionally left null for manual backfill.
-- This does not delete rows, enforce NOT NULL, or enable RLS.

WITH only_account AS (
  SELECT id
  FROM accounts
  WHERE (SELECT count(*) FROM accounts) = 1
)
UPDATE disputes
SET account_id = only_account.id
FROM only_account
WHERE disputes.account_id IS NULL;

COMMENT ON COLUMN disputes.account_id IS
  'Nullable tenant owner for the disputes ownership pilot. Guarded backfill assigns unowned rows only when exactly one account exists; ambiguous multi-account rows remain null until manual backfill. NOT NULL enforcement and RLS policies are deferred.';
