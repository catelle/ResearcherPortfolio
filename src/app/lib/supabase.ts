import { createClient } from "@supabase/supabase-js";

let supabaseClient: ReturnType<typeof createClient> | null = null;

function getSupabaseUrl() {
  return (
    import.meta.env.NEXT_PUBLIC_SUPABASE_URL ??
    import.meta.env.VITE_SUPABASE_URL ??
    ""
  );
}

function getSupabaseAnonKey() {
  return (
    import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    import.meta.env.VITE_SUPABASE_ANON_KEY ??
    ""
  );
}

export function isSupabaseConfigured() {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}

export function getSupabaseClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!supabaseClient) {
    supabaseClient = createClient(getSupabaseUrl(), getSupabaseAnonKey());
  }

  return supabaseClient;
}
