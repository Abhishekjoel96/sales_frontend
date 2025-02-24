
// src/config/supabase.ts
import { createClient } from '@supabase/supabase-js';

// These should be defined in your .env file, even if you don't use them here.
// Using VITE_ prefix for frontend environment variables.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;


// Initialize the Supabase client ONLY if the environment variables are present.
// This prevents errors if you're not using Supabase on the frontend.
let supabase: any = null; // Use 'any' for now, since we may not initialize

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
    console.warn("Supabase URL or Anon Key is missing. Supabase client not initialized on the frontend.");
}


export { supabase };
