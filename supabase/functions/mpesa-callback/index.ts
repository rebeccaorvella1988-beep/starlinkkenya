import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log('M-Pesa callback received:', JSON.stringify(body));

    const stkCallback = body?.Body?.stkCallback;
    const resultCode = stkCallback?.ResultCode;
    const resultDesc = stkCallback?.ResultDesc;
    const checkoutRequestID = stkCallback?.CheckoutRequestID;
    const merchantRequestID = stkCallback?.MerchantRequestID;
    
    console.log('Result Code:', resultCode);
    console.log('Result Description:', resultDesc);
    console.log('CheckoutRequestID:', checkoutRequestID);

    // Extract callback metadata if payment was successful
    let amount = 0;
    let mpesaReceiptNumber = '';
    let phoneNumber = '';
    let transactionDate = '';

    if (resultCode === 0) {
      const callbackMetadata = stkCallback?.CallbackMetadata?.Item || [];
      
      for (const item of callbackMetadata) {
        switch (item.Name) {
          case 'Amount':
            amount = item.Value;
            break;
          case 'MpesaReceiptNumber':
            mpesaReceiptNumber = item.Value;
            break;
          case 'PhoneNumber':
            phoneNumber = item.Value?.toString();
            break;
          case 'TransactionDate':
            transactionDate = item.Value?.toString();
            break;
        }
      }

      console.log('Payment successful:', {
        amount,
        mpesaReceiptNumber,
        phoneNumber,
        transactionDate
      });

      // Here you would typically save to database
      // For now, we just log the successful transaction
    } else {
      console.log('Payment failed or cancelled:', resultDesc);
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error processing callback:', error);
    return new Response(
      JSON.stringify({ success: false }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
