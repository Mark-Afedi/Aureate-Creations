-- Supabase DB initialization for Aureate Creations.
-- Run this in the Supabase SQL Editor.
--
-- Important:
-- RLS is intentionally disabled because the project owner requested it.
-- Without RLS, access is controlled by table grants below. Keep contact_submissions
-- write-only for public clients and do not grant public SELECT on that table.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('admin', 'client')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS user_roles_role_idx ON public.user_roles(role);

CREATE OR REPLACE FUNCTION public.is_admin_user(target_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = target_user_id
      AND ur.role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_admin_user(auth.uid());
$$;

REVOKE ALL ON FUNCTION public.is_admin_user(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_current_user_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_current_user_admin() TO authenticated;

-- Shared updated_at trigger.
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Projects table.
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE,
  title text NOT NULL,
  category text NOT NULL CHECK (category IN ('residential', 'commercial', 'sustainable')),
  description text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  location text,
  project_year integer CHECK (
    project_year IS NULL OR project_year BETWEEN 1900 AND EXTRACT(YEAR FROM now())::integer + 5
  ),
  featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS project_year integer,
  ADD COLUMN IF NOT EXISTS progress_percent integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS current_phase text NOT NULL DEFAULT 'Planning';

ALTER TABLE public.projects
  ALTER COLUMN description SET DEFAULT '',
  ALTER COLUMN image_url SET DEFAULT '',
  ALTER COLUMN featured SET DEFAULT false,
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN updated_at SET DEFAULT now();

CREATE UNIQUE INDEX IF NOT EXISTS projects_slug_key
  ON public.projects (slug)
  WHERE slug IS NOT NULL;

CREATE INDEX IF NOT EXISTS projects_category_idx ON public.projects (category);
CREATE INDEX IF NOT EXISTS projects_featured_idx ON public.projects (featured);
CREATE INDEX IF NOT EXISTS projects_created_at_idx ON public.projects (created_at DESC);
CREATE INDEX IF NOT EXISTS projects_progress_percent_idx ON public.projects (progress_percent);

DROP TRIGGER IF EXISTS set_projects_updated_at ON public.projects;
CREATE TRIGGER set_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Services table.
CREATE TABLE IF NOT EXISTS public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT 'Building',
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.services
  ALTER COLUMN description SET DEFAULT '',
  ALTER COLUMN icon SET DEFAULT 'Building',
  ALTER COLUMN order_index SET DEFAULT 0,
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN updated_at SET DEFAULT now();

CREATE UNIQUE INDEX IF NOT EXISTS services_slug_key
  ON public.services (slug)
  WHERE slug IS NOT NULL;

CREATE INDEX IF NOT EXISTS services_order_index_idx ON public.services (order_index);

DROP TRIGGER IF EXISTS set_services_updated_at ON public.services;
CREATE TRIGGER set_services_updated_at
BEFORE UPDATE ON public.services
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Project assignments for client portal tracking.
CREATE TABLE IF NOT EXISTS public.project_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  client_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, client_user_id)
);

CREATE INDEX IF NOT EXISTS project_assignments_client_idx
  ON public.project_assignments (client_user_id);

CREATE INDEX IF NOT EXISTS project_assignments_project_idx
  ON public.project_assignments (project_id);

-- Timeline-style progress updates per project.
CREATE TABLE IF NOT EXISTS public.project_progress_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  phase text NOT NULL,
  progress_percent integer NOT NULL DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
  note text,
  photo_url text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.project_progress_updates
  ADD COLUMN IF NOT EXISTS photo_url text;

CREATE INDEX IF NOT EXISTS project_progress_updates_project_idx
  ON public.project_progress_updates (project_id, created_at DESC);

-- Contact submissions table.
CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (length(trim(name)) >= 2),
  email text NOT NULL CHECK (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'),
  phone text,
  message text NOT NULL CHECK (length(trim(message)) >= 10),
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'archived')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_submissions
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'new';

CREATE INDEX IF NOT EXISTS contact_submissions_created_at_idx
  ON public.contact_submissions (created_at DESC);

CREATE INDEX IF NOT EXISTS contact_submissions_status_idx
  ON public.contact_submissions (status);

-- Enable RLS for production hardening.
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_progress_updates ENABLE ROW LEVEL SECURITY;

