import crypto from 'crypto';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';

import { signWebhookPayload } from '../../../lib/handoff';
import { verifyHandoffToken } from '../../../lib/verifyHandoffToken';
import { verifyIiskillsToken } from '../../../lib/verifyIiskillsToken';
import { IISKILLS_DEFAULT_AMOUNT_PAISE } from '../../../lib/courses';

/**
 * Compute the x-aienter-signature header value for the iiskills confirm request.
 * Signature = HMAC-SHA256(rawBody, AIENTER_CONFIRMATION_SIGNING_SECRET) as hex.
 *
 * @param {string} rawBody  The exact JSON string being sent as the request body.
 * @returns {string}        Hex-encoded HMAC-SHA256 signature.
 */
function computeConfirmSignature(rawBody) {
  const secret = process.env.AIENTER_CONFIRMATION_SIGNING_SECRET;
  if (!secret) {
    throw new Error('AIENTER_CONFIRMATION_SIGNING_SECRET is not configured');
  }
  return crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
}

/**
 * POST the payment confirmation to iiskills-cloud.
 *
 * Endpoint: IISKILLS_CONFIRM_URL (default https://iiskills.cloud/api/payments/confirm)
 * Headers:
 *   x-aienter-signature  – HMAC-SHA256 over the raw request body
 *   x-aienter-timestamp  – Unix timestamp in seconds for replay-protection on iiskills side
 *
 * @returns {{ ok: boolean, redirectUrl: string|null, error: string|null }}
 */
async function callIiskillsConfirm(confirmPayload) {
  const confirmUrl =
    process.env.IISKILLS_CONFIRM_URL || 'https://iiskills.cloud/api/payments/confirm';

  const rawBody = JSON.stringify(confirmPayload);
  const timestamp = Math.floor(Date.now() / 1000).toString();

  let signature;
  try {
    signature = computeConfirmSignature(rawBody);
  } catch (err) {
    return { ok: false, redirectUrl: null, error: err.message };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  let confirmRes;
  try {
    confirmRes = await fetch(confirmUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-aienter-signature': signature,
        'x-aienter-timestamp': timestamp,
      },
      body: rawBody,
      signal: controller.signal,
    });
  } catch (fetchErr) {
    const msg =
      fetchErr.name === 'AbortError'
        ? 'iiskills confirm request timed out'
        : `iiskills confirm network error: ${fetchErr.message}`;
    return { ok: false, redirectUrl: null, error: msg };
  } finally {
    clearTimeout(timer);
  }

  let confirmData = {};
  try {
    confirmData = await confirmRes.json();
  } catch {
    // ignore parse errors
  }

  if (!confirmRes.ok) {
    return {
      ok: false,
      redirectUrl: null,
      error: `iiskills confirm returned HTTP ${confirmRes.status}`,
    };
  }

  return {
    ok: true,
    redirectUrl: confirmData.redirect_url || null,
    error: null,
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,

    session_id,

    iiskills_token,
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

  // Resolve user_id, app_name, webhook URL, and iiskills-specific data
  let user_id, app_name, webhookUrl;
  let iiskillsPayload = null; // set for new iiskills JWT flow

  if (iiskills_token) {
    // New iiskills JWT flow: verify with IISKILLS_PAYMENT_TOKEN_SECRET
    try {
      iiskillsPayload = verifyIiskillsToken(iiskills_token);
    } catch (err) {
      return res.status(400).json({ error: err.message || 'Invalid iiskills token' });
    }
    user_id = iiskillsPayload.user_id || null;
    app_name = 'iiskills';
    webhookUrl = null; // handled via iiskills confirm, not old webhook
  } else if (session_token) {
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
    // Legacy flow (direct API callers)
    user_id = bodyUserId;
    app_name = bodyAppName;
    webhookUrl =
      app_name === 'jai-kisan'
        ? process.env.JAI_KISAN_WEBHOOK_URL
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

    const paidAt = new Date().toISOString();

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
        console.error('[verify-payment] Failed to fetch payment details from Razorpay (non-fatal):', err.message);
      }
    }

    // -----------------------------------------------------------------------
    // New iiskills confirm flow (replaces old webhook for iiskills)
    // -----------------------------------------------------------------------
    if (iiskillsPayload) {
      const amountPaise =
        iiskillsPayload.amount_paise || iiskillsPayload.amountPaise || IISKILLS_DEFAULT_AMOUNT_PAISE;

      const confirmPayload = {
        purchaseId: iiskillsPayload.purchaseId,
        appId: iiskillsPayload.courseSlug,
        amountPaise,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        paidAt,
        user_token: iiskills_token,
      };

      console.log(
        `[verify-payment] iiskills confirm: purchaseId=${iiskillsPayload.purchaseId} razorpayPaymentId=${razorpay_payment_id}`,
      );

      // Update Supabase (non-fatal)
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      let transactionId = null;

      if (supabaseUrl && serviceRoleKey) {
        try {
          const supabase = createClient(supabaseUrl, serviceRoleKey);
          const { data: transaction, error: dbErr } = await supabase
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

          if (dbErr) {
            console.error('[verify-payment] Supabase update failed (non-fatal):', dbErr.message);
          } else {
            transactionId = transaction?.id;
          }
        } catch (dbErr) {
          console.error('[verify-payment] Supabase error (non-fatal):', dbErr.message);
        }
      }

      const confirmResult = await callIiskillsConfirm(confirmPayload);

      if (!confirmResult.ok) {
        console.error(
          `[verify-payment] iiskills confirm failed: purchaseId=${iiskillsPayload.purchaseId} paymentId=${razorpay_payment_id} error=${confirmResult.error}`,
        );
        // Payment was captured by Razorpay; tell the browser so it can retry
        return res.status(200).json({
          success: true,
          confirmFailed: true,
          confirmError: confirmResult.error,
          purchaseId: iiskillsPayload.purchaseId,
          razorpayPaymentId: razorpay_payment_id,
          transactionId,
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Payment confirmed',
        redirect_url: confirmResult.redirectUrl,
        transactionId,
      });
    }

    // -----------------------------------------------------------------------
    // Existing non-iiskills flow: Supabase update + webhook
    // -----------------------------------------------------------------------

    // Update transaction in Supabase if configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    let transactionId = null;
    let transactionRecord = null;

    if (supabaseUrl && serviceRoleKey) {
      const supabase = createClient(supabaseUrl, serviceRoleKey);

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
        console.error('[verify-payment] Supabase update on payment_transactions failed (non-fatal):', error.message);
      } else {
        transactionId = transaction?.id;
        transactionRecord = transaction;

        // Determine webhook URL for this app segment
        const appName = transaction?.app_name;
        const resolvedWebhookUrl =
          appName === 'jai-kisan'
            ? process.env.JAI_KISAN_WEBHOOK_URL
            : appName === 'jai-bharat'
            ? process.env.JAI_BHARAT_WEBHOOK_URL
            : webhookUrl;

        if (resolvedWebhookUrl) {
          try {
            const webhookPayload = {
              session_id: transaction?.session_id || session_id || null,
              app_name: appName,
              user_id: transaction?.user_id || null,
              user_email: transaction?.user_email || null,
              user_phone: transaction?.user_phone || null,
              customer_name: transaction?.customer_name || null,
              course: transaction?.course || null,
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

            const webhookRes = await fetch(resolvedWebhookUrl, {
              method: 'POST',
              headers,
              body: rawBody,
            });
            const webhookData = await webhookRes.json().catch(() => ({}));

            if (!webhookRes.ok) {
              console.error(
                `[verify-payment] Webhook to ${resolvedWebhookUrl} failed (HTTP ${webhookRes.status}):`,
                webhookData,
              );
            }

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
