import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export type ClientProjectTracking = {
  assignment_id: string
  project_id: string
  title: string
  category: string
  image_url: string
  location: string | null
  project_year: number | null
  progress_percent: number
  current_phase: string
  latest_note: string | null
  latest_photo_url: string | null
  latest_update_at: string | null
}

export const useClientProjects = () => {
  return useQuery({
    queryKey: ['client-projects'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_my_project_tracking')
      if (error) {
        throw error
      }
      return (data || []) as ClientProjectTracking[]
    },
  })
}
