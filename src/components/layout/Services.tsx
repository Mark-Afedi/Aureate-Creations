import { Home, Building, Leaf, PenTool, Ruler, Construction, Loader2, type LucideIcon } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { useServices } from '../../hooks/useServices'

const iconMap: Record<string, LucideIcon> = {
  Home,
  Building,
  Leaf,
  PenTool,
  Ruler,
  Construction,
}

const Services = () => {
  const { data: services, isLoading, error } = useServices()

  if (error) {
    return (
      <section id="services" className="section-padding">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-destructive">Error loading services. Please try again later.</p>
        </div>
      </section>
    )
  }

  return (
    <section id="services" className="section-padding">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            Our <span className="gradient-text">Services</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Comprehensive architectural solutions tailored to transform your vision
            into exceptional built environments.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
            {services?.map((service) => {
              const Icon = iconMap[service.icon] || Building
              return (
                <Card
                  key={service.id}
                  className="group hover:border-primary transition-all duration-300 hover:scale-105 hover:shadow-xl"
                >
                  <CardHeader>
                    <div className="w-12 h-12 gradient-gold rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {service.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

export default Services
