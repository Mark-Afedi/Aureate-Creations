import { useMutation } from '@tanstack/react-query'
import { supabase, ContactSubmission } from '../lib/supabase'

export const useContactSubmit = () => {
  return useMutation({
    mutationFn: async (submission: ContactSubmission) => {
      const { error } = await supabase
        .from('contact_submissions')
        .insert([submission])

      if (error) {
        console.error('Error submitting contact form:', error)
        throw error
      }
      return { ok: true }
    },
  })
}
