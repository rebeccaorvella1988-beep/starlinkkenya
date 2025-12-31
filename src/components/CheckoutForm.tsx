import { useState } from "react";
import { Phone, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const CheckoutForm = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const { toast } = useToast();

  const formatPhoneNumber = (value: string) => {
    // Remove non-digits
    const digits = value.replace(/\D/g, "");
    return digits.slice(0, 12);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber || phoneNumber.length < 9) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid M-Pesa phone number",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setStatus("idle");

    try {
      const { data, error } = await supabase.functions.invoke("mpesa-stk-push", {
        body: {
          phoneNumber: phoneNumber,
          amount: 400,
        },
      });

      if (error) throw error;

      if (data?.success) {
        setStatus("success");
        toast({
          title: "STK Push Sent!",
          description: "Please check your phone and enter your M-Pesa PIN to complete the payment.",
        });
      } else {
        throw new Error(data?.message || "Payment request failed");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      setStatus("error");
      toast({
        title: "Payment Failed",
        description: error.message || "Unable to initiate payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="checkout" className="py-24 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,hsl(220_30%_15%)_0%,transparent_70%)]" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Complete Your <span className="gradient-text">Purchase</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Enter your M-Pesa number to receive the payment prompt on your phone
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
            
            <form
              onSubmit={handleSubmit}
              className="relative bg-card rounded-2xl p-8 border border-border"
            >
              <div className="mb-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4">
                  <Phone className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold">
                  Monthly Bundle - 400 KSH
                </h3>
              </div>

              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-muted-foreground mb-2"
                  >
                    M-Pesa Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                      +254
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
                      placeholder="7XXXXXXXX"
                      className="w-full pl-16 pr-4 py-4 bg-secondary/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      disabled={isLoading}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Enter the number registered with M-Pesa
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !phoneNumber}
                  className="w-full py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 glow"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending STK Push...
                    </>
                  ) : status === "success" ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Check Your Phone
                    </>
                  ) : (
                    "Pay 400 KSH"
                  )}
                </button>

                {status === "success" && (
                  <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Payment prompt sent!
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Check your phone and enter your M-Pesa PIN to complete the transaction.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {status === "error" && (
                  <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Payment failed
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Please check your phone number and try again.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-xs text-muted-foreground text-center">
                  Secured by M-Pesa Daraja API. Your payment is safe and encrypted.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CheckoutForm;