-- Remove older policies from previous versions of this script.
DROP POLICY IF EXISTS "Allow anon select on projects" ON public.projects;
DROP POLICY IF EXISTS "Allow anon select on services" ON public.services;
DROP POLICY IF EXISTS "Allow anonymous inserts" ON public.contact_submissions;
DROP POLICY IF EXISTS "Allow select for admins" ON public.contact_submissions;
DROP POLICY IF EXISTS "Projects public read" ON public.projects;
DROP POLICY IF EXISTS "Projects admin write" ON public.projects;
DROP POLICY IF EXISTS "Services public read" ON public.services;
DROP POLICY IF EXISTS "Services admin write" ON public.services;
DROP POLICY IF EXISTS "Contact anon insert" ON public.contact_submissions;
DROP POLICY IF EXISTS "Contact admin read update" ON public.contact_submissions;
DROP POLICY IF EXISTS "Contact admin update" ON public.contact_submissions;
DROP POLICY IF EXISTS "Assignments admin full access" ON public.project_assignments;
DROP POLICY IF EXISTS "Progress admin full access" ON public.project_progress_updates;
DROP POLICY IF EXISTS "User roles self read" ON public.user_roles;
DROP POLICY IF EXISTS "User roles admin full access" ON public.user_roles;

-- Public API permissions.
-- These are deliberately narrow even with RLS disabled.
REVOKE ALL ON public.projects FROM anon, authenticated;
REVOKE ALL ON public.services FROM anon, authenticated;
REVOKE ALL ON public.contact_submissions FROM anon, authenticated;
REVOKE ALL ON public.project_assignments FROM anon, authenticated;
REVOKE ALL ON public.project_progress_updates FROM anon, authenticated;
REVOKE ALL ON public.user_roles FROM anon, authenticated;

GRANT SELECT ON public.projects TO anon, authenticated;
GRANT SELECT ON public.services TO anon, authenticated;
GRANT INSERT ON public.contact_submissions TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contact_submissions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_assignments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_progress_updates TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;

CREATE POLICY "Projects public read" ON public.projects
  FOR SELECT
  USING (true);

CREATE POLICY "Projects admin write" ON public.projects
  FOR ALL
  USING (public.is_admin_user(auth.uid()))
  WITH CHECK (public.is_admin_user(auth.uid()));

CREATE POLICY "Services public read" ON public.services
  FOR SELECT
  USING (true);

CREATE POLICY "Services admin write" ON public.services
  FOR ALL
  USING (public.is_admin_user(auth.uid()))
  WITH CHECK (public.is_admin_user(auth.uid()));

CREATE POLICY "Contact anon insert" ON public.contact_submissions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Contact admin read update" ON public.contact_submissions
  FOR SELECT
  USING (public.is_admin_user(auth.uid()));

CREATE POLICY "Contact admin update" ON public.contact_submissions
  FOR UPDATE
  USING (public.is_admin_user(auth.uid()))
  WITH CHECK (public.is_admin_user(auth.uid()));

CREATE POLICY "Assignments admin full access" ON public.project_assignments
  FOR ALL
  USING (public.is_admin_user(auth.uid()))
  WITH CHECK (public.is_admin_user(auth.uid()));

CREATE POLICY "Progress admin full access" ON public.project_progress_updates
  FOR ALL
  USING (public.is_admin_user(auth.uid()))
  WITH CHECK (public.is_admin_user(auth.uid()));

CREATE POLICY "User roles self read" ON public.user_roles
  FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin_user(auth.uid()));

CREATE POLICY "User roles admin full access" ON public.user_roles
  FOR ALL
  USING (public.is_admin_user(auth.uid()))
  WITH CHECK (public.is_admin_user(auth.uid()));

