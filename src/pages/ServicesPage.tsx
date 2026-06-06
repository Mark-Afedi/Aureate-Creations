import Services from '../components/layout/Services'

const ServicesPage = () => {
  return (
    <div className="pt-20">
      <Services />
      
      {/* Additional Services Content */}
      <section className="section-padding bg-secondary/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-4xl font-bold mb-6">
            Our <span className="gradient-text">Process</span>
          </h2>
          
          <div className="grid md:grid-cols-4 gap-8 mt-12">
            {[
              { step: '01', title: 'Consultation', desc: 'Understanding your vision and requirements' },
              { step: '02', title: 'Design', desc: 'Creating innovative architectural solutions' },
              { step: '03', title: 'Development', desc: 'Detailed planning and documentation' },
              { step: '04', title: 'Execution', desc: 'Bringing your project to life' },
            ].map((item, index) => (
              <div key={index} className="animate-slide-up">
                <div className="text-5xl font-serif font-bold gradient-text mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default ServicesPage
