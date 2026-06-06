import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export const useAdminAccess = () => {
  return useQuery({
    queryKey: ['admin-access'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('is_current_user_admin')
      if (error) {
        throw error
      }
      return Boolean(data)
    },
  })
}
