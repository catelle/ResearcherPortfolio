import { createClient } from "@supabase/supabase-js";

function getSupabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? "";
}

function getSupabaseAnonKey() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.VITE_SUPABASE_ANON_KEY ??
    ""
  );
}

export function isSupabaseConfigured() {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}

function getSupabaseServerClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  return createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function verifyAccessToken(token) {
  const client = getSupabaseServerClient();

  if (!client) {
    throw new Error("Supabase is not configured.");
  }

  if (!token) {
    return null;
  }

  const {
    data: { user },
    error,
  } = await client.auth.getUser(token);

  if (error) {
    return null;
  }

  return user ?? null;
}
