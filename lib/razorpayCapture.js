/** Razorpay events that may grant entitlements — never payment.authorized. */
export const ENTITLEMENT_WEBHOOK_EVENTS = new Set(['payment.captured']);

export function isEntitlementWebhookEvent(eventType) {
  return ENTITLEMENT_WEBHOOK_EVENTS.has(eventType);
}

/**
 * Fetch payment from Razorpay and require status === 'captured'.
 * Returns pending:true for authorized/created (UPI intent in progress).
 */
export async function assertPaymentCaptured(razorpay, paymentId, expectedOrderId) {
  const payment = await razorpay.payments.fetch(paymentId);

  if (payment.status !== 'captured') {
    return {
      ok: false,
      pending: payment.status === 'authorized' || payment.status === 'created',
      error: `Payment status is ${payment.status}, not captured`,
      payment,
    };
  }

  if (expectedOrderId && payment.order_id && payment.order_id !== expectedOrderId) {
    return {
      ok: false,
      pending: false,
      error: 'Payment does not match this order',
      payment,
    };
  }

  return { ok: true, payment };
}
