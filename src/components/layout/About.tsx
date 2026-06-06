import { Award, Users, Building2, Lightbulb } from 'lucide-react'

const About = () => {
  const stats = [
    { icon: Building2, value: '250+', label: 'Projects Completed' },
    { icon: Users, value: '50+', label: 'Expert Architects' },
    { icon: Award, value: '35+', label: 'Awards Won' },
    { icon: Lightbulb, value: '15+', label: 'Years Experience' },
  ]

  return (
    <section id="about" className="section-padding bg-secondary/30">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div className="animate-fade-in">
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6">
              Building Tomorrow's
              <span className="gradient-text"> Landmarks</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-4">
              At Aureate Creations, we believe architecture is more than
              structures—it's about creating experiences, shaping communities,
              and building legacies that stand the test of time.
            </p>
            <p className="text-muted-foreground text-lg">
              Our team of visionary architects and designers combine cutting-edge
              technology with timeless design principles to deliver projects that
              exceed expectations and inspire generations.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 animate-slide-up">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div
                  key={index}
                  className="bg-card p-6 rounded-lg border border-border hover:border-primary transition-all duration-300 hover:scale-105"
                >
                  <Icon className="w-8 h-8 text-primary mb-4" />
                  <div className="font-serif text-3xl font-bold gradient-text mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

export default About
