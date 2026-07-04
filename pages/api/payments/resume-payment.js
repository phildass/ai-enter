import crypto from 'crypto';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';
import { completeVerifiedPayment } from '../../../lib/completeVerifiedPayment';
import { getRazorpayCredentialsForApp } from '../../../lib/payments';

const DEFAULT_REDIRECT = 'https://iiskills.in/dashboard';

/**
 * Mobile UPI recovery: when the user returns from GPay/PhonePe but Razorpay
 * checkout lost the JS callback, poll the order and complete payment server-side.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    order_id,
    purchaseId,
    iiskills_token,
    course,
    app_name: bodyAppName,
  } = req.body || {};

  if (!order_id) {
    return res.status(400).json({ error: 'Missing order_id' });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  let transaction = null;
  if (supabaseUrl && serviceRoleKey) {
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data, error } = await supabase
      .from('payment_transactions')
      .select('app_name, session_id, course, handoff_token, status, return_url')
      .eq('razorpay_order_id', order_id)
      .maybeSingle();

    if (error) {
      console.error('[resume-payment] Supabase lookup failed:', error.message);
    } else {
      transaction = data;
    }
  }

  const appName = transaction?.app_name || bodyAppName || (iiskills_token ? 'iiskills' : null);

  if (transaction?.status === 'success') {
    return res.status(200).json({
      success: true,
      paid: true,
      captured: true,
      payment_status: 'captured',
      redirect_url:
        transaction.return_url || DEFAULT_REDIRECT,
    });
  }

  if (!appName) {
    return res.status(400).json({ error: 'Unable to determine payment app' });
  }

  const { keyId, keySecret } = getRazorpayCredentialsForApp(appName);
  if (!keySecret) {
    return res.status(500).json({ error: `Payment system not configured for ${appName}` });
  }

  const razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });

  let payments;
  try {
    payments = await razorpay.orders.fetchPayments(order_id);
  } catch (err) {
    console.error('[resume-payment] fetchPayments failed:', err.message);
    return res.status(200).json({ success: false, paid: false, pending: true, payment_status: 'pending' });
  }

  // Only confirm after Razorpay reports captured funds — never on authorized/pending.
  const captured = payments?.items?.find((p) => p.status === 'captured');

  if (!captured?.id) {
    return res.status(200).json({ success: false, paid: false, pending: true, payment_status: 'pending' });
  }

  let orderAmountPaise;
  try {
    const order = await razorpay.orders.fetch(order_id);
    orderAmountPaise = order.amount;
  } catch (err) {
    console.error('[resume-payment] order fetch failed:', err.message);
    return res.status(200).json({ success: false, paid: false, pending: true, payment_status: 'pending' });
  }

  if (orderAmountPaise && captured.amount !== orderAmountPaise) {
    console.error(
      `[resume-payment] amount mismatch order=${orderAmountPaise} payment=${captured.amount}`,
    );
    return res.status(200).json({ success: false, paid: false, pending: true, payment_status: 'pending' });
  }

  const razorpay_payment_id = captured.id;
  const razorpay_signature = crypto
    .createHmac('sha256', keySecret)
    .update(`${order_id}|${razorpay_payment_id}`)
    .digest('hex');

  const token = iiskills_token || transaction?.handoff_token || null;

  try {
    const result = await completeVerifiedPayment({
      razorpay_order_id: order_id,
      razorpay_payment_id,
      razorpay_signature,
      purchaseId: purchaseId || transaction?.session_id,
      course: course || transaction?.course,
      iiskills_token: token || undefined,
      app_name: appName,
      entitlement_source: 'resume',
    });

    if (!result.ok) {
      return res.status(result.status || 500).json({ error: result.error });
    }

    if (result.confirmFailed) {
      return res.status(200).json({
        success: true,
        paid: true,
        captured: true,
        payment_status: 'captured',
        confirmFailed: true,
        confirmError: result.confirmError,
        redirect_url: result.redirect_url || DEFAULT_REDIRECT,
      });
    }

    return res.status(200).json({
      success: true,
      paid: true,
      captured: true,
      payment_status: 'captured',
      redirect_url:
        result.redirect_url ||
        transaction?.return_url ||
        DEFAULT_REDIRECT,
    });
  } catch (err) {
    console.error('[resume-payment] completeVerifiedPayment error:', err);
    return res.status(500).json({ error: 'Payment completion failed' });
  }
}
