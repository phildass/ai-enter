import crypto from 'crypto';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';
import { completeVerifiedPayment } from '../../../lib/completeVerifiedPayment';
import { getRazorpayCredentialsForApp } from '../../../lib/payments';
import { verifyPaymentLinkCallbackSignature } from '../../../lib/razorpayPaymentLink';

const DEFAULT_REDIRECTS = {
  iiskills: 'https://iiskills.in/dashboard',
  'uriq.in': 'https://uriq.in/dashboard',
};

function redirect(res, url) {
  res.writeHead(303, { Location: url });
  res.end();
}

function paymentErrorRedirect(res, message) {
  return redirect(
    res,
    `/payments/success?error=${encodeURIComponent(message || 'Payment failed')}`,
  );
}

async function loadTransaction(supabase, { orderId, referenceId }) {
  if (orderId) {
    const { data } = await supabase
      .from('payment_transactions')
      .select('app_name, session_id, course, handoff_token, status, return_url, razorpay_order_id')
      .eq('razorpay_order_id', orderId)
      .maybeSingle();
    if (data) return data;
  }

  if (referenceId) {
    const { data: exact } = await supabase
      .from('payment_transactions')
      .select('app_name, session_id, course, handoff_token, status, return_url, razorpay_order_id')
      .eq('session_id', referenceId)
      .order('created_at', { ascending: false })
      .limit(1);
    if (exact?.[0]) return exact[0];

    // reference_id may be purchaseId_suffix from buildUniqueReferenceId
    const baseSessionId = referenceId.replace(/_[a-z0-9]+$/i, '');
    if (baseSessionId && baseSessionId !== referenceId) {
      const { data: byBase } = await supabase
        .from('payment_transactions')
        .select('app_name, session_id, course, handoff_token, status, return_url, razorpay_order_id')
        .eq('session_id', baseSessionId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1);
      if (byBase?.[0]) return byBase[0];
    }
  }

  return null;
}

async function finalizeAndRedirect(res, { transaction, appName, keySecret, paymentParams }) {
  if (transaction?.status === 'success') {
    const doneUrl =
      transaction.return_url ||
      DEFAULT_REDIRECTS[appName] ||
      DEFAULT_REDIRECTS.iiskills;
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
    });
  } catch (err) {
    console.error('[razorpay-callback] Verification error:', err);
    return paymentErrorRedirect(res, 'Payment verification failed');
  }

  if (!result.ok) {
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

/**
 * Razorpay callback — payment links (GET, mobile-friendly) and legacy checkout (POST).
 */
export default async function handler(req, res) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase =
    supabaseUrl && serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey) : null;

  // Payment Link success redirect (hosted checkout — recommended for mobile UPI)
  if (req.method === 'GET' && req.query.razorpay_payment_link_id) {
    const {
      razorpay_payment_id,
      razorpay_payment_link_id,
      razorpay_payment_link_reference_id,
      razorpay_payment_link_status,
      razorpay_signature,
    } = req.query;

    if (razorpay_payment_link_status !== 'paid') {
      return paymentErrorRedirect(res, 'Payment was not completed');
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
    let orderId;

    try {
      const payment = await razorpay.payments.fetch(razorpay_payment_id);
      orderId = payment.order_id;
    } catch (err) {
      console.error('[razorpay-callback] Failed to fetch payment:', err.message);
      return paymentErrorRedirect(res, 'Unable to verify payment');
    }

    if (!orderId) {
      return paymentErrorRedirect(res, 'Missing order for payment');
    }

    try {
      const payment = await razorpay.payments.fetch(razorpay_payment_id);
      if (payment.status !== 'captured') {
        return paymentErrorRedirect(res, 'Payment was not completed');
      }
      if (payment.order_id && payment.order_id !== orderId) {
        return paymentErrorRedirect(res, 'Payment does not match this order');
      }
    } catch (err) {
      console.error('[razorpay-callback] payment verify failed:', err.message);
      return paymentErrorRedirect(res, 'Unable to verify payment');
    }

    if (supabase) {
      transaction =
        (await loadTransaction(supabase, { orderId })) || transaction;
    }

    const orderSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${orderId}|${razorpay_payment_id}`)
      .digest('hex');

    return finalizeAndRedirect(res, {
      transaction,
      appName,
      keySecret,
      paymentParams: {
        razorpay_order_id: orderId,
        razorpay_payment_id,
        razorpay_signature: orderSignature,
        purchaseId: transaction?.session_id || razorpay_payment_link_reference_id,
      },
    });
  }

  // Legacy Standard Checkout POST callback
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return paymentErrorRedirect(res, 'Missing payment details from Razorpay');
  }

  let transaction = null;
  if (supabase) {
    transaction = await loadTransaction(supabase, { orderId: razorpay_order_id });
  }

  const appName = transaction?.app_name || 'iiskills';

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
