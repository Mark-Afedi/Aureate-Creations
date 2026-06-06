import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

const fallbackSupabaseUrl = 'https://invalid-project-ref.supabase.co'
const fallbackSupabaseAnonKey = 'invalid-anon-key'

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase environment variables are missing. Falling back to placeholder client.'
  )
}

export const supabase = createClient(
  supabaseUrl ?? fallbackSupabaseUrl,
  supabaseAnonKey ?? fallbackSupabaseAnonKey
)

// Database types
export interface Project {
  id: string
  title: string
  category: 'residential' | 'commercial' | 'sustainable'
  description: string
  image_url: string
  location?: string | null
  project_year?: number | null
  progress_percent?: number
  current_phase?: string
  featured: boolean
  created_at: string
  updated_at: string
}

export interface Service {
  id: string
  title: string
  description: string
  icon: string
  order_index: number
  created_at: string
}

export interface ContactSubmission {
  id?: string
  name: string
  email: string
  phone?: string
  message: string
  created_at?: string
}
