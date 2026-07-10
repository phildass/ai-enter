import crypto from 'crypto';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';
import { verifyHandoffToken } from './verifyHandoffToken';
import { verifyIiskillsToken } from './verifyIiskillsToken';
import { IISKILLS_DEFAULT_AMOUNT_PAISE } from './courses';
import { resolveIiskillsCourseSlug } from './iiskillsOffer';
import { getRazorpayCredentialsForApp, isSupportedPaymentApp } from './payments';
import { assertPaymentCaptured, CONFIRM_ENTITLEMENT_EVENT } from './razorpayCapture';
import { canGrantEntitlements } from './paymentEntitlement';

const CONFIRM_TIMEOUT_MS = 15000;
const MAX_CONFIRM_BODY_CHARS = 4000;

const DEFAULT_REDIRECT = 'https://iiskills.in/dashboard';

function safeTruncate(str, max = MAX_CONFIRM_BODY_CHARS) {
  if (!str) return '';
  if (str.length <= max) return str;
  return str.slice(0, max) + `…(truncated, ${str.length - max} chars more)`;
}

function computeConfirmSignature(rawBody, secret) {
  if (!secret) {
    throw new Error('Confirmation signing secret is not configured');
  }
  return crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
}

async function callConfirmEndpoint(confirmPayload, confirmUrl, confirmSecret) {
  const rawBody = JSON.stringify(confirmPayload);
  const timestamp = Math.floor(Date.now() / 1000).toString();

  let signature;
  try {
    signature = computeConfirmSignature(rawBody, confirmSecret);
  } catch (err) {
    return { ok: false, redirectUrl: null, error: err.message, debug: { stage: 'sign' } };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CONFIRM_TIMEOUT_MS);

  let confirmRes;
  let responseText = '';
  let responseJson = null;

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

    responseText = await confirmRes.text();
    try {
      responseJson = responseText ? JSON.parse(responseText) : null;
    } catch {
      responseJson = null;
    }
  } catch (fetchErr) {
    const msg =
      fetchErr.name === 'AbortError'
        ? 'confirm request timed out'
        : `confirm network error: ${fetchErr.message}`;

    return {
      ok: false,
      redirectUrl: null,
      error: msg,
      debug: { stage: 'fetch', confirmUrl, timeoutMs: CONFIRM_TIMEOUT_MS },
    };
  } finally {
    clearTimeout(timer);
  }

  const debug = {
    stage: 'response',
    confirmUrl,
    status: confirmRes.status,
    ok: confirmRes.ok,
    timestamp,
    headers: {
      'content-type': confirmRes.headers.get('content-type'),
      'x-request-id': confirmRes.headers.get('x-request-id'),
      'cf-ray': confirmRes.headers.get('cf-ray'),
    },
    body_text: safeTruncate(responseText || ''),
    body_json: responseJson,
  };

  if (!confirmRes.ok) {
    return {
      ok: false,
      redirectUrl: null,
      error: `confirm endpoint returned HTTP ${confirmRes.status}`,
      debug,
    };
  }

  const redirectUrl =
    (responseJson && (responseJson.redirect_url || responseJson.redirectUrl)) || null;

  return {
    ok: true,
    redirectUrl,
    error: null,
    debug,
  };
}

/**
 * Verify Razorpay payment, update Supabase, and confirm with iiskills.
 */
