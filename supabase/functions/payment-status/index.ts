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
    const { checkoutRequestID } = await req.json();
    
    if (!checkoutRequestID) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing checkoutRequestID' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Checking payment status for:', checkoutRequestID);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Query payment session
    const { data, error } = await supabase
      .from('payment_sessions')
      .select('*')
      .eq('checkout_request_id', checkoutRequestID)
      .maybeSingle();

    if (error) {
      console.error('Database error:', error);
      throw new Error('Failed to fetch payment status');
    }

    if (!data) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          status: 'not_found',
          message: 'Payment session not found' 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Payment session found:', data);

    return new Response(
      JSON.stringify({
        success: true,
        status: data.status,
        mpesaReceiptNumber: data.mpesa_receipt_number,
        amount: data.amount,
        phoneNumber: data.phone_number,
        transactionDate: data.transaction_date,
        resultDesc: data.result_desc,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error checking payment status:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    return new Response(
      JSON.stringify({
        success: false,
        message: errorMessage,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
