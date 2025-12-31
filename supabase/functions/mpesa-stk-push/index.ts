import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phoneNumber, amount } = await req.json();
    
    console.log('Received STK push request:', { phoneNumber, amount });

    // Validate phone number format (should be 254XXXXXXXXX)
    let formattedPhone = phoneNumber.replace(/\s/g, '').replace(/^0/, '254').replace(/^\+/, '');
    if (!formattedPhone.startsWith('254')) {
      formattedPhone = '254' + formattedPhone;
    }
    
    console.log('Formatted phone:', formattedPhone);

    const consumerKey = Deno.env.get('MPESA_CONSUMER_KEY');
    const consumerSecret = Deno.env.get('MPESA_CONSUMER_SECRET');
    const passkey = Deno.env.get('MPESA_PASSKEY');
    const shortcode = Deno.env.get('MPESA_SHORTCODE');

    if (!consumerKey || !consumerSecret || !passkey || !shortcode) {
      console.error('Missing M-Pesa credentials');
      throw new Error('M-Pesa credentials not configured');
    }

    // Step 1: Get OAuth token
    const auth = btoa(`${consumerKey}:${consumerSecret}`);
    console.log('Fetching OAuth token...');
    
    const tokenResponse = await fetch(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
        },
      }
    );

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token fetch failed:', errorText);
      throw new Error('Failed to get M-Pesa access token');
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    console.log('Got access token');

    // Step 2: Generate timestamp and password
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const password = btoa(`${shortcode}${passkey}${timestamp}`);
    
    console.log('Generated timestamp:', timestamp);

    // Step 3: Send STK Push request
    const stkPushPayload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: formattedPhone,
      PartyB: shortcode,
      PhoneNumber: formattedPhone,
      CallBackURL: 'https://lalszahpdbkjaeipyizj.functions.supabase.co/mpesa-callback',
      AccountReference: 'LinkNK',
      TransactionDesc: 'Satellite Bundle Purchase',
    };

    console.log('Sending STK push with payload:', JSON.stringify(stkPushPayload));

    const stkResponse = await fetch(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stkPushPayload),
      }
    );

    const stkData = await stkResponse.json();
    console.log('STK Push response:', JSON.stringify(stkData));

    if (stkData.ResponseCode === '0') {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'STK push sent successfully. Please check your phone.',
          data: stkData,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          message: stkData.errorMessage || stkData.ResponseDescription || 'STK push failed',
          data: stkData,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error) {
    console.error('Error in mpesa-stk-push function:', error);
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
