import crypto from 'crypto';

/**
 * Razorpay webhook endpoint
 *
 * Razorpay delivers signed POST requests to this URL.
 * Configure the webhook URL in the Razorpay Dashboard:
 *   https://dashboard.razorpay.com/app/webhooks
 *
 * Set the webhook URL to: https://aienter.in/api/webhooks/razorpay
 * Copy the webhook secret from the dashboard into RAZORPAY_WEBHOOK_SECRET.
 *
 * Signature verification:
 *   HMAC-SHA256(rawBody, RAZORPAY_WEBHOOK_SECRET) must equal
 *   the X-Razorpay-Signature header value.
 *
 * Returns:
 *   200  – webhook received and signature verified
 *   400  – missing/invalid signature or malformed body
 *   405  – method not allowed (non-POST)
 *   500  – server misconfiguration (webhook secret not set)
 */

// Disable Next.js built-in body parsing so we can read the raw bytes
// needed for accurate HMAC signature verification.
export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Read the full request body as a Buffer.
 */
function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

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

  // Log only the event type — never log the full payload which may contain
  // sensitive customer or payment data.
  const eventType = event?.event ?? 'unknown';
  console.log('[razorpay-webhook] Received event:', eventType);

  // Acknowledge receipt to Razorpay.
  // Server-side event processing (e.g. marking orders as paid, sending
  // receipts) can be added here as a reliable server-to-server fallback,
  // independent of the client-side /api/payments/verify-payment flow.
  return res.status(200).json({ received: true });
}
