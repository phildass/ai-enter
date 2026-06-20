import crypto from 'crypto';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';
import { completeVerifiedPayment } from '../../../lib/completeVerifiedPayment';
import { getRazorpayCredentialsForApp } from '../../../lib/payments';
import { verifyPaymentLinkCallbackSignature } from '../../../lib/razorpayPaymentLink';
import { assertPaymentCaptured } from '../../../lib/razorpayCapture';

const DEFAULT_REDIRECTS = {
  iiskills: 'https://iiskills.in/dashboard',
  'uriq.in': 'https://uriq.in/dashboard',
};

const TX_SELECT =
  'app_name, session_id, course, handoff_token, status, return_url, razorpay_order_id, razorpay_payment_id';

function redirect(res, url) {
  res.setHeader('Cache-Control', 'no-store');
  res.writeHead(303, { Location: url });
  res.end();
}

function paymentErrorRedirect(res, message) {
  return redirect(
    res,
    `/payments/success?error=${encodeURIComponent(message || 'Payment failed')}`,
  );
}

function paymentPendingRedirect(res, appName) {
  return redirect(
    res,
    `/payments/success?pending=1&app=${encodeURIComponent(appName || 'iiskills')}`,
  );
}

async function loadTransaction(supabase, { orderId, referenceId }) {
  if (orderId) {
    const { data } = await supabase
      .from('payment_transactions')
      .select(TX_SELECT)
      .eq('razorpay_order_id', orderId)
      .maybeSingle();
    if (data) return data;
  }

  if (referenceId) {
    const { data: exact } = await supabase
      .from('payment_transactions')
      .select(TX_SELECT)
      .eq('session_id', referenceId)
      .order('created_at', { ascending: false })
      .limit(1);
    if (exact?.[0]) return exact[0];

    const baseSessionId = referenceId.replace(/_[a-z0-9]+$/i, '');
    if (baseSessionId && baseSessionId !== referenceId) {
      const { data: byBase } = await supabase
        .from('payment_transactions')
        .select(TX_SELECT)
        .eq('session_id', baseSessionId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1);
      if (byBase?.[0]) return byBase[0];
    }
  }

  return null;
}

function verifyOrderSignature(orderId, paymentId, signature, keySecret) {
  if (!orderId || !paymentId || !signature || !keySecret) return false;
  const expected = crypto
    .createHmac('sha256', keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  try {
    const sigBuf = Buffer.from(signature, 'utf8');
    const expectedBuf = Buffer.from(expected, 'utf8');
    return sigBuf.length === expectedBuf.length && crypto.timingSafeEqual(sigBuf, expectedBuf);
  } catch {
    return false;
  }
}

function buildOrderSignature(orderId, paymentId, keySecret) {
  return crypto.createHmac('sha256', keySecret).update(`${orderId}|${paymentId}`).digest('hex');
}

async function finalizeAndRedirect(res, { transaction, appName, paymentParams }) {
  const incomingPaymentId = paymentParams.razorpay_payment_id;

  // Idempotent redirect only when the same captured payment is replayed.
  if (transaction?.status === 'success') {
    if (
      transaction.razorpay_payment_id &&
      incomingPaymentId &&
      transaction.razorpay_payment_id !== incomingPaymentId
    ) {
      console.warn(
        `[razorpay-callback] success tx payment mismatch stored=${transaction.razorpay_payment_id} incoming=${incomingPaymentId}`,
      );
      return paymentPendingRedirect(res, appName);
    }

    const doneUrl =
      transaction.return_url || DEFAULT_REDIRECTS[appName] || DEFAULT_REDIRECTS.iiskills;
    return redirect(res, doneUrl);
  }

  const handoffToken = transaction?.handoff_token;
  const purchaseId = transaction?.session_id || paymentParams.purchaseId;

  let result;
  try {
    result = await completeVerifiedPayment({
      ...paymentParams,
      purchaseId,
      course: transaction?.course,
      iiskills_token: appName === 'iiskills' ? handoffToken : undefined,
      uriq_token: appName === 'uriq.in' ? handoffToken : undefined,
      app_name: appName,
      entitlement_source: 'callback',
    });
  } catch (err) {
    console.error('[razorpay-callback] Verification error:', err);
    return paymentErrorRedirect(res, 'Payment verification failed');
  }

  if (!result.ok) {
    if (result.error?.includes('not captured') || result.error?.includes('not captured yet')) {
      return paymentPendingRedirect(res, appName);
    }
    return paymentErrorRedirect(res, result.error || 'Payment verification failed');
  }

  if (result.confirmFailed) {
    console.error('[razorpay-callback] Origin confirm failed:', result.confirmError);
    return redirect(
      res,
      `/payments/success?app=${encodeURIComponent(appName || 'iiskills')}&confirm=failed`,
    );
  }

  const destination =
    result.redirect_url ||
    transaction?.return_url ||
    DEFAULT_REDIRECTS[appName] ||
    DEFAULT_REDIRECTS.iiskills;

  return redirect(res, destination);
}

async function handleStandardCheckoutCallback(
  res,
  { supabase, razorpay_order_id, razorpay_payment_id, razorpay_signature },
) {
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return paymentErrorRedirect(res, 'Missing payment details from Razorpay');
  }

  let transaction = null;
  if (supabase) {
    transaction = await loadTransaction(supabase, { orderId: razorpay_order_id });
  }

  const appName = transaction?.app_name || 'iiskills';
  const { keyId, keySecret } = getRazorpayCredentialsForApp(appName);

  if (!keySecret) {
    return paymentErrorRedirect(res, 'Payment system not configured');
  }

  if (!verifyOrderSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature, keySecret)) {
    console.error('[razorpay-callback] Invalid standard checkout signature');
    return paymentErrorRedirect(res, 'Invalid payment signature');
  }

  const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

  let captureCheck;
  try {
    captureCheck = await assertPaymentCaptured(razorpay, razorpay_payment_id, razorpay_order_id);
  } catch (err) {
    console.error('[razorpay-callback] payment fetch failed:', err.message);
    return paymentErrorRedirect(res, 'Unable to verify payment');
  }

  if (!captureCheck.ok) {
    console.log(
      `[razorpay-callback] blocked non-captured payment: id=${razorpay_payment_id} status=${captureCheck.payment?.status}`,
    );
    if (captureCheck.pending) {
      return paymentPendingRedirect(res, appName);
    }
    return paymentErrorRedirect(res, captureCheck.error);
  }

  return finalizeAndRedirect(res, {
    transaction,
    appName,
    paymentParams: {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      purchaseId: transaction?.session_id,
    },
  });
}

