-- Phase 3 account ownership foundation.
-- This migration intentionally does not enable RLS and does not add
-- account_id columns to existing app tables. Those steps belong in later,
-- table-specific migrations after backfill and query updates are planned.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_by_user_id uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS account_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'owner',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT account_memberships_account_user_unique UNIQUE (account_id, user_id)
);

CREATE INDEX IF NOT EXISTS account_memberships_user_id_idx
  ON account_memberships(user_id);

CREATE INDEX IF NOT EXISTS account_memberships_account_id_idx
  ON account_memberships(account_id);

COMMENT ON TABLE accounts IS
  'Business tenant accounts. RLS will be enabled in a later migration after ownership columns, backfill, and query scoping are in place.';

COMMENT ON TABLE account_memberships IS
  'Maps Supabase Auth business users to tenant accounts. RLS will be enabled in a later migration.';
