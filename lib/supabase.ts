// Supabase client utilities
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY!;

// Client-side Supabase client (uses publishable key)
export const supabase = createClient(supabaseUrl, supabasePublishableKey);

// Server-side Supabase client (uses secret key — never expose to browser)
export const supabaseAdmin = createClient(supabaseUrl, supabaseSecretKey);
