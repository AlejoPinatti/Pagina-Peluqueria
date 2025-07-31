import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://kfsoybijganbhmmambac.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtmc295YmlqZ2FuYmhtbWFtYmFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MjE1MjUsImV4cCI6MjA2OTQ5NzUyNX0.aY017nb-RSBxkE29eWIW2G_uHRBjLpf6LLkxr4TW8IE"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
