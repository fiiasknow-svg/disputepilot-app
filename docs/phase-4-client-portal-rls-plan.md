# Phase 4 Client Portal RLS Plan

Date: 2026-05-14

## Scope

This is a staged draft-only plan. It does not apply production changes, change runtime behavior, or weaken the Phase 3 business RLS policies.

Phase 3 production business RLS is complete for:

- `employees`
- `leads`
- `clients`
- `invoices`
- `disputes`
- `calendar_events`
- `affiliates`

`statuses` and `dispute_letters` were skipped in production because those tables do not exist there.

The Phase 4 isolation audit found that `/client-login` uses the same Supabase Auth flow as business login, no root `app/client-portal` or `app/portal` route implementation exists, no `client_portal_users` mapping exists, and `clients.portal_access` is not an authorization boundary.

## Staged Artifacts

- Schema migration: `supabase/migrations/20260514010000_add_client_portal_users.sql`
- Disposable schema verification: `supabase/tests/client-portal-users-schema-readiness.sql`
- Draft policy plan: `supabase/policies/drafts/client-portal-users-rls-policy-draft.sql`
- Server-side portal context helper: `lib/client-portal-context.ts`

The migration is schema-only. It creates `public.client_portal_users`, indexes, constraints, and comments, but it does not enable RLS and does not wire the app to the table.

The portal context helper is unused by routes for now. It verifies the current Supabase Auth user server-side, reads only `client_portal_users`, returns one active `{ accountId, clientId, userId, status }` mapping, and returns `null` for logged-out, unmapped, inactive, or query-error cases. It does not read `account_memberships` and does not use `dp_auth`.

## Current Git Checkpoint

`git status --short` before this draft was added was clean.

`git log -10 --oneline`:

```text
77e35fe Audit client portal isolation
868993e Document production RLS rollout completion
10190a8 Fix affiliate row visibility after save
c55dfd2 Fix affiliates page for production schema
df9d570 Fix calendar events RLS client match overloads
8eaa634 Fix disputes RLS client match overloads
fc14ca2 Fix invoices RLS client match overloads
8a0d268 Fix invoices RLS for production client id type
f4d9610 Add account membership read policies
aad41a1 Allow controlled employee save error in test
```

## Files Reviewed

- `docs/phase-4-client-portal-isolation-audit.md`
- `supabase/policies/drafts`
- `supabase/migrations`
- `app/client-login/page.tsx`
- `components/ClientPortalLayout.tsx`
- `proxy.ts`
- `app/clients/page.tsx`
- `app/clients/[id]/page.tsx`

## Proposed Schema

Draft table: `public.client_portal_users`.

Intended columns:

| Column | Draft type | Purpose |
| --- | --- | --- |
| `id` | `uuid primary key default gen_random_uuid()` | Stable mapping id. |
| `account_id` | `uuid not null references public.accounts(id) on delete cascade` | Business tenant that owns the client. |
| `client_id` | same type as `public.clients.id` at migration runtime | Client row visible to this portal user. Must match the real production `clients.id` type before apply. |
| `user_id` | `uuid not null references auth.users(id) on delete cascade` | Supabase Auth customer user. |
| `status` | `text not null default 'active'` | Mapping state. Only active mappings authorize portal reads. |
| `created_at` | `timestamptz not null default now()` | Audit timestamp. |
| `updated_at` | `timestamptz not null default now()` | Audit timestamp. |

Draft constraints and indexes:

- `unique(account_id, client_id, user_id)`
- index on `user_id`
- index on `(account_id, client_id)`
- optional status check: `status in ('active', 'disabled', 'invited', 'revoked')`

Production caveat: `client_id` must use the actual production `clients.id` type. The staged migration detects `public.clients.id` and creates `client_portal_users.client_id` with that same type, then adds a foreign key to `public.clients(id)`. Production notes currently indicate `clients.id` is `uuid`, but production apply still requires a fresh column-type audit immediately before running the migration.

## Portal Access Rules

Portal users are distinct from business users.

- Business users stay authorized through `account_memberships`.
- Portal users are authorized through `client_portal_users`.
- Do not add customer portal users to `account_memberships` as a shortcut.
- `clients.portal_access` is only an enable/disable flag on the client record. It is not proof of identity and must not authorize access by itself.
- A mapped active portal user can read only their own client row.
- A mapped active portal user can read only portal-safe child records tied to the mapped `account_id` and `client_id`.
- An authenticated Supabase user with no active portal mapping gets no portal data.
- Anon gets no portal data.
- Portal policies should be read-first. Portal writes, uploads, messages, or document actions need separate tables and policies.

## Portal Policy Shape

The core predicate should be:

```sql
exists (
  select 1
  from public.client_portal_users cpu
  where cpu.user_id = auth.uid()
    and cpu.status = 'active'
    and cpu.account_id = <target_table>.account_id
    and cpu.client_id = <target_table>.client_id
)
```

For the `clients` table, the target row has `id` instead of `client_id`, so the predicate should match:

```sql
cpu.account_id = clients.account_id
and cpu.client_id = clients.id
and coalesce(clients.portal_access, false) = true
```

`clients.portal_access` should only be an additional gate after identity has already been proven by `client_portal_users`.

## Production Schema Caveat

Production relationship types may differ by table. During Phase 3, `invoices`, `disputes`, and `calendar_events` required production-safe client relationship helpers because some `client_id` columns did not match `clients.id`.

Portal policies must validate production column types before apply:

