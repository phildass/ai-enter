import crypto from 'crypto';

export function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://aienter.in').replace(
    /\/$/,
    '',
  );
}

export function normalizeIndianPhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (digits.length >= 10) return digits.slice(-10);
  return null;
}

export function extractCustomerPhone(source) {
  if (!source || typeof source !== 'object') return null;
  return normalizeIndianPhone(
    source.phone ||
      source.user_phone ||
      source.mobile ||
      source.phone_number ||
      source.contact ||
      source.customer_phone,
  );
}

export function requireIndianPhone(phone, label = 'mobile number') {
  const normalized = normalizeIndianPhone(phone);
  if (!normalized) {
    throw new Error(`Valid 10-digit ${label} is required for UPI payment`);
  }
  return normalized;
}

export function formatRazorpayError(error) {
  if (!error) return 'Unable to process payment. Please try again.';

  const description = error.error?.description || error.description;
  if (description) return description;

  if (error.message && !/^\{/.test(error.message)) {
    return error.message;
  }

  return 'Unable to process payment. Please try again.';
}

export function verifyPaymentLinkCallbackSignature(params, secret) {
  const {
    razorpay_payment_link_id,
    razorpay_payment_link_reference_id,
    razorpay_payment_link_status,
    razorpay_payment_id,
    razorpay_signature,
  } = params;

  if (!secret || !razorpay_signature) return false;

  const payload = `${razorpay_payment_link_id}|${razorpay_payment_link_reference_id}|${razorpay_payment_link_status}|${razorpay_payment_id}`;
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');

  try {
    const sigBuf = Buffer.from(razorpay_signature, 'utf8');
    const expectedBuf = Buffer.from(expected, 'utf8');
    return sigBuf.length === expectedBuf.length && crypto.timingSafeEqual(sigBuf, expectedBuf);
  } catch {
    return false;
  }
}

function buildUniqueReferenceId(sessionId) {
  const base = String(sessionId || 'pay').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 28);
  const suffix = Date.now().toString(36);
  return `${base}_${suffix}`.slice(0, 40);
}

/**
 * Create a Razorpay-hosted payment link for reliable mobile UPI.
 * Razorpay assigns its own order_id to the link — use that for verification.
 */
export async function createPaymentLinkForOrder(
  razorpay,
  {
    referenceId,
    amountPaise,
    currency,
    description,
    customerName,
    customerPhone,
    customerEmail,
    appName,
  },
) {
  const siteUrl = getSiteUrl();
  const phone = requireIndianPhone(customerPhone, 'Indian mobile number');
  const name = (customerName || 'Customer').slice(0, 120);
  const email = (customerEmail || `${phone}@iiskills.in`).slice(0, 120);
  const linkReference = buildUniqueReferenceId(referenceId);

  const paymentLink = await razorpay.paymentLink.create({
    amount: amountPaise,
    currency: currency || 'INR',
    accept_partial: false,
    reference_id: linkReference,
    description: description || 'Course payment',
    customer: {
      name,
      contact: `+91${phone}`,
      email,
    },
    notify: {
      sms: false,
      email: false,
    },
    reminder_enable: false,
    callback_url: `${siteUrl}/api/payments/razorpay-callback`,
    callback_method: 'get',
    notes: {
      app_name: appName,
      session_id: referenceId || '',
      customer_phone: phone,
      payment_link_reference: linkReference,
    },
  });

  const checkoutUrl = paymentLink?.short_url;
  if (!checkoutUrl) {
    console.error(
      '[razorpay] payment link missing short_url:',
      paymentLink?.id || '(no id)',
      paymentLink?.status || '',
    );
    throw new Error('Payment gateway did not return a checkout URL');
  }

  // Standard payment links often omit order_id until the customer pays.
  // Pre-create an order for DB tracking; the callback uses payment.order_id for verification.
  let orderId = paymentLink.order_id;
  if (!orderId) {
    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: currency || 'INR',
      receipt: linkReference.slice(0, 40),
      notes: {
        app_name: appName,
        session_id: String(referenceId || ''),
        payment_link_id: paymentLink.id,
      },
    });
    orderId = order.id;
  }

  return {
    checkoutUrl,
    orderId,
    paymentLinkId: paymentLink.id,
    referenceId: linkReference,
  };
}
