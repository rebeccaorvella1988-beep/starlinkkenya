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
    const { phoneNumber, amount } = await req.json();
    
    console.log('Received STK push request:', { phoneNumber, amount });

    // Format phone number to 254XXXXXXXXX
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

    console.log('Using shortcode:', shortcode);

    // Production endpoints
    const oauthUrl = 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';
    const stkPushUrl = 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest';

    // Step 1: Get OAuth token
    const auth = btoa(`${consumerKey}:${consumerSecret}`);
    console.log('Fetching OAuth token from production...');
    
    const tokenResponse = await fetch(oauthUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
      },
    });

    const tokenText = await tokenResponse.text();
    console.log('Token response status:', tokenResponse.status);
    
    if (!tokenResponse.ok) {
      console.error('Token fetch failed:', tokenText);
      throw new Error(`Failed to get M-Pesa access token: ${tokenText}`);
    }

    let tokenData;
    try {
      tokenData = JSON.parse(tokenText);
    } catch (e) {
      console.error('Failed to parse token response:', tokenText);
      throw new Error('Invalid token response from M-Pesa');
    }

    const accessToken = tokenData.access_token;
    if (!accessToken) {
      console.error('No access token in response:', tokenData);
      throw new Error('No access token received from M-Pesa');
    }
    
    console.log('Got access token, length:', accessToken.length);

    // Step 2: Generate timestamp (format: YYYYMMDDHHmmss) - Use EAT timezone (UTC+3)
    const now = new Date();
    // Add 3 hours for EAT timezone
    const eat = new Date(now.getTime() + (3 * 60 * 60 * 1000));
    const timestamp = eat.getFullYear().toString() +
      String(eat.getMonth() + 1).padStart(2, '0') +
      String(eat.getDate()).padStart(2, '0') +
      String(eat.getHours()).padStart(2, '0') +
      String(eat.getMinutes()).padStart(2, '0') +
      String(eat.getSeconds()).padStart(2, '0');
    
    // Password = Base64(Shortcode + Passkey + Timestamp)
    const password = btoa(`${shortcode}${passkey}${timestamp}`);
    
    console.log('Generated timestamp (EAT):', timestamp);

    // Get callback URL dynamically from Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const callbackUrl = `${supabaseUrl}/functions/v1/mpesa-callback`;
    console.log('Callback URL:', callbackUrl);

    // Initialize Supabase client to save payment session
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Step 3: Send STK Push request (PayBill)
    const stkPushPayload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(amount),
      PartyA: formattedPhone,
      PartyB: shortcode,
      PhoneNumber: formattedPhone,
      CallBackURL: callbackUrl,
      AccountReference: 'LinkNK',
      TransactionDesc: 'Satellite Bundle Purchase',
    };

    console.log('Sending STK push to:', stkPushUrl);
    console.log('STK push payload:', JSON.stringify(stkPushPayload));

    const stkResponse = await fetch(stkPushUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(stkPushPayload),
    });

    const stkText = await stkResponse.text();
    console.log('STK Push response status:', stkResponse.status);
    console.log('STK Push response:', stkText);

    let stkData;
    try {
      stkData = JSON.parse(stkText);
    } catch (e) {
      console.error('Failed to parse STK response:', stkText);
      throw new Error('Invalid response from M-Pesa STK push');
    }

    if (stkData.ResponseCode === '0') {
      // Save pending payment session to database
      const { error: dbError } = await supabase
        .from('payment_sessions')
        .insert({
          checkout_request_id: stkData.CheckoutRequestID,
          merchant_request_id: stkData.MerchantRequestID,
          phone_number: formattedPhone,
          amount: Math.round(amount),
          status: 'pending'
        });

      if (dbError) {
        console.error('Failed to save payment session:', dbError);
        // Don't throw - payment was initiated successfully
      } else {
        console.log('Payment session saved to database');
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'STK push sent successfully. Please check your phone.',
          checkoutRequestID: stkData.CheckoutRequestID,
          merchantRequestID: stkData.MerchantRequestID,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } else {
      // Log the error for debugging
      console.error('STK Push failed with response:', stkData);
      
      return new Response(
        JSON.stringify({
          success: false,
          message: stkData.errorMessage || stkData.ResponseDescription || 'STK push failed',
          errorCode: stkData.errorCode || stkData.ResponseCode,
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