export async function completeVerifiedPayment(input) {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    session_id,
    purchaseId,
    iiskills_token,
    session_token,
    user_id: bodyUserId,
    app_name: bodyAppName,
    course: bodyCourse,
    entitlement_source: entitlementSource,
  } = input;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return { ok: false, status: 400, error: 'Missing payment details' };
  }

  let user_id;
  let app_name;
  let iiskillsPayload = null;

  if (iiskills_token) {
    try {
      iiskillsPayload = verifyIiskillsToken(iiskills_token, { expectedPurchaseId: purchaseId });
    } catch (err) {
      return { ok: false, status: 400, error: err.message || 'Invalid iiskills token' };
    }
    user_id = iiskillsPayload.user_id || null;
    app_name = 'iiskills';
  } else if (session_token) {
    let payload;
    try {
      payload = verifyHandoffToken(session_token);
    } catch (err) {
      return { ok: false, status: 400, error: err.message || 'Invalid session token' };
    }
    user_id = payload.user_id;
    app_name = payload.app_name;
  } else {
    user_id = bodyUserId;
    app_name = bodyAppName;
  }

  if (!isSupportedPaymentApp(app_name)) {
    return {
      ok: false,
      status: 400,
      error: 'Unsupported payment app. Only iiskills is supported.',
    };
  }

  const { keyId, keySecret } = getRazorpayCredentialsForApp(app_name);
  if (!keySecret) {
    return {
      ok: false,
      status: 500,
      error: `Payment system not configured for ${app_name}`,
    };
  }

  const generatedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (generatedSignature !== razorpay_signature) {
    return { ok: false, status: 400, error: 'Invalid payment signature' };
  }

  if (!keyId || !keySecret) {
    return {
      ok: false,
      status: 500,
      error: `Payment system not configured for ${app_name}`,
    };
  }

  const razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });

  let paymentMethod = null;
  let captureCheck;
  try {
    captureCheck = await assertPaymentCaptured(razorpay, razorpay_payment_id, razorpay_order_id);
  } catch (err) {
    console.error('[completeVerifiedPayment] Failed to fetch payment from Razorpay:', err.message);
    return { ok: false, status: 400, error: 'Unable to verify payment with Razorpay' };
  }

  if (!captureCheck.ok || captureCheck.payment?.status !== 'captured') {
    return {
      ok: false,
      status: 400,
      error: captureCheck.pending
        ? 'Payment is not captured yet. Please complete payment in your UPI app.'
        : captureCheck.error || 'Payment was not completed',
    };
  }

  paymentMethod = captureCheck.payment.method;
  const paidAt = new Date().toISOString();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  let transactionId = null;
  let transactionRecord = null;

  if (supabaseUrl && serviceRoleKey) {
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const updateFields = {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      status: 'success',
      payment_method: paymentMethod,
      paid_at: paidAt,
      updated_at: paidAt,
    };

    const sessionKey = purchaseId || session_id;
    let transaction = null;
    let error = null;

    ({ data: transaction, error } = await supabase
      .from('payment_transactions')
      .update(updateFields)
      .eq('razorpay_order_id', razorpay_order_id)
      .select()
      .maybeSingle());

    if ((error || !transaction) && sessionKey) {
      const fallback = await supabase
        .from('payment_transactions')
        .update(updateFields)
        .eq('session_id', sessionKey)
        .eq('status', 'pending')
        .select();

      error = fallback.error;
      transaction = fallback.data?.[0] || null;
    }

    if (error) {
      console.error('[completeVerifiedPayment] Supabase update failed (non-fatal):', error.message);
    } else if (transaction) {
      transactionId = transaction.id;
      transactionRecord = transaction;
    }
  }

  if (iiskillsPayload) {
    if (!canGrantEntitlements(entitlementSource)) {
      console.warn(
        `[completeVerifiedPayment] blocked entitlement grant from source=${entitlementSource || 'unknown'}`,
      );
      return {
        ok: false,
        status: 403,
        error: 'Entitlements may only be granted via verified Razorpay callback or webhook',
      };
    }

    const amountPaise =
      iiskillsPayload.amount_paise || iiskillsPayload.amountPaise || IISKILLS_DEFAULT_AMOUNT_PAISE;
    const appId = resolveIiskillsCourseSlug(bodyCourse || iiskillsPayload.courseSlug);
    const confirmUrl =
      process.env.IISKILLS_CONFIRM_URL || 'https://iiskills.in/api/payments/confirm';
    const confirmSecret = process.env.AIENTER_CONFIRMATION_SIGNING_SECRET;

    const confirmPayload = {
      purchaseId: iiskillsPayload.purchaseId,
      appId,
      amountPaise,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      paidAt,
      user_token: iiskills_token,
      event: CONFIRM_ENTITLEMENT_EVENT,
    };

    console.log(
      `[completeVerifiedPayment] iiskills confirm event=${CONFIRM_ENTITLEMENT_EVENT} purchaseId=${iiskillsPayload.purchaseId} paymentId=${razorpay_payment_id}`,
    );

    const confirmResult = await callConfirmEndpoint(confirmPayload, confirmUrl, confirmSecret);
    if (!confirmResult.ok) {
      console.error(
        `[completeVerifiedPayment] iiskills confirm failed: purchaseId=${iiskillsPayload.purchaseId} paymentId=${razorpay_payment_id} error=${confirmResult.error}`,
      );
      if (confirmResult.debug) {
        console.error('[completeVerifiedPayment] iiskills confirm debug:', confirmResult.debug);
      }

      // Fallback: redirect browser through the GET callback route so iiskills
      // can grant access via the browser path when server-to-server confirm fails.
      const callbackBase = process.env.IISKILLS_CALLBACK_URL || 'https://iiskills.in/api/payments/callback';
      const fallbackParams = new URLSearchParams({
        token: iiskills_token,
        course: appId,
        user_id: iiskillsPayload.user_id || '',
        user_name: iiskillsPayload.name || '',
        email: iiskillsPayload.email || iiskillsPayload.user_email || '',
        phone: iiskillsPayload.phone || '',
        event: 'payment.captured',
        status: 'captured',
        payment_id: razorpay_payment_id,
      });
      const fallbackRedirect = `${callbackBase}?${fallbackParams.toString()}`;

      return {
        ok: true,
        status: 200,
        success: true,
        captured: true,
        payment_status: 'captured',
        confirmFailed: true,
        confirmError: confirmResult.error,
        confirmDebug: confirmResult.debug || null,
        purchaseId: iiskillsPayload.purchaseId,
        razorpayPaymentId: razorpay_payment_id,
        transactionId,
        redirect_url: fallbackRedirect,
      };
    }

    return {
      ok: true,
      status: 200,
      success: true,
      captured: true,
      payment_status: 'captured',
      message: 'Payment captured',
      redirect_url:
        confirmResult.redirectUrl || DEFAULT_REDIRECT || transactionRecord?.return_url,
      transactionId,
    };
  }

  return {
    ok: true,
    status: 200,
    success: true,
    captured: true,
    payment_status: 'captured',
    message: 'Payment verified successfully',
    transactionId,
    session_id: transactionRecord?.session_id || session_id || null,
    return_url: transactionRecord?.return_url || null,
    redirect_url: transactionRecord?.return_url || DEFAULT_REDIRECT,
  };
}
