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

/**
 * Create a Razorpay-hosted payment link for reliable mobile UPI (avoids checkout.js modal).
 */
export async function createPaymentLinkForOrder(
  razorpay,
  {
    orderId,
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
  const phone = normalizeIndianPhone(customerPhone) || '9999999999';

  const paymentLink = await razorpay.paymentLink.create({
    amount: amountPaise,
    currency: currency || 'INR',
    accept_partial: false,
    order_id: orderId,
    reference_id: String(referenceId || orderId).slice(0, 40),
    description: description || 'Course payment',
    customer: {
      name: (customerName || 'Customer').slice(0, 120),
      contact: phone,
      email: (customerEmail || 'payments@aienter.in').slice(0, 120),
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
    },
  });

  return paymentLink.short_url;
}
