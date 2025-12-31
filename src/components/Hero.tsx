import { Satellite, Wifi, Zap } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(220_30%_15%)_0%,hsl(220_25%_6%)_70%)]" />
      
      {/* Animated stars */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-foreground/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Glowing orb */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px] animate-pulse-glow" />

      {/* Satellite illustration */}
      <div className="absolute top-20 right-10 md:right-20 animate-float">
        <div className="relative">
          <Satellite className="w-16 h-16 md:w-24 md:h-24 text-primary" />
          <div className="absolute inset-0 blur-xl bg-primary/30 rounded-full" />
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border mb-8">
          <Wifi className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground">Satellite Internet Bundles</span>
        </div>

        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight">
          <span className="gradient-text">Link NK</span>
          <br />
          <span className="text-foreground">Satellite</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          High-speed satellite internet connectivity. Stay connected anywhere in Kenya with our reliable monthly bundles.
        </p>

        <div className="flex flex-wrap justify-center gap-6 mb-12">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Zap className="w-5 h-5 text-primary" />
            <span>High Speed</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Wifi className="w-5 h-5 text-primary" />
            <span>Reliable Coverage</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Satellite className="w-5 h-5 text-primary" />
            <span>24/7 Support</span>
          </div>
        </div>

        <a
          href="#checkout"
          className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-all duration-300 glow"
        >
          Get Started
          <Zap className="w-5 h-5" />
        </a>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
          <div className="w-1 h-2 rounded-full bg-primary" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
