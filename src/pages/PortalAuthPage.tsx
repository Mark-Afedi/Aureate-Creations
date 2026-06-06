import { FormEvent, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { supabase } from '../lib/supabase'
import { useUserSession } from '../hooks/useUserSession'

const PortalAuthPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { session, loading } = useUserSession()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  if (!loading && session) {
    const redirectTo = (location.state as { from?: string } | null)?.from || '/portal'
    return <Navigate to={redirectTo} replace />
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setMessage(null)

    if (mode === 'login') {
      const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })
      setBusy(false)
      if (loginError) {
        setError(loginError.message)
        return
      }
      navigate('/portal', { replace: true })
      return
    }

    const { error: signUpError } = await supabase.auth.signUp({ email, password })
    setBusy(false)
    if (signUpError) {
      setError(signUpError.message)
      return
    }
    setMessage('Account created. Check your email for verification if required.')
  }

  const signInWithProvider = async (provider: 'google' | 'github') => {
    setBusy(true)
    setError(null)
    const { error: providerError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/portal`,
      },
    })
    setBusy(false)
    if (providerError) {
      setError(providerError.message)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-md border border-border rounded-lg p-8 bg-card">
        <h1 className="text-2xl font-semibold mb-2">Client Portal</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Create an account or sign in to track project progress.
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
            minLength={6}
            required
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          {message && <p className="text-sm text-primary">{message}</p>}
          <Button type="submit" className="w-full" disabled={busy}>
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </Button>
        </form>
        <div className="mt-3 flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => signInWithProvider('google')}
            disabled={busy}
          >
            Continue with Google
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => signInWithProvider('github')}
            disabled={busy}
          >
            GitHub
          </Button>
        </div>
        <div className="mt-4 text-sm">
          {mode === 'login' ? (
            <button className="text-primary" onClick={() => setMode('signup')}>
              Need an account? Create one
            </button>
          ) : (
            <button className="text-primary" onClick={() => setMode('login')}>
              Already have an account? Sign in
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default PortalAuthPage
