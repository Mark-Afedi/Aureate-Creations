import { useQuery } from '@tanstack/react-query'
import { supabase, Service } from '../lib/supabase'
import { fallbackServices } from '../data/fallbackContent'

export const useServices = () => {
  return useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('order_index', { ascending: true })

      if (error) {
        console.warn('Using fallback services after Supabase error:', error)
        return fallbackServices
      }

      return data as Service[]
    },
  })
}
