import About from '../components/layout/About'

const AboutPage = () => {
  return (
    <div className="pt-20">
      <About />
      
      {/* Additional About Content */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h3 className="font-serif text-3xl font-bold mb-6">
                Our <span className="gradient-text">Vision</span>
              </h3>
              <p className="text-muted-foreground text-lg mb-4">
                To revolutionize the built environment by creating architectural
                solutions that inspire, endure, and enhance the human experience.
              </p>
              <p className="text-muted-foreground text-lg">
                We envision a future where every structure tells a story, serves a
                purpose, and contributes positively to its community and environment.
              </p>
            </div>
            
            <div className="animate-fade-in">
              <h3 className="font-serif text-3xl font-bold mb-6">
                Our <span className="gradient-text">Mission</span>
              </h3>
              <p className="text-muted-foreground text-lg mb-4">
                To deliver exceptional architectural design that balances aesthetics,
                functionality, and sustainability while exceeding client expectations.
              </p>
              <p className="text-muted-foreground text-lg">
                Through innovation, collaboration, and attention to detail, we
                transform ideas into iconic structures that stand the test of time.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutPage
