import { verifyIiskillsToken } from '../../../lib/verifyIiskillsToken';
import { callIiskillsPending } from '../../../lib/callIiskillsPending';
import { resolveIiskillsCourseSlug } from '../../../lib/iiskillsOffer';

/**
 * Client-triggered grace hook after Razorpay checkout opens (UPI processing).
 * Not used on page load or Pay click before checkout engagement.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { order_id, purchaseId, iiskills_token, course } = req.body || {};

  if (!order_id) {
    return res.status(400).json({ error: 'Missing order_id' });
  }

  if (!iiskills_token) {
    return res.status(400).json({ error: 'Missing iiskills_token' });
  }

  let payload;
  try {
    payload = verifyIiskillsToken(iiskills_token, { expectedPurchaseId: purchaseId });
  } catch (err) {
    return res.status(400).json({ error: err.message || 'Invalid iiskills token' });
  }

  const appId = resolveIiskillsCourseSlug(course || payload.courseSlug);

  const result = await callIiskillsPending({
    purchaseId: payload.purchaseId,
    razorpayOrderId: order_id,
    appId,
    userToken: iiskills_token,
  });

  if (result.skipped) {
    return res.status(200).json({ ok: true, skipped: true, reason: result.reason });
  }

  if (!result.ok) {
    return res.status(200).json({ ok: false, error: result.error || 'pending_notify_failed' });
  }

  return res.status(200).json({ ok: true });
}