- `clients.id`
- `client_portal_users.client_id`
- `invoices.client_id`
- `disputes.client_id`
- `calendar_events.client_id`
- any future documents/messages/letters client relationship columns

For business RLS, incompatible child `client_id` checks were allowed to pass in some cases so valid account-owned rows were not over-blocked. Do not copy that behavior for portal data. Portal isolation is per-client, so an incompatible or unverifiable child relationship should fail closed until the schema is reconciled or a safe mapping is added.

If a production child table cannot safely prove that its row belongs to the mapped portal client, do not expose that table in the portal yet.

## Implementation Order

1. Apply schema migration in disposable only.
   - Create `client_portal_users`.
   - Add indexes and constraints.
   - Do not add `NOT NULL` to existing production tables.
   - Confirm the migration creates `client_portal_users.client_id` with the same type as `clients.id`.

2. Run disposable schema verification.
   - Run `supabase/tests/client-portal-users-schema-readiness.sql`.
   - Confirm required columns, indexes, unique constraint behavior, two-account/two-client/two-user mapping representation, and cleanup.
   - Do not treat this as portal RLS proof; it only verifies the staged schema.

3. Server-side portal context helper.
   - Verify Supabase Auth server-side.
   - Resolve only `client_portal_users` mappings.
   - Return `account_id`, `client_id`, `user_id`, and mapping status.
   - Keep this separate from `getCurrentAccountContext()`.
   - Current helper path: `lib/client-portal-context.ts`.

4. Portal routes/pages.
   - Implement `/portal` and child routes server-first.
   - Use the portal context helper.
   - Avoid broad client-side Supabase table queries.
   - Never trust browser-provided `account_id` or `client_id`.

5. Portal-specific RLS policies.
   - Add RLS for `client_portal_users`.
   - Add portal read policies to `clients`.
   - Add child-table portal read policies only after production relationship types are proven compatible.
   - Preserve existing business account-membership policies.

6. Tests.
   - Add database-level RLS tests for mapped, cross-client, unmapped, and anon cases.
   - Add Playwright tests for portal login/route behavior after pages exist.
   - Add API tests for any portal data endpoints.

7. Production audit.
   - Confirm production table existence and column types.
   - Confirm no customer users are present in `account_memberships`.
   - Confirm `clients.portal_access` values for intended portal clients.
   - Confirm initial invite/mapping data source.

8. Production apply.
   - Apply schema first.
   - Backfill or insert explicit portal mappings only after confirmation.
   - Apply RLS only after disposable verification passes.
   - Live-test mapped, unmapped, anon, and business-user paths.

## Disposable Verification

`supabase/tests/client-portal-users-schema-readiness.sql` is disposable/test oriented and does not enable production RLS. It verifies:

- `public.client_portal_users` exists.
- Required columns exist.
- `client_portal_users.client_id` matches `public.clients.id`.
- The unique mapping constraint exists.
- Expected indexes exist.
- Two accounts, two clients, and two auth users can represent user A to client A and user B to client B.
- Duplicate `(account_id, client_id, user_id)` mappings are blocked.
- Fixed test rows are cleaned up before returning the result table.

The readiness script is schema-tolerant for `public.clients` seed rows. It dynamically inserts only safe columns that exist in the target disposable schema, such as `first_name`, `last_name`, `full_name`, `email`, `phone`, `status`, `assigned_agent`, `notes`, and `account_id`; it does not require optional columns like `client_type`.

## Tests Needed

- Mapped portal user can see their own client row.
- Mapped portal user cannot see another client in the same account.
- Mapped portal user cannot see another account's client.
- Mapped portal user can see only compatible, portal-safe child records for their own mapped client.
- Unmapped authenticated user receives no portal data.
- Anon user receives no portal data.
- `dp_auth` alone cannot authorize portal data.
- Business users keep existing `account_memberships` access to business tables.
- Business RLS policies still pass the existing post-RLS verification scripts.
- Portal policies fail closed when child `client_id` type or relationship is not verified.

Manual helper verification until portal routes exist:

- With no Supabase session, `getCurrentClientPortalContext()` should return `null`.
- With a signed-in user and no active `client_portal_users` row, it should return `null`.
- With one active mapping row, it should return `{ accountId, clientId, userId, status: "active" }`.
- With only disabled, invited, or revoked mappings, it should return `null`.
- Confirm no test or route grants portal access via `dp_auth` alone.

## Risks

- Reusing `account_memberships` for customers would grant business-account scope instead of per-client scope.
- Treating `clients.portal_access` as identity proof would allow a flag to become an authorization boundary.
- Applying child-table portal policies before confirming production relationship types could either fail with type errors or expose too much data.
- Keeping `dp_auth` as a production authorization signal leaves a route-level bridge that is weaker than server-verified Supabase Auth.
- Building portal pages with client-side broad Supabase queries would rely too heavily on frontend behavior and make isolation harder to test.

## Recommendation

Create a dedicated `client_portal_users` identity mapping and keep portal policies separate from business policies. Portal access should be narrower than business access: mapped user, active mapping, matching `account_id`, matching `client_id`, and `clients.portal_access = true` where the client row is involved.

## Recommended Next 3 Tasks

1. Run the staged schema migration and `client-portal-users-schema-readiness.sql` against a disposable Supabase database.
2. Draft and test a server-side portal context helper that never falls back to `account_memberships`.
3. Add disposable database RLS verification for portal read policies before implementing live portal pages.
