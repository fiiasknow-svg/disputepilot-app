"use client";

import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const missingConfigError = { message: "Supabase is not configured for this environment." };

function emptyResult() {
  return Promise.resolve({ data: [], error: null });
}

function emptySingleResult() {
  return Promise.resolve({ data: null, error: null });
}

type NoopResult = { data: unknown[] | null; error: null };
type ResolveFn = (value: NoopResult) => unknown;
type RejectFn = (reason?: unknown) => unknown;
type NoopQuery = {
  select: () => NoopQuery;
  order: () => NoopQuery;
  eq: () => NoopQuery;
  neq: () => NoopQuery;
  not: () => NoopQuery;
  in: () => NoopQuery;
  insert: () => Promise<NoopResult>;
  update: () => NoopQuery;
  delete: () => NoopQuery;
  single: () => Promise<NoopResult>;
  then: (resolve: ResolveFn, reject?: RejectFn) => Promise<unknown>;
};

function createNoopQuery(): NoopQuery {
  const query: NoopQuery = {
    select: () => query,
    order: () => query,
    eq: () => query,
    neq: () => query,
    not: () => query,
    in: () => query,
    insert: () => emptyResult(),
    update: () => query,
    delete: () => query,
    single: () => emptySingleResult(),
    then: (resolve: ResolveFn, reject?: RejectFn) => emptyResult().then(resolve, reject),
  };
  return query;
}

type BrowserSupabaseClient = ReturnType<typeof createBrowserClient>;

export function createSupabaseBrowserClient(): BrowserSupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      from: () => createNoopQuery(),
      auth: {
        signInWithPassword: () => Promise.resolve({
          data: { user: null, session: null },
          error: missingConfigError,
        }),
        resetPasswordForEmail: () => Promise.resolve({
          data: null,
          error: missingConfigError,
        }),
        updateUser: () => Promise.resolve({
          data: { user: null },
          error: missingConfigError,
        }),
        signOut: () => Promise.resolve({ error: null }),
      },
    } as unknown as BrowserSupabaseClient;
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

export const supabaseBrowser = createSupabaseBrowserClient();
