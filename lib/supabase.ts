import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

import type { Database } from "@/lib/database.types";
import { previewSupabase } from "@/lib/previewClient";

const isPreview = process.env.EXPO_PUBLIC_PREVIEW === "1";

function createRealClient(): SupabaseClient<Database> {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "EXPO_PUBLIC_SUPABASE_URL et EXPO_PUBLIC_SUPABASE_ANON_KEY doivent être définis (voir .env.example), " +
        "ou passez en mode démo avec EXPO_PUBLIC_PREVIEW=1."
    );
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
}

export const supabase: SupabaseClient<Database> = isPreview
  ? (previewSupabase as SupabaseClient<Database>)
  : createRealClient();
