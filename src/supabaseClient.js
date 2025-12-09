
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https:
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpdGVyaHRlY3h4a3RueGJsZG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwNjA5MjEsImV4cCI6MjA2ODYzNjkyMX0.rEUfb2BFDiTdTOtalgtS519xSPH8GejBgQYGhQITly0";


export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    
    autoRefreshToken: true,
    
    persistSession: true,
    
    detectSessionInUrl: true,
    
    flowType: 'pkce'
  },
  
  global: {
    headers: {
      'X-Client-Info': 'domufi-web-app'
    }
  }
});


export const auth = supabase.auth;
export const db = supabase;
