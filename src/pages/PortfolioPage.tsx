import Portfolio from '../components/layout/Portfolio'

const PortfolioPage = () => {
  return (
    <div className="pt-20">
      <div className="section-padding text-center">
        <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
          Our <span className="gradient-text">Portfolio</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-3xl mx-auto animate-slide-up">
          Explore our collection of award-winning projects that showcase our
          commitment to excellence, innovation, and timeless design.
        </p>
      </div>
      
      <Portfolio />
    </div>
  )
}

export default PortfolioPage
