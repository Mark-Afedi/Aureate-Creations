import { Button } from '../components/ui/button'
import { useClientProjects } from '../hooks/useClientProjects'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

const PortalPage = () => {
  const navigate = useNavigate()
  const { data, isLoading, error, refetch } = useClientProjects()

  const signOut = async () => {
    await supabase.auth.signOut()
    navigate('/portal/auth', { replace: true })
  }

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold">My Projects</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()}>
              Refresh
            </Button>
            <Button variant="outline" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>

        {isLoading && <p className="text-muted-foreground">Loading your project updates...</p>}
        {error && (
          <p className="text-destructive text-sm">
            Could not load project progress. {(error as Error).message}
          </p>
        )}

        {!isLoading && !error && data?.length === 0 && (
          <div className="border border-border rounded-lg p-6 bg-card">
            <p className="text-muted-foreground">
              No projects are assigned to your account yet.
            </p>
          </div>
        )}

        <div className="space-y-4">
          {data?.map((project) => (
            <div key={project.assignment_id} className="border border-border rounded-lg bg-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">{project.title}</h2>
                  <p className="text-sm text-muted-foreground capitalize">
                    {project.category}
                    {project.location ? ` | ${project.location}` : ''}
                    {project.project_year ? ` | ${project.project_year}` : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">{project.current_phase}</p>
                  <p className="text-xl font-semibold">{project.progress_percent}%</p>
                </div>
              </div>
              <div className="mt-3 h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${Math.max(0, Math.min(100, project.progress_percent))}%` }}
                />
              </div>
              {project.latest_note && (
                <p className="mt-3 text-sm">
                  Latest update: <span className="text-muted-foreground">{project.latest_note}</span>
                </p>
              )}
              {project.latest_photo_url && (
                <img
                  src={project.latest_photo_url}
                  alt={`${project.title} progress`}
                  className="mt-3 w-full max-h-72 object-cover rounded-md border border-border"
                  loading="lazy"
                />
              )}
              {project.latest_update_at && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Updated: {new Date(project.latest_update_at).toLocaleString()}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PortalPage