/**
 * Razorpay redirect callback — entitlements only after API-verified captured status.
 * No Supabase auth cookies; payment identity is JWT handoff_token in payment_transactions.
 */
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase =
    supabaseUrl && serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey) : null;

  // Payment Link success redirect (legacy hosted links)
  if (req.method === 'GET' && req.query.razorpay_payment_link_id) {
    const {
      razorpay_payment_id,
      razorpay_payment_link_id,
      razorpay_payment_link_reference_id,
      razorpay_payment_link_status,
      razorpay_signature,
    } = req.query;

    if (razorpay_payment_link_status !== 'paid') {
      console.log(
        `[razorpay-callback] payment link not paid: status=${razorpay_payment_link_status}`,
      );
      return paymentPendingRedirect(res, 'iiskills');
    }

    if (
      !razorpay_payment_id ||
      !razorpay_payment_link_id ||
      !razorpay_payment_link_reference_id ||
      !razorpay_signature
    ) {
      return paymentErrorRedirect(res, 'Missing payment details from Razorpay');
    }

    let transaction = null;
    if (supabase) {
      transaction = await loadTransaction(supabase, {
        referenceId: razorpay_payment_link_reference_id,
      });
    }

    const appName = transaction?.app_name || 'iiskills';
    const { keyId, keySecret } = getRazorpayCredentialsForApp(appName);
    if (!keySecret) {
      return paymentErrorRedirect(res, 'Payment system not configured');
    }

    if (
      !verifyPaymentLinkCallbackSignature(
        {
          razorpay_payment_link_id,
          razorpay_payment_link_reference_id,
          razorpay_payment_link_status,
          razorpay_payment_id,
          razorpay_signature,
        },
        keySecret,
      )
    ) {
      console.error('[razorpay-callback] Invalid payment link signature');
      return paymentErrorRedirect(res, 'Invalid payment signature');
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    let paymentLink;
    try {
      paymentLink = await razorpay.paymentLink.fetch(razorpay_payment_link_id);
    } catch (err) {
      console.error('[razorpay-callback] payment link fetch failed:', err.message);
      return paymentErrorRedirect(res, 'Unable to verify payment');
    }

    if (paymentLink.status !== 'paid') {
      console.log(`[razorpay-callback] API payment link status=${paymentLink.status}`);
      return paymentPendingRedirect(res, appName);
    }

    let captureCheck;
    try {
      captureCheck = await assertPaymentCaptured(razorpay, razorpay_payment_id);
    } catch (err) {
      console.error('[razorpay-callback] payment fetch failed:', err.message);
      return paymentErrorRedirect(res, 'Unable to verify payment');
    }

    if (!captureCheck.ok) {
      console.log(
        `[razorpay-callback] blocked non-captured payment link payment: status=${captureCheck.payment?.status}`,
      );
      if (captureCheck.pending) {
        return paymentPendingRedirect(res, appName);
      }
      return paymentErrorRedirect(res, captureCheck.error);
    }

    const orderId = captureCheck.payment.order_id;
    if (!orderId) {
      return paymentErrorRedirect(res, 'Missing order for payment');
    }

    if (supabase) {
      transaction = (await loadTransaction(supabase, { orderId })) || transaction;
    }

    return finalizeAndRedirect(res, {
      transaction,
      appName,
      paymentParams: {
        razorpay_order_id: orderId,
        razorpay_payment_id,
        razorpay_signature: buildOrderSignature(orderId, razorpay_payment_id, keySecret),
        purchaseId: transaction?.session_id || razorpay_payment_link_reference_id,
      },
    });
  }

  if (
    req.method === 'GET' &&
    req.query.razorpay_payment_id &&
    req.query.razorpay_order_id &&
    req.query.razorpay_signature
  ) {
    return handleStandardCheckoutCallback(res, {
      supabase,
      razorpay_order_id: req.query.razorpay_order_id,
      razorpay_payment_id: req.query.razorpay_payment_id,
      razorpay_signature: req.query.razorpay_signature,
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};

  return handleStandardCheckoutCallback(res, {
    supabase,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  });
}
