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
    console.log('MerchantRequestID:', merchantRequestID);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

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

      // Update payment session to success
      const { error: updateError } = await supabase
        .from('payment_sessions')
        .update({
          status: 'success',
          result_code: resultCode,
          result_desc: resultDesc,
          mpesa_receipt_number: mpesaReceiptNumber,
          transaction_date: transactionDate,
        })
        .eq('checkout_request_id', checkoutRequestID);

      if (updateError) {
        console.error('Failed to update payment session:', updateError);
      } else {
        console.log('Payment session updated to success');
      }
    } else {
      console.log('Payment failed or cancelled:', resultDesc);

      // Update payment session to failed
      const { error: updateError } = await supabase
        .from('payment_sessions')
        .update({
          status: 'failed',
          result_code: resultCode,
          result_desc: resultDesc,
        })
        .eq('checkout_request_id', checkoutRequestID);

      if (updateError) {
        console.error('Failed to update payment session:', updateError);
      } else {
        console.log('Payment session updated to failed');
      }
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
