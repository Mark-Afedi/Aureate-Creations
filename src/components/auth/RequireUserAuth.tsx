import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useUserSession } from '../../hooks/useUserSession'

const RequireUserAuth = () => {
  const { session, loading } = useUserSession()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Checking session...</p>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/portal/auth" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}

export default RequireUserAuth
