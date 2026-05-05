import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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
    in: () => query,
    insert: () => emptyResult(),
    update: () => query,
    delete: () => query,
    single: () => emptySingleResult(),
    then: (resolve: ResolveFn, reject?: RejectFn) => emptyResult().then(resolve, reject),
  };
  return query;
}

export const supabase = url && anonKey
  ? createClient(url, anonKey)
  : ({
      from: () => createNoopQuery(),
      auth: {
        signInWithPassword: () => Promise.resolve({
          data: { user: null, session: null },
          error: { message: "Supabase is not configured for this environment." },
        }),
        resetPasswordForEmail: () => Promise.resolve({
          data: null,
          error: { message: "Supabase is not configured for this environment." },
        }),
        updateUser: () => Promise.resolve({
          data: { user: null },
          error: { message: "Supabase is not configured for this environment." },
        }),
        signOut: () => Promise.resolve({ error: null }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      },
    } as unknown as ReturnType<typeof createClient>);
