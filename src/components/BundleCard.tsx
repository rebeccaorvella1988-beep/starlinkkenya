import { Check, Satellite } from "lucide-react";

interface BundleCardProps {
  onSelect: () => void;
}

const BundleCard = ({ onSelect }: BundleCardProps) => {
  const features = [
    "Unlimited satellite internet",
    "High-speed connectivity",
    "24/7 customer support",
    "No installation fees",
    "Nationwide coverage",
    "Free router included",
  ];

  return (
    <div className="relative group">
      {/* Glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
      
      <div className="relative bg-card rounded-2xl p-8 border border-border">
        {/* Popular badge */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <div className="px-4 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-full">
            Best Value
          </div>
        </div>

        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <Satellite className="w-16 h-16 text-primary" />
            <div className="absolute inset-0 blur-xl bg-primary/30 rounded-full" />
          </div>
        </div>

        <h3 className="font-display text-2xl font-bold text-center mb-2">
          Monthly Bundle
        </h3>
        
        <p className="text-muted-foreground text-center mb-6">
          Everything you need for reliable connectivity
        </p>

        <div className="text-center mb-8">
          <span className="text-5xl font-display font-bold gradient-text">400</span>
          <span className="text-2xl font-display font-bold gradient-text"> KSH</span>
          <p className="text-muted-foreground mt-1">per month</p>
        </div>

        <ul className="space-y-4 mb-8">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-primary" />
              </div>
              <span className="text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>

        <button
          onClick={onSelect}
          className="w-full py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-all duration-300 glow"
        >
          Subscribe Now
        </button>
      </div>
    </div>
  );
};

export default BundleCard;
