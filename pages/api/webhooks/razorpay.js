import crypto from 'crypto';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';
import { completeVerifiedPayment } from '../../../lib/completeVerifiedPayment';
import { getRazorpayCredentialsForApp } from '../../../lib/payments';
import {
  assertPaymentCaptured,
  checkoutCooldownRemainingMs,
  isEntitlementWebhookEvent,
  isWithinCheckoutCooldown,
} from '../../../lib/razorpayCapture';

export const config = {
  api: {
    bodyParser: false,
  },
};

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

/**
 * Razorpay webhook — grant entitlements ONLY on payment.captured.
 * Ignores payment.authorized and all other events (no confirm on UPI intent).
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('[razorpay-webhook] RAZORPAY_WEBHOOK_SECRET is not configured');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  const signature = req.headers['x-razorpay-signature'];
  if (!signature) {
    return res.status(400).json({ error: 'Missing X-Razorpay-Signature header' });
  }

  let rawBody;
  try {
    rawBody = await readRawBody(req);
  } catch (err) {
    console.error('[razorpay-webhook] Failed to read request body:', err.message);
    return res.status(400).json({ error: 'Failed to read request body' });
  }

  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');

  if (
    expectedSignature.length !== signature.length ||
    !crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signature))
  ) {
    console.warn('[razorpay-webhook] Invalid signature');
    return res.status(400).json({ error: 'Invalid webhook signature' });
  }

  let event;
  try {
    event = JSON.parse(rawBody.toString('utf8'));
  } catch (err) {
    console.error('[razorpay-webhook] Failed to parse JSON body:', err.message);
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  const eventType = event?.event ?? 'unknown';
  const paymentEntity = event?.payload?.payment?.entity;
  const webhookOrderId = paymentEntity?.order_id;
  const webhookPaymentId = paymentEntity?.id;

  console.log('[razorpay-webhook] hit', {
    ts: new Date().toISOString(),
    event: eventType,
    order_id: webhookOrderId || null,
    payment_id: webhookPaymentId || null,
  });

  if (!isEntitlementWebhookEvent(eventType)) {
    if (eventType === 'payment.authorized') {
      console.log('[razorpay-webhook] Ignoring payment.authorized — waiting for payment.captured');
    }
    return res.status(200).json({ received: true, action: 'ignored', event: eventType });
  }

  const razorpay_order_id = webhookOrderId;
  const razorpay_payment_id = webhookPaymentId;

  if (!razorpay_order_id || !razorpay_payment_id) {
    console.error('[razorpay-webhook] payment.captured missing order_id or payment id');
    return res.status(200).json({ received: true, action: 'skipped', reason: 'missing_ids' });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(200).json({ received: true, action: 'skipped', reason: 'no_supabase' });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data: transaction } = await supabase
    .from('payment_transactions')
    .select(
      'app_name, session_id, course, handoff_token, status, razorpay_payment_id, created_at, updated_at',
    )
    .eq('razorpay_order_id', razorpay_order_id)
    .maybeSingle();

  const appName = transaction?.app_name || paymentEntity?.notes?.app_name || 'iiskills';
  const { keyId, keySecret } = getRazorpayCredentialsForApp(appName);

  if (!keySecret) {
    console.error('[razorpay-webhook] No credentials for app:', appName);
    return res.status(200).json({ received: true, action: 'skipped', reason: 'no_credentials' });
  }

  if (
    transaction?.status === 'success' &&
    transaction.razorpay_payment_id === razorpay_payment_id
  ) {
    return res.status(200).json({ received: true, action: 'already_processed' });
  }

  if (isWithinCheckoutCooldown(transaction)) {
    console.log(
      `[razorpay-webhook] cooldown waiting: order=${razorpay_order_id} payment=${razorpay_payment_id} remainingMs=${checkoutCooldownRemainingMs(transaction)}`,
    );
    return res.status(200).json({ received: true, action: 'cooldown', event: eventType });
  }

  const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

  let captureCheck;
  try {
    captureCheck = await assertPaymentCaptured(razorpay, razorpay_payment_id, razorpay_order_id);
  } catch (err) {
    console.error('[razorpay-webhook] payment fetch failed:', err.message);
    return res.status(200).json({ received: true, action: 'skipped', reason: 'fetch_failed' });
  }

  if (!captureCheck.ok) {
    console.log(
      `[razorpay-webhook] blocked non-captured: id=${razorpay_payment_id} status=${captureCheck.payment?.status}`,
    );
    return res.status(200).json({ received: true, action: 'ignored', reason: 'not_captured' });
  }

  const razorpay_signature = crypto
    .createHmac('sha256', keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  try {
    const result = await completeVerifiedPayment({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      purchaseId: transaction?.session_id,
      course: transaction?.course,
      iiskills_token: appName === 'iiskills' ? transaction?.handoff_token : undefined,
      uriq_token: appName === 'uriq.in' ? transaction?.handoff_token : undefined,
      app_name: appName,
      entitlement_source: 'webhook',
    });

    if (!result.ok) {
      console.error('[razorpay-webhook] completeVerifiedPayment failed:', result.error);
      return res.status(200).json({ received: true, action: 'failed', error: result.error });
    }

    return res.status(200).json({
      received: true,
      action: result.confirmFailed ? 'confirm_failed' : 'completed',
    });
  } catch (err) {
    console.error('[razorpay-webhook] handler error:', err.message);
    return res.status(200).json({ received: true, action: 'error' });
  }
}
