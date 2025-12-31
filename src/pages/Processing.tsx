import { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, Wifi, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Processing = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'failed'>('processing');
  const [receiptNumber, setReceiptNumber] = useState<string>('');
  const { checkoutRequestID, phoneNumber } = location.state || {};

  const checkPaymentStatus = useCallback(async () => {
    if (!checkoutRequestID) return;

    try {
      const { data, error } = await supabase.functions.invoke('payment-status', {
        body: { checkoutRequestID }
      });

      if (error) {
        console.error('Error checking payment status:', error);
        return;
      }

      console.log('Payment status response:', data);

      if (data.status === 'success') {
        setStatus('success');
        setReceiptNumber(data.mpesaReceiptNumber || '');
      } else if (data.status === 'failed') {
        setStatus('failed');
      }
      // If still pending, keep polling
    } catch (err) {
      console.error('Failed to check payment status:', err);
    }
  }, [checkoutRequestID]);

  useEffect(() => {
    if (!checkoutRequestID) {
      navigate('/checkout');
      return;
    }

    // Start polling for payment status
    const pollInterval = setInterval(() => {
      checkPaymentStatus();
    }, 3000); // Check every 3 seconds

    // Initial check
    checkPaymentStatus();

    // Stop polling after 2 minutes
    const timeout = setTimeout(() => {
      clearInterval(pollInterval);
      if (status === 'processing') {
        setStatus('failed');
      }
    }, 120000);

    return () => {
      clearInterval(pollInterval);
      clearTimeout(timeout);
    };
  }, [checkoutRequestID, navigate, checkPaymentStatus, status]);

  const handleTryAgain = () => {
    navigate('/checkout');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(190_95%_50%_/_0.15)_0%,transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(280_95%_50%_/_0.1)_0%,transparent_50%)]" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-md mx-auto text-center">
          {status === 'processing' && (
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              </div>
              
              <h2 className="text-2xl font-bold mb-4">Processing Payment</h2>
              
              <p className="text-muted-foreground mb-6">
                Please complete the payment on your phone. Enter your M-Pesa PIN when prompted.
              </p>

              <div className="bg-background/50 rounded-xl p-4 mb-6">
                <p className="text-sm text-muted-foreground">Payment to</p>
                <p className="font-semibold text-foreground">Link NK Satellite</p>
                <p className="text-2xl font-bold gradient-text mt-2">KSH 400</p>
              </div>

              <p className="text-sm text-muted-foreground">
                Waiting for M-Pesa confirmation...
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              
              <h2 className="text-2xl font-bold mb-4 text-green-500">Payment Successful!</h2>
              
              <p className="text-muted-foreground mb-6">
                Your satellite internet subscription has been activated.
              </p>

              <div className="bg-background/50 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <Wifi className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-foreground">Monthly Bundle</p>
                    <p className="text-sm text-muted-foreground">Valid for 30 days</p>
                  </div>
                </div>
                
                <div className="border-t border-border/50 pt-4 mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className="text-green-500 font-medium">Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount Paid</span>
                    <span className="font-medium">KSH 400</span>
                  </div>
                  {receiptNumber && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Receipt</span>
                      <span className="font-medium">{receiptNumber}</span>
                    </div>
                  )}
                  {phoneNumber && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone</span>
                      <span className="font-medium">{phoneNumber}</span>
                    </div>
                  )}
                </div>
              </div>

              <Button 
                onClick={handleGoHome}
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {status === 'failed' && (
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-destructive/20 flex items-center justify-center">
                <XCircle className="w-10 h-10 text-destructive" />
              </div>
              
              <h2 className="text-2xl font-bold mb-4 text-destructive">Payment Failed</h2>
              
              <p className="text-muted-foreground mb-6">
                The payment could not be completed. This might be due to insufficient funds, cancelled transaction, or wrong PIN.
              </p>

              <div className="space-y-3">
                <Button 
                  onClick={handleTryAgain}
                  className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
                >
                  Try Again
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={handleGoHome}
                  className="w-full"
                >
                  Go Home
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Processing;
