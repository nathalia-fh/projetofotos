import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

export type Bar = {
  id: string
  name: string
  slug: string
  instagram: string | null
  owner_whatsapp: string | null
  stripe_customer_id: string | null
  access_code: string
  created_at: string
}

export type Photo = {
  id: string
  bar_id: string
  table_number: number
  storage_path: string
  is_approved: boolean
  aesthetic_score: number | null
  filter_used: string
  created_at: string
}

export type Flirt = {
  id: string
  bar_id: string
  from_table: number
  to_table: number
  message: string
  status: string
  created_at: string
}

export type Coupon = {
  id: string
  bar_id: string
  code: string
  table_number: number
  type: string
  is_used: boolean
  created_at: string
}
