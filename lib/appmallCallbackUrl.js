const DEFAULT_APPMALL_CALLBACK = 'https://appmall.in/api/payments/callback';

/**
 * Razorpay browser redirect target for appmall handoff payments.
 * appmall.in handles captured / authorized / retry — not aienter.in.
 */
export function buildAppmallRazorpayCallbackUrl({ tokenPayload, rawToken, purchaseId }) {
  const base =
    tokenPayload?.callback ||
    tokenPayload?.callback_url ||
    process.env.APPMALL_CALLBACK_URL ||
    DEFAULT_APPMALL_CALLBACK;

  let url;
  try {
    url = new URL(base);
  } catch {
    url = new URL(DEFAULT_APPMALL_CALLBACK);
  }

  if (rawToken) {
    url.searchParams.set('token', rawToken);
  }
  if (purchaseId) {
    url.searchParams.set('purchaseId', purchaseId);
  }
  if (tokenPayload?.user_id) {
    url.searchParams.set('user_id', String(tokenPayload.user_id));
  }
  if (tokenPayload?.courseSlug || tokenPayload?.course_slug) {
    url.searchParams.set(
      'course_id',
      String(tokenPayload.courseSlug || tokenPayload.course_slug),
    );
  }
  if (tokenPayload?.source) {
    url.searchParams.set('source', String(tokenPayload.source));
  } else {
    url.searchParams.set('source', 'appmall');
  }

  return url.toString();
}
