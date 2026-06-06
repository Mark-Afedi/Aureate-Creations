import { FormEvent, useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { supabase } from '../lib/supabase'

type AdminProject = {
  id: string
  title: string
  category: 'residential' | 'commercial' | 'sustainable'
  description: string
  image_url: string
  featured: boolean
  progress_percent?: number
  current_phase?: string
}

type AdminService = {
  id: string
  title: string
  description: string
  icon: string
  order_index: number
}

type AdminSubmission = {
  id: string
  name: string
  email: string
  phone: string | null
  message: string
  created_at: string
}

type AdminUser = {
  user_id: string
  email: string
  created_at: string
}

type ProjectAssignment = {
  id: string
  project_id: string
  client_user_id: string
  assigned_at: string
}

type UserRole = {
  user_id: string
  role: 'admin' | 'client'
}

const emptyProject = {
  title: '',
  category: 'residential' as const,
  description: '',
  image_url: '',
  featured: false,
}

const emptyService = {
  title: '',
  description: '',
  icon: 'Building',
  order_index: 0,
}

const AdminPage = () => {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<AdminProject[]>([])
  const [services, setServices] = useState<AdminService[]>([])
  const [submissions, setSubmissions] = useState<AdminSubmission[]>([])
  const [users, setUsers] = useState<AdminUser[]>([])
  const [userRoles, setUserRoles] = useState<UserRole[]>([])
  const [assignments, setAssignments] = useState<ProjectAssignment[]>([])
  const [projectForm, setProjectForm] = useState(emptyProject)
  const [serviceForm, setServiceForm] = useState(emptyService)
  const [assignmentProjectId, setAssignmentProjectId] = useState('')
  const [assignmentUserId, setAssignmentUserId] = useState('')
  const [progressProjectId, setProgressProjectId] = useState('')
  const [progressPhase, setProgressPhase] = useState('Planning')
  const [progressPercent, setProgressPercent] = useState(0)
  const [progressNote, setProgressNote] = useState('')
  const [progressPhoto, setProgressPhoto] = useState<File | null>(null)
  const [submittingProgress, setSubmittingProgress] = useState(false)
  const [projectImageFile, setProjectImageFile] = useState<File | null>(null)
  const [submittingProject, setSubmittingProject] = useState(false)
  const [updatingRoleUserId, setUpdatingRoleUserId] = useState<string | null>(null)
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null)
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAll = useCallback(async () => {
    setLoading(true)
    setError(null)

    const [projectsRes, servicesRes, submissionsRes, usersRes, assignmentsRes, userRolesRes] =
      await Promise.all([
        supabase.from('projects').select('*').order('created_at', { ascending: false }),
        supabase.from('services').select('*').order('order_index', { ascending: true }),
        supabase
          .from('contact_submissions')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50),
        supabase.rpc('list_client_users'),
        supabase
          .from('project_assignments')
          .select('*')
          .order('assigned_at', { ascending: false }),
        supabase.from('user_roles').select('user_id, role'),
      ])

    const firstError =
      projectsRes.error ||
      servicesRes.error ||
      submissionsRes.error ||
      usersRes.error ||
      assignmentsRes.error ||
      userRolesRes.error
    if (firstError) {
      setError(firstError.message)
      setLoading(false)
      return
    }

    setProjects((projectsRes.data as AdminProject[]) || [])
    setServices((servicesRes.data as AdminService[]) || [])
    setSubmissions((submissionsRes.data as AdminSubmission[]) || [])
    setUsers((usersRes.data as AdminUser[]) || [])
    setAssignments((assignmentsRes.data as ProjectAssignment[]) || [])
    setUserRoles((userRolesRes.data as UserRole[]) || [])
    if (!assignmentProjectId && projectsRes.data?.[0]?.id) {
      setAssignmentProjectId(projectsRes.data[0].id)
      setProgressProjectId(projectsRes.data[0].id)
    }
    if (!assignmentUserId && usersRes.data?.[0]?.user_id) {
      setAssignmentUserId(usersRes.data[0].user_id)
    }
    setLoading(false)
  }, [assignmentProjectId, assignmentUserId])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const signOut = async () => {
    await supabase.auth.signOut()
    navigate('/admin/login', { replace: true })
  }

  const submitProject = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmittingProject(true)

    let uploadedProjectImageUrl: string | null = null
    if (projectImageFile) {
      const ext = projectImageFile.name.includes('.')
        ? projectImageFile.name.split('.').pop()
        : 'jpg'
      const safeExt = (ext || 'jpg').toLowerCase()
      const objectPath = `projects/${Date.now()}-${crypto.randomUUID()}.${safeExt}`

      const { error: uploadError } = await supabase.storage
        .from('project-images')
        .upload(objectPath, projectImageFile, {
          upsert: false,
          contentType: projectImageFile.type || 'image/jpeg',
        })

      if (uploadError) {
        setError(uploadError.message)
        setSubmittingProject(false)
        return
      }

      const { data: publicData } = supabase.storage
        .from('project-images')
        .getPublicUrl(objectPath)
      uploadedProjectImageUrl = publicData.publicUrl
    }

    const payload = {
      ...projectForm,
      image_url: uploadedProjectImageUrl || projectForm.image_url,
      category: projectForm.category,
    }

    const result = editingProjectId
      ? await supabase.from('projects').update(payload).eq('id', editingProjectId)
      : await supabase.from('projects').insert([payload])

    if (result.error) {
      setError(result.error.message)
      setSubmittingProject(false)
      return
    }

    setProjectForm(emptyProject)
    setProjectImageFile(null)
    setEditingProjectId(null)
    setSubmittingProject(false)
    loadAll()
  }

  const submitService = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    const payload = {
      ...serviceForm,
      order_index: Number(serviceForm.order_index) || 0,
    }

    const result = editingServiceId
      ? await supabase.from('services').update(payload).eq('id', editingServiceId)
      : await supabase.from('services').insert([payload])

    if (result.error) {
      setError(result.error.message)
      return
    }

    setServiceForm(emptyService)
    setEditingServiceId(null)
    loadAll()
  }

  const editProject = (project: AdminProject) => {
    setEditingProjectId(project.id)
    setProjectForm({
      title: project.title,
      category: project.category,
      description: project.description,
      image_url: project.image_url,
      featured: project.featured,
    })
  }

  const editService = (service: AdminService) => {
    setEditingServiceId(service.id)
    setServiceForm({
      title: service.title,
      description: service.description,
      icon: service.icon,
      order_index: service.order_index,
    })
  }

  const deleteProject = async (id: string) => {
    setError(null)
    const { error: deleteError } = await supabase.from('projects').delete().eq('id', id)
    if (deleteError) {
      setError(deleteError.message)
      return
    }
    loadAll()
  }

  const deleteService = async (id: string) => {
    setError(null)
    const { error: deleteError } = await supabase.from('services').delete().eq('id', id)
    if (deleteError) {
      setError(deleteError.message)
      return
    }
    loadAll()
  }

  const assignClientToProject = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!assignmentProjectId || !assignmentUserId) {
      setError('Select both a project and a client user.')
      return
    }

    const { error: assignError } = await supabase.from('project_assignments').insert([
      {
        project_id: assignmentProjectId,
        client_user_id: assignmentUserId,
      },
    ])

    if (assignError) {
      setError(assignError.message)
      return
    }

    loadAll()
  }

  const removeAssignment = async (id: string) => {
    setError(null)
    const { error: removeError } = await supabase
      .from('project_assignments')
      .delete()
      .eq('id', id)
    if (removeError) {
      setError(removeError.message)
      return
    }
    loadAll()
  }

  const postProgressUpdate = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmittingProgress(true)

    if (!progressProjectId) {
      setError('Select a project for the update.')
      setSubmittingProgress(false)
      return
    }

    const clampedPercent = Math.max(0, Math.min(100, Number(progressPercent) || 0))
    let uploadedPhotoUrl: string | null = null

    if (progressPhoto) {
      const ext = progressPhoto.name.includes('.')
        ? progressPhoto.name.split('.').pop()
        : 'jpg'
      const safeExt = (ext || 'jpg').toLowerCase()
      const objectPath = `progress/${progressProjectId}/${Date.now()}-${crypto.randomUUID()}.${safeExt}`

      const { error: uploadError } = await supabase.storage
        .from('project-progress')
        .upload(objectPath, progressPhoto, {
          upsert: false,
          contentType: progressPhoto.type || 'image/jpeg',
        })

      if (uploadError) {
        setError(uploadError.message)
        setSubmittingProgress(false)
        return
      }

      const { data: publicData } = supabase.storage
        .from('project-progress')
        .getPublicUrl(objectPath)

      uploadedPhotoUrl = publicData.publicUrl
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { error: insertError } = await supabase.from('project_progress_updates').insert([
      {
        project_id: progressProjectId,
        phase: progressPhase,
        progress_percent: clampedPercent,
        note: progressNote || null,
        photo_url: uploadedPhotoUrl,
        created_by: user?.id ?? null,
      },
    ])

    if (insertError) {
      setError(insertError.message)
      setSubmittingProgress(false)
      return
    }

    const { error: projectError } = await supabase
      .from('projects')
      .update({
        progress_percent: clampedPercent,
        current_phase: progressPhase,
      })
      .eq('id', progressProjectId)

    if (projectError) {
      setError(projectError.message)
      setSubmittingProgress(false)
      return
    }

    setProgressNote('')
    setProgressPhoto(null)
    setSubmittingProgress(false)
    loadAll()
  }

  const projectTitleById = (id: string) => projects.find((p) => p.id === id)?.title || id
  const userEmailById = (id: string) => users.find((u) => u.user_id === id)?.email || id
  const userRoleById = (id: string) =>
    userRoles.find((r) => r.user_id === id)?.role || 'client'

  const setRoleForUser = async (userId: string, role: 'admin' | 'client') => {
    setError(null)
    setUpdatingRoleUserId(userId)

    const { error: roleError } = await supabase.from('user_roles').upsert(
      {
        user_id: userId,
        role,
      },
      { onConflict: 'user_id' }
    )

    setUpdatingRoleUserId(null)
    if (roleError) {
      setError(roleError.message)
      return
    }

    loadAll()
  }

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          <Button variant="outline" onClick={signOut}>
            Sign Out
          </Button>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {loading && <p className="text-sm text-muted-foreground">Loading data...</p>}

        <section className="border border-border rounded-lg p-6 bg-card">
          <h2 className="text-xl font-semibold mb-4">User Roles</h2>
          <div className="space-y-3">
            {users.map((user) => {
              const currentRole = userRoleById(user.user_id)
              const promoting = updatingRoleUserId === user.user_id

              return (
                <div
                  key={user.user_id}
                  className="border border-border rounded p-3 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="font-medium">{user.email}</div>
                    <div className="text-xs text-muted-foreground">
                      Current role: {currentRole}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={currentRole === 'admin' ? 'secondary' : 'outline'}
                      disabled={promoting || currentRole === 'admin'}
                      onClick={() => setRoleForUser(user.user_id, 'admin')}
                    >
                      Make Admin
                    </Button>
                    <Button
                      size="sm"
                      variant={currentRole === 'client' ? 'secondary' : 'outline'}
                      disabled={promoting || currentRole === 'client'}
                      onClick={() => setRoleForUser(user.user_id, 'client')}
                    >
                      Make Client
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section className="border border-border rounded-lg p-6 bg-card">
          <h2 className="text-xl font-semibold mb-4">
            {editingProjectId ? 'Edit Project' : 'Add Project'}
          </h2>
          <form onSubmit={submitProject} className="grid md:grid-cols-2 gap-4">
            <Input
              placeholder="Title"
              value={projectForm.title}
              onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
              required
            />
            <select
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={projectForm.category}
              onChange={(e) =>
                setProjectForm({
                  ...projectForm,
                  category: e.target.value as AdminProject['category'],
                })
              }
            >
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value="sustainable">Sustainable</option>
            </select>
            <Input
              placeholder="Image URL"
              value={projectForm.image_url}
              onChange={(e) => setProjectForm({ ...projectForm, image_url: e.target.value })}
            />
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setProjectImageFile(e.target.files?.[0] || null)}
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={projectForm.featured}
                onChange={(e) =>
                  setProjectForm({ ...projectForm, featured: e.target.checked })
                }
              />
              Featured
            </label>
            <Textarea
              className="md:col-span-2"
              placeholder="Description"
              value={projectForm.description}
              onChange={(e) =>
                setProjectForm({ ...projectForm, description: e.target.value })
              }
              required
            />
            <div className="md:col-span-2 flex gap-2">
              <Button type="submit" disabled={submittingProject}>
                {submittingProject
                  ? editingProjectId
                    ? 'Updating...'
                    : 'Creating...'
                  : editingProjectId
                    ? 'Update Project'
                    : 'Create Project'}
              </Button>
              {editingProjectId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingProjectId(null)
                    setProjectForm(emptyProject)
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </section>

        <section className="border border-border rounded-lg p-6 bg-card">
          <h2 className="text-xl font-semibold mb-4">Projects</h2>
          <div className="space-y-3">
            {projects.map((project) => (
              <div key={project.id} className="border border-border rounded p-3">
                <div className="font-medium">{project.title}</div>
                <div className="text-sm text-muted-foreground">{project.category}</div>
                <div className="mt-2 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => editProject(project)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteProject(project.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="border border-border rounded-lg p-6 bg-card">
          <h2 className="text-xl font-semibold mb-4">Assign Client to Project</h2>
          <form onSubmit={assignClientToProject} className="grid md:grid-cols-3 gap-3">
            <select
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={assignmentProjectId}
              onChange={(e) => setAssignmentProjectId(e.target.value)}
              required
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>
            <select
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={assignmentUserId}
              onChange={(e) => setAssignmentUserId(e.target.value)}
              required
            >
              {users.map((user) => (
                <option key={user.user_id} value={user.user_id}>
                  {user.email}
                </option>
              ))}
            </select>
            <Button type="submit">Assign</Button>
          </form>
          <div className="mt-4 space-y-2">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="border border-border rounded p-3">
                <div className="text-sm">
                  <span className="font-medium">{projectTitleById(assignment.project_id)}</span>
                  {' -> '}
                  <span>{userEmailById(assignment.client_user_id)}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Assigned: {new Date(assignment.assigned_at).toLocaleString()}
                </p>
                <Button
                  size="sm"
                  variant="destructive"
                  className="mt-2"
                  onClick={() => removeAssignment(assignment.id)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </section>

        <section className="border border-border rounded-lg p-6 bg-card">
          <h2 className="text-xl font-semibold mb-4">Post Project Progress Update</h2>
          <form onSubmit={postProgressUpdate} className="grid md:grid-cols-2 gap-4">
            <select
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={progressProjectId}
              onChange={(e) => setProgressProjectId(e.target.value)}
              required
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>
            <Input
              placeholder="Phase (e.g. Construction)"
              value={progressPhase}
              onChange={(e) => setProgressPhase(e.target.value)}
              required
            />
            <Input
              type="number"
              min={0}
              max={100}
              placeholder="Progress Percent"
              value={progressPercent}
              onChange={(e) => setProgressPercent(Number(e.target.value))}
              required
            />
            <Textarea
              className="md:col-span-2"
              placeholder="Optional update note"
              value={progressNote}
              onChange={(e) => setProgressNote(e.target.value)}
            />
            <Input
              className="md:col-span-2"
              type="file"
              accept="image/*"
              onChange={(e) => setProgressPhoto(e.target.files?.[0] || null)}
            />
            <div className="md:col-span-2">
              <Button type="submit" disabled={submittingProgress}>
                {submittingProgress ? 'Publishing...' : 'Publish Update'}
              </Button>
            </div>
          </form>
        </section>

        <section className="border border-border rounded-lg p-6 bg-card">
          <h2 className="text-xl font-semibold mb-4">
            {editingServiceId ? 'Edit Service' : 'Add Service'}
          </h2>
          <form onSubmit={submitService} className="grid md:grid-cols-2 gap-4">
            <Input
              placeholder="Title"
              value={serviceForm.title}
              onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
              required
            />
            <Input
              placeholder="Icon (e.g. Building)"
              value={serviceForm.icon}
              onChange={(e) => setServiceForm({ ...serviceForm, icon: e.target.value })}
              required
            />
            <Input
              type="number"
              placeholder="Order Index"
              value={serviceForm.order_index}
              onChange={(e) =>
                setServiceForm({ ...serviceForm, order_index: Number(e.target.value) })
              }
              required
            />
            <Textarea
              className="md:col-span-2"
              placeholder="Description"
              value={serviceForm.description}
              onChange={(e) =>
                setServiceForm({ ...serviceForm, description: e.target.value })
              }
              required
            />
            <div className="md:col-span-2 flex gap-2">
              <Button type="submit">{editingServiceId ? 'Update Service' : 'Create Service'}</Button>
              {editingServiceId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingServiceId(null)
                    setServiceForm(emptyService)
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </section>

        <section className="border border-border rounded-lg p-6 bg-card">
          <h2 className="text-xl font-semibold mb-4">Services</h2>
          <div className="space-y-3">
            {services.map((service) => (
              <div key={service.id} className="border border-border rounded p-3">
                <div className="font-medium">{service.title}</div>
                <div className="text-sm text-muted-foreground">
                  {service.icon} | order {service.order_index}
                </div>
                <div className="mt-2 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => editService(service)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteService(service.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="border border-border rounded-lg p-6 bg-card">
          <h2 className="text-xl font-semibold mb-4">Recent Contact Submissions</h2>
          <div className="space-y-3">
            {submissions.map((submission) => (
              <div key={submission.id} className="border border-border rounded p-3">
                <div className="font-medium">
                  {submission.name} ({submission.email})
                </div>
                {submission.phone && (
                  <div className="text-sm text-muted-foreground">{submission.phone}</div>
                )}
                <p className="text-sm mt-2">{submission.message}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(submission.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export default AdminPage
