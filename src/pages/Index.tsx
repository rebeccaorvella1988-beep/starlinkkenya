import Hero from "@/components/Hero";
import BundleCard from "@/components/BundleCard";
import CheckoutForm from "@/components/CheckoutForm";
import Footer from "@/components/Footer";

const Index = () => {
  const scrollToCheckout = () => {
    document.getElementById("checkout")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Hero />
      
      {/* Bundle Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(190_95%_50%_/_0.05)_0%,transparent_50%)]" />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Our <span className="gradient-text">Bundle</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Simple, affordable satellite internet for everyone
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <BundleCard onSelect={scrollToCheckout} />
          </div>
        </div>
      </section>

      <CheckoutForm />
      <Footer />
    </div>
  );
};

export default Index;
