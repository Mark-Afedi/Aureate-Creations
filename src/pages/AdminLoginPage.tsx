import { FormEvent, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { supabase } from '../lib/supabase'
import { useAdminSession } from '../hooks/useAdminSession'
import { useAdminAccess } from '../hooks/useAdminAccess'

const AdminLoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { session, loading } = useAdminSession()
  const { data: isAdmin, isLoading: adminLoading } = useAdminAccess()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!loading && !adminLoading && session && isAdmin) {
    const redirectTo = (location.state as { from?: string } | null)?.from || '/admin'
    return <Navigate to={redirectTo} replace />
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setSubmitting(false)
    if (signInError) {
      setError(signInError.message)
      return
    }

    const { data: adminResult, error: adminError } = await supabase.rpc(
      'is_current_user_admin'
    )
    if (adminError || !adminResult) {
      await supabase.auth.signOut()
      setError('This account does not have admin access.')
      return
    }

    navigate('/admin', { replace: true })
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-md border border-border rounded-lg p-8 bg-card">
        <h1 className="text-2xl font-semibold mb-2">Admin Login</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Sign in to manage projects, services, and contact submissions.
        </p>
        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </div>
    </div>
  )
}

export default AdminLoginPage
