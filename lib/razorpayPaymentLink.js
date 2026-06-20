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
 * Create a Razorpay-hosted payment link for reliable mobile UPI.
 * UPI intent requires a real customer mobile — never use a placeholder number.
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
  const phone = requireIndianPhone(customerPhone, 'Indian mobile number');
  const name = (customerName || 'Customer').slice(0, 120);
  const email = (customerEmail || `${phone}@iiskills.in`).slice(0, 120);
  const linkReference = String(referenceId || orderId).slice(0, 40);

  const paymentLink = await razorpay.paymentLink.create({
    amount: amountPaise,
    currency: currency || 'INR',
    accept_partial: false,
    order_id: orderId,
    reference_id: linkReference,
    description: description || 'Course payment',
    customer: {
      name,
      contact: phone,
      email,
    },
    notify: {
      sms: false,
      email: false,
    },
    reminder_enable: false,
    callback_url: `${siteUrl}/api/payments/razorpay-callback`,
    callback_method: 'get',
    options: {
      checkout: {
        name: appName === 'iiskills' ? 'IIS Skills' : appName,
        description: description || 'Course payment',
        prefill: {
          name,
          contact: phone,
          email,
        },
      },
    },
    notes: {
      app_name: appName,
      session_id: referenceId || '',
      customer_phone: phone,
    },
  });

  return paymentLink.short_url;
}
