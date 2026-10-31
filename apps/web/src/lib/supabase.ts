import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** True when the app was built with live Supabase credentials; false = synthetic demo mode. */
export const isLive = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isLive
  ? createClient(url as string, anonKey as string)
  : null;