-- Restrict client access to own project tracking through RPC.
CREATE OR REPLACE FUNCTION public.get_my_project_tracking()
RETURNS TABLE (
  assignment_id uuid,
  project_id uuid,
  title text,
  category text,
  image_url text,
  location text,
  project_year integer,
  progress_percent integer,
  current_phase text,
  latest_note text,
  latest_photo_url text,
  latest_update_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    pa.id AS assignment_id,
    p.id AS project_id,
    p.title,
    p.category,
    p.image_url,
    p.location,
    p.project_year,
    COALESCE(u.progress_percent, p.progress_percent, 0) AS progress_percent,
    COALESCE(u.phase, p.current_phase, 'Planning') AS current_phase,
    u.note AS latest_note,
    u.photo_url AS latest_photo_url,
    u.created_at AS latest_update_at
  FROM public.project_assignments pa
  JOIN public.projects p ON p.id = pa.project_id
  LEFT JOIN LATERAL (
    SELECT
      ppu.progress_percent,
      ppu.phase,
      ppu.note,
      ppu.photo_url,
      ppu.created_at
    FROM public.project_progress_updates ppu
    WHERE ppu.project_id = pa.project_id
    ORDER BY ppu.created_at DESC
    LIMIT 1
  ) u ON true
  WHERE pa.client_user_id = auth.uid()
  ORDER BY p.updated_at DESC;
$$;

REVOKE ALL ON FUNCTION public.get_my_project_tracking() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_project_tracking() TO authenticated;

CREATE OR REPLACE FUNCTION public.list_client_users()
RETURNS TABLE (
  user_id uuid,
  email text,
  created_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    u.id AS user_id,
    u.email::text AS email,
    u.created_at
  FROM auth.users u
  WHERE public.is_admin_user(auth.uid())
  ORDER BY u.created_at DESC;
$$;

REVOKE ALL ON FUNCTION public.list_client_users() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_client_users() TO authenticated;

-- Storage buckets for project media.
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('project-images', 'project-images', true),
  ('project-progress', 'project-progress', true)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public;

-- Storage policies (idempotent refresh).
DROP POLICY IF EXISTS "Project images public read" ON storage.objects;
DROP POLICY IF EXISTS "Project images admin write" ON storage.objects;
DROP POLICY IF EXISTS "Project images admin delete" ON storage.objects;
DROP POLICY IF EXISTS "Project progress public read" ON storage.objects;
DROP POLICY IF EXISTS "Project progress admin write" ON storage.objects;
DROP POLICY IF EXISTS "Project progress admin delete" ON storage.objects;

CREATE POLICY "Project images public read"
ON storage.objects
FOR SELECT
USING (bucket_id = 'project-images');

CREATE POLICY "Project images admin write"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'project-images'
  AND public.is_admin_user(auth.uid())
);

CREATE POLICY "Project images admin delete"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'project-images'
  AND public.is_admin_user(auth.uid())
);

CREATE POLICY "Project progress public read"
ON storage.objects
FOR SELECT
USING (bucket_id = 'project-progress');

CREATE POLICY "Project progress admin write"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'project-progress'
  AND public.is_admin_user(auth.uid())
);

CREATE POLICY "Project progress admin delete"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'project-progress'
  AND public.is_admin_user(auth.uid())
);

-- Seed services.
INSERT INTO public.services (slug, title, description, icon, order_index)
VALUES
  (
    'architectural-design',
    'Architectural Design',
    'Complete concept development, planning, and design documentation for residential and commercial spaces.',
    'Building',
    1
  ),
  (
    'interior-planning',
    'Interior Planning',
    'Refined interior layouts, finishes, and spatial details that align function with lasting visual character.',
    'Home',
    2
  ),
  (
    'sustainable-solutions',
    'Sustainable Solutions',
    'Energy-conscious design strategies, material guidance, and site planning for responsible building outcomes.',
    'Leaf',
    3
  ),
  (
    'technical-documentation',
    'Technical Documentation',
    'Precise drawings, specifications, and coordination support for approvals, pricing, and construction.',
    'Ruler',
    4
  ),
  (
    'design-consulting',
    'Design Consulting',
    'Focused advisory sessions for feasibility, project direction, renovation strategy, and design decisions.',
    'PenTool',
    5
  ),
  (
    'construction-support',
    'Construction Support',
    'Site-stage coordination and design review to help the built result stay aligned with the approved vision.',
    'Construction',
    6
  )
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  order_index = EXCLUDED.order_index,
  updated_at = now();

-- Seed projects.
INSERT INTO public.projects (
  slug,
  title,
  category,
  description,
  image_url,
  location,
  project_year,
  featured
)
VALUES
  (
    'aureate-villa',
    'Aureate Villa',
    'residential',
    'A warm contemporary residence organized around natural light, private courtyards, and refined material transitions.',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
    'Accra, Ghana',
    2025,
    true
  ),
  (
    'atelier-offices',
    'The Atelier Offices',
    'commercial',
    'A compact workplace concept with flexible studios, client-facing meeting rooms, and calm shared amenities.',
    'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200&q=80',
    'Achimota, Ghana',
    2025,
    true
  ),
  (
    'courtyard-house',
    'Courtyard House',
    'sustainable',
    'A shaded family home designed for passive cooling, cross ventilation, and a close connection to landscape.',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=80',
    'Eastern Region, Ghana',
    2024,
    true
  )
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  location = EXCLUDED.location,
  project_year = EXCLUDED.project_year,
  featured = EXCLUDED.featured,
  updated_at = now();
