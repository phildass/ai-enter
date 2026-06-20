import { createClient } from '@supabase/supabase-js';
import { completeVerifiedPayment } from '../../../lib/completeVerifiedPayment';

const DEFAULT_REDIRECTS = {
  iiskills: 'https://iiskills.in/dashboard',
  'uriq.in': 'https://uriq.in/dashboard',
};

function redirect(res, url) {
  res.writeHead(303, { Location: url });
  res.end();
}

/**
 * Razorpay POST callback for mobile UPI / redirect flows.
 * Razorpay sends razorpay_order_id, razorpay_payment_id, razorpay_signature.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return redirect(
      res,
      `/payments/success?error=${encodeURIComponent('Missing payment details from Razorpay')}`,
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  let transaction = null;
  if (supabaseUrl && serviceRoleKey) {
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data, error } = await supabase
      .from('payment_transactions')
      .select('app_name, session_id, course, handoff_token, status, return_url')
      .eq('razorpay_order_id', razorpay_order_id)
      .maybeSingle();

    if (error) {
      console.error('[razorpay-callback] Supabase lookup failed:', error.message);
    } else {
      transaction = data;
    }
  }

  if (transaction?.status === 'success') {
    const doneUrl =
      transaction.return_url ||
      DEFAULT_REDIRECTS[transaction.app_name] ||
      `/payments/success?app=${encodeURIComponent(transaction.app_name || 'iiskills')}`;
    return redirect(res, doneUrl);
  }

  const appName = transaction?.app_name;
  const handoffToken = transaction?.handoff_token;
  const purchaseId = transaction?.session_id;

  let result;
  try {
    result = await completeVerifiedPayment({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      purchaseId,
      course: transaction?.course,
      iiskills_token: appName === 'iiskills' ? handoffToken : undefined,
      uriq_token: appName === 'uriq.in' ? handoffToken : undefined,
      app_name: appName,
    });
  } catch (err) {
    console.error('[razorpay-callback] Verification error:', err);
    return redirect(
      res,
      `/payments/success?error=${encodeURIComponent('Payment verification failed')}`,
    );
  }

  if (!result.ok) {
    return redirect(
      res,
      `/payments/success?error=${encodeURIComponent(result.error || 'Payment verification failed')}`,
    );
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
    `/payments/success?app=${encodeURIComponent(appName || 'iiskills')}`;

  return redirect(res, destination);
}
