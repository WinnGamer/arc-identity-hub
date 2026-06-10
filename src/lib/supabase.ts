import { createClient } from '@supabase/supabase-js'

// Public client-side keys (anon key is designed for browser use)
const SUPABASE_URL = 'https://yzwmygnzdphzpslngrqn.supabase.co'
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6d215Z256ZHBoenBzbG5ncnFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwODYxNTEsImV4cCI6MjA5NjY2MjE1MX0.m0A2DGxhmG7r0SW-I0jnIII3iFyZ3SN-FOkG-zZa_Uo'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
