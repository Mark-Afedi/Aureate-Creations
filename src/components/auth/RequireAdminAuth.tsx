import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAdminSession } from '../../hooks/useAdminSession'
import { useAdminAccess } from '../../hooks/useAdminAccess'

const RequireAdminAuth = () => {
  const { session, loading } = useAdminSession()
  const {
    data: isAdmin,
    isLoading: adminCheckLoading,
    error: adminCheckError,
  } = useAdminAccess()
  const location = useLocation()

  if (loading || adminCheckLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Checking admin session...</p>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }

  if (adminCheckError || !isAdmin) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default RequireAdminAuth
