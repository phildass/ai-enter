import { verifyAppmallToken } from '../../../lib/verifyAppmallToken';
import { callAppmallPending } from '../../../lib/callAppmallPending';
import { resolveAppmallCourseSlug } from '../../../lib/appmallOffer';

/**
 * Client-triggered grace hook after Razorpay checkout opens (UPI processing).
 * Not used on page load or Pay click before checkout engagement.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { order_id, purchaseId, appmall_token, course } = req.body || {};

  if (!order_id) {
    return res.status(400).json({ error: 'Missing order_id' });
  }

  if (!appmall_token) {
    return res.status(400).json({ error: 'Missing appmall_token' });
  }

  let payload;
  try {
    payload = verifyAppmallToken(appmall_token, { expectedPurchaseId: purchaseId });
  } catch (err) {
    return res.status(400).json({ error: err.message || 'Invalid appmall token' });
  }

  const appId = resolveAppmallCourseSlug(course || payload.courseSlug);

  const result = await callAppmallPending({
    purchaseId: payload.purchaseId,
    razorpayOrderId: order_id,
    appId,
    userToken: appmall_token,
  });

  if (result.skipped) {
    return res.status(200).json({ ok: true, skipped: true, reason: result.reason });
  }

  if (!result.ok) {
    return res.status(200).json({ ok: false, error: result.error || 'pending_notify_failed' });
  }

  return res.status(200).json({ ok: true });
}
