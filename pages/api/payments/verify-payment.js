import crypto from 'crypto';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';

import { signWebhookPayload } from '../../../lib/handoff';

import { verifyHandoffToken } from '../../../lib/verifyHandoffToken';


export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,

    session_id,

    session_token,
    user_id: bodyUserId,
    app_name: bodyAppName,

  } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: 'Missing payment details' });
  }

  if (!process.env.RAZORPAY_KEY_SECRET) {
    return res.status(500).json({ error: 'Payment system not configured' });
  }

  // Resolve user_id, app_name, and webhook URL
  let user_id, app_name, webhookUrl;

  if (session_token) {
    // Token-based flow (jai-bharat, jai-kisan): verify token and use its data
    let payload;
    try {
      payload = verifyHandoffToken(session_token);
    } catch (err) {
      return res.status(400).json({ error: err.message || 'Invalid session token' });
    }
    user_id = payload.user_id;
    app_name = payload.app_name;
    // Always use environment-configured webhook URL (not token's return_url)
    // to prevent origin sites from redirecting webhooks to arbitrary endpoints
    webhookUrl =
      app_name === 'jai-kisan'
        ? process.env.JAI_KISAN_WEBHOOK_URL
        : process.env.JAI_BHARAT_WEBHOOK_URL;
  } else {
    // Legacy flow (iiskills and direct API callers)
    user_id = bodyUserId;
    app_name = bodyAppName;
    webhookUrl =
      app_name === 'jai-kisan'
        ? process.env.JAI_KISAN_WEBHOOK_URL
        : app_name === 'iiskills'
        ? process.env.IISKILLS_WEBHOOK_URL
        : process.env.JAI_BHARAT_WEBHOOK_URL;
  }

  try {
    // Verify Razorpay signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    // Fetch payment method from Razorpay
    let paymentMethod = null;
    if (process.env.RAZORPAY_KEY_ID) {
      try {
        const razorpay = new Razorpay({
          key_id: process.env.RAZORPAY_KEY_ID,
          key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
        const payment = await razorpay.payments.fetch(razorpay_payment_id);
        paymentMethod = payment.method;
      } catch (err) {
        console.error('Failed to fetch payment details:', err);
      }
    }

    // Update transaction in Supabase if configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    let transactionId = null;
    let transactionRecord = null;

    if (supabaseUrl && serviceRoleKey) {
      const supabase = createClient(supabaseUrl, serviceRoleKey);

      const paidAt = new Date().toISOString();

      const { data: transaction, error } = await supabase
        .from('payment_transactions')
        .update({
          razorpay_payment_id,
          razorpay_signature,
          status: 'success',
          payment_method: paymentMethod,
          paid_at: paidAt,
          updated_at: paidAt,
        })
        .eq('razorpay_order_id', razorpay_order_id)
        .select()
        .single();

      if (error) {
        console.error('Supabase update error:', error);
      } else {
        transactionId = transaction?.id;
        transactionRecord = transaction;


        // Determine webhook URL for this app segment
        const appName = transaction?.app_name;
        const webhookUrl =
          appName === 'jai-kisan'
            ? process.env.JAI_KISAN_WEBHOOK_URL
            : appName === 'iiskills'
            ? process.env.IISKILLS_WEBHOOK_URL
            : process.env.JAI_BHARAT_WEBHOOK_URL;


        // Send webhook to respective app backend (URL resolved above from token or env)

        if (webhookUrl) {
          try {
            const webhookPayload = {
              session_id: transaction?.session_id || session_id || null,
              app_name: appName,
              user_id: transaction?.user_id || null,
              user_email: transaction?.user_email || null,
              user_phone: transaction?.user_phone || null,
              amount_paise: Math.round((transaction?.amount || 116.82) * 100),
              validity_days: transaction?.validity_days || 30,
              razorpay_order_id,
              razorpay_payment_id,
              razorpay_signature,
              status: 'success',
              paid_at: transaction?.paid_at || paidAt,
            };

            const rawBody = JSON.stringify(webhookPayload);

            const headers = { 'Content-Type': 'application/json' };
            if (process.env.ORIGIN_WEBHOOK_SECRET) {
              headers['X-AI-ENTER-SIGNATURE'] = signWebhookPayload(rawBody);
            }

            const webhookRes = await fetch(webhookUrl, {
              method: 'POST',
              headers,
              body: rawBody,
            });
            const webhookData = await webhookRes.json().catch(() => ({}));

            await supabase
              .from('payment_transactions')
              .update({
                webhook_sent: true,
                webhook_response: JSON.stringify(webhookData),
                webhook_sent_at: new Date().toISOString(),
              })
              .eq('id', transactionId);
          } catch (webhookError) {
            console.error('Webhook error:', webhookError);
          }
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      transactionId,
      session_id: transactionRecord?.session_id || session_id || null,
      return_url: transactionRecord?.return_url || null,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return res.status(500).json({ error: 'Payment verification failed' });
  }
}
