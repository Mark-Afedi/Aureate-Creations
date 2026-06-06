import { useState } from 'react'
import { Card } from '../ui/card'
import { useProjects } from '../../hooks/useProjects'
import { Loader2 } from 'lucide-react'

const Portfolio = () => {
  const [filter, setFilter] = useState('all')
  const { data: projects, isLoading, error } = useProjects(filter)

  const categories = [
    { id: 'all', label: 'All Projects' },
    { id: 'residential', label: 'Residential' },
    { id: 'commercial', label: 'Commercial' },
    { id: 'sustainable', label: 'Sustainable' },
  ]

  if (error) {
    return (
      <section id="portfolio" className="section-padding bg-secondary/30">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-destructive">Error loading projects. Please try again later.</p>
        </div>
      </section>
    )
  }

  return (
    <section id="portfolio" className="section-padding bg-secondary/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            Featured <span className="gradient-text">Projects</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Explore our portfolio of award-winning architectural masterpieces.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-12 animate-slide-up">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setFilter(category.id)}
              disabled={isLoading}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-300 disabled:opacity-50 ${
                filter === category.id
                  ? 'gradient-gold text-white shadow-lg'
                  : 'bg-secondary text-foreground hover:bg-muted'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Projects Grid */}
        {!isLoading && projects && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 animate-scale-in">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <div className="relative overflow-hidden aspect-[4/3]">
                  <img
                    src={project.image_url}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <h3 className="font-serif text-2xl font-bold mb-2">
                        {project.title}
                      </h3>
                      <p className="text-sm text-white/90">{project.description}</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-serif text-xl font-bold mb-1">
                    {project.title}
                  </h3>
                  <p className="text-sm text-muted-foreground capitalize">
                    {project.category}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default Portfolio
