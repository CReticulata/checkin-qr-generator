import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error(
    "[Supabase] SUPABASE_URL is not set. Add it to your environment variables.",
  );
}

if (!supabaseServiceKey) {
  throw new Error(
    "[Supabase] SUPABASE_SERVICE_ROLE_KEY is not set. Add it to your environment variables.",
  );
}

export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  },
);
