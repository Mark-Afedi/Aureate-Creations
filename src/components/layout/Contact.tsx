import { useRef, useState } from 'react'
import { Mail, Phone, MapPin, Send, Loader2 } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { useToast } from '../../hooks/use-toast'
import { useContactSubmit } from '../../hooks/useContactSubmit'

const Contact = () => {
  const { toast } = useToast()
  const { mutate: submitContact, isPending } = useContactSubmit()
  const loadedAtRef = useRef(Date.now())
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    website: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Basic anti-spam checks:
    // 1) honeypot field should stay empty
    // 2) require a minimal human fill time
    const elapsedMs = Date.now() - loadedAtRef.current
    if (formData.website || elapsedMs < 2500) {
      toast({
        title: 'Unable to send',
        description: 'Please try again in a moment.',
        variant: 'destructive',
      })
      return
    }

    const { website, ...submission } = formData

    submitContact(submission, {
      onSuccess: () => {
        toast({
          title: 'Message Sent!',
          description: "Thank you for contacting us. We'll get back to you soon.",
        })
        setFormData({ name: '', email: '', phone: '', message: '', website: '' })
      },
      onError: (error: Error) => {
        toast({
          title: 'Error',
          description: error.message || 'Failed to send message. Please try again.',
          variant: 'destructive',
        })
      },
    })
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const contactInfo = [
    {
      icon: Phone,
      title: 'Phone',
      content: '+233 554198272',
      link: 'tel:+233 554198272',
    },
    {
      icon: Mail,
      title: 'Email',
      content: 'info@aureate-creations.com',
      link: 'mailto:info@aureate-creations.com',
    },
    {
      icon: MapPin,
      title: 'Address',
      content: 'Achimota-Old Station Avenue',
      link: '#',
    },
  ]

  return (
    <section id="contact" className="section-padding">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            Let's <span className="gradient-text">Connect</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Ready to start your architectural journey? Get in touch with our team
            today.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 animate-slide-up">
          {/* Contact Info */}
          <div>
            <h3 className="font-serif text-2xl font-bold mb-6">Get in Touch</h3>
            <div className="space-y-6 mb-8">
              {contactInfo.map((info, index) => {
                const Icon = info.icon
                return (
                  <a
                    key={index}
                    href={info.link}
                    className="flex items-start gap-4 group"
                  >
                    <div className="w-12 h-12 gradient-gold rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground mb-1">
                        {info.title}
                      </div>
                      <div className="text-muted-foreground">{info.content}</div>
                    </div>
                  </a>
                )
              })}
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="font-semibold mb-2">Office Hours</h4>
              <p className="text-muted-foreground text-sm mb-2">
                Monday - Friday: 9:00 AM - 6:00 PM
              </p>
              <p className="text-muted-foreground text-sm">
                Saturday: 10:00 AM - 4:00 PM
              </p>
              <p className="text-muted-foreground text-sm">Sunday: Closed</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-card border border-border rounded-lg p-8">
            <h3 className="font-serif text-2xl font-bold mb-6">
              Send us a Message
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="hidden" aria-hidden="true">
                <Input
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={formData.website}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Input
                  name="name"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Input
                  name="email"
                  type="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Input
                  name="phone"
                  type="tel"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Textarea
                  name="message"
                  placeholder="Tell us about your project..."
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full gradient-gold text-white font-semibold hover:opacity-90"
                size="lg"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message
                    <Send className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Contact
