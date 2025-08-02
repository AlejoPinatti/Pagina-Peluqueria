import { createClient } from "@supabase/supabase-js"

// Temporalmente hardcodeado para probar
const supabaseUrl = "https://nilkxgsljqohiskpetoz.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pbGt4Z3NsanFvaGlza3BldG96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwODc0NzYsImV4cCI6MjA2OTY2MzQ3Nn0.N7f39WulV46FDv6FSHkgawZ75cXiHWLC_2HwAiDdXZU"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
