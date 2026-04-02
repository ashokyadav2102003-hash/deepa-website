// supabase.js — Supabase connection config
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = 'https://htjuyvlaglzchuwpfiyv.supabase.co'   // ← paste your Project URL
const SUPABASE_KEY = 'sb_publishable_9dwFucxI3EvpoXFbsKTEIA_CaIQCoK7'           // ← paste your Publishable key

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
