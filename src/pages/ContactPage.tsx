import Contact from '../components/layout/Contact'

const ContactPage = () => {
  return (
    <div className="pt-20">
      <div className="section-padding text-center bg-secondary/30">
        <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
          Get in <span className="gradient-text">Touch</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-3xl mx-auto animate-slide-up">
          Ready to bring your architectural vision to life? Our team is here to
          help you every step of the way.
        </p>
      </div>
      
      <Contact />
    </div>
  )
}

export default ContactPage
