import type { Project, Service } from '../lib/supabase'

export const fallbackServices: Service[] = [
  {
    id: 'fallback-service-architecture',
    title: 'Architectural Design',
    description:
      'Complete concept development, planning, and design documentation for residential and commercial spaces.',
    icon: 'Building',
    order_index: 1,
    created_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'fallback-service-interiors',
    title: 'Interior Planning',
    description:
      'Refined interior layouts, finishes, and spatial details that align function with lasting visual character.',
    icon: 'Home',
    order_index: 2,
    created_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'fallback-service-sustainable',
    title: 'Sustainable Solutions',
    description:
      'Energy-conscious design strategies, material guidance, and site planning for responsible building outcomes.',
    icon: 'Leaf',
    order_index: 3,
    created_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'fallback-service-documentation',
    title: 'Technical Documentation',
    description:
      'Precise drawings, specifications, and coordination support for approvals, pricing, and construction.',
    icon: 'Ruler',
    order_index: 4,
    created_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'fallback-service-consulting',
    title: 'Design Consulting',
    description:
      'Focused advisory sessions for feasibility, project direction, renovation strategy, and design decisions.',
    icon: 'PenTool',
    order_index: 5,
    created_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'fallback-service-construction',
    title: 'Construction Support',
    description:
      'Site-stage coordination and design review to help the built result stay aligned with the approved vision.',
    icon: 'Construction',
    order_index: 6,
    created_at: '2026-01-01T00:00:00.000Z',
  },
]

export const fallbackProjects: Project[] = [
  {
    id: 'fallback-project-villa',
    title: 'Aureate Villa',
    category: 'residential',
    description:
      'A warm contemporary residence organized around natural light, private courtyards, and refined material transitions.',
    image_url:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
    featured: true,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'fallback-project-atelier',
    title: 'The Atelier Offices',
    category: 'commercial',
    description:
      'A compact workplace concept with flexible studios, client-facing meeting rooms, and calm shared amenities.',
    image_url:
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200&q=80',
    featured: true,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'fallback-project-courtyard',
    title: 'Courtyard House',
    category: 'sustainable',
    description:
      'A shaded family home designed for passive cooling, cross ventilation, and a close connection to landscape.',
    image_url:
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=80',
    featured: true,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
]
