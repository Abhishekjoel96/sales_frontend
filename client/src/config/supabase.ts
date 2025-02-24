// src/config/supabase.ts
// For this project Supabase is only used in backend.
import { createClient } from '@supabase/supabase-js';  // Corrected import

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;  // Corrected: Use import.meta.env
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY; // Corrected

let supabase: any = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
    console.warn("Supabase URL or Anon Key is missing. Supabase client not initialized on the frontend.");
}


export { supabase };
