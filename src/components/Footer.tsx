import { Satellite } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-12 border-t border-border">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Satellite className="w-8 h-8 text-primary" />
            <span className="font-display text-xl font-bold gradient-text">
              Link NK Satellite
            </span>
          </div>

          <p className="text-muted-foreground text-sm text-center md:text-right">
            © {new Date().getFullYear()} Link NK Satellite. All rights reserved.
            <br />
            <span className="text-xs">Powered by M-Pesa</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
