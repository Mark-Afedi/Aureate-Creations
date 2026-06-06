import { useQuery } from '@tanstack/react-query'
import { supabase, Project } from '../lib/supabase'
import { fallbackProjects } from '../data/fallbackContent'

export const useProjects = (category?: string) => {
  return useQuery({
    queryKey: ['projects', category],
    queryFn: async () => {
      let query = supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (category && category !== 'all') {
        query = query.eq('category', category)
      }

      const { data, error } = await query

      if (error) {
        console.warn('Using fallback projects after Supabase error:', error)
        return fallbackProjects.filter(
          (project) => !category || category === 'all' || project.category === category
        )
      }

      return data as Project[]
    },
  })
}
