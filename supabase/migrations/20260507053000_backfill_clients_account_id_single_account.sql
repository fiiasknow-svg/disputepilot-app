-- Phase 3 clients ownership backfill guard.
-- Assign unowned clients only when this deployment has exactly one account.
-- If there are zero accounts or multiple accounts, this updates no rows.
-- Ambiguous multi-account ownership is intentionally left null for manual backfill.
-- This does not delete rows, enforce NOT NULL, or enable RLS.

WITH only_account AS (
  SELECT id
  FROM accounts
  WHERE (SELECT count(*) FROM accounts) = 1
)
UPDATE clients
SET account_id = only_account.id
FROM only_account
WHERE clients.account_id IS NULL;

COMMENT ON COLUMN clients.account_id IS
  'Nullable tenant owner for the clients ownership pilot. Guarded backfill assigns unowned rows only when exactly one account exists; ambiguous multi-account rows remain null until manual backfill. NOT NULL enforcement and RLS policies are deferred.';
