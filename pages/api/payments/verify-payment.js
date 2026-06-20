import { completeVerifiedPayment } from '../../../lib/completeVerifiedPayment';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // iiskills/uriq JWT flows must confirm only via Razorpay callback/webhook after capture.
  if (req.body?.iiskills_token || req.body?.uriq_token) {
    return res.status(403).json({
      error:
        'This payment must complete via Razorpay redirect. Entitlements are granted only after captured payment is verified server-side.',
    });
  }

  try {
    const result = await completeVerifiedPayment({
      ...req.body,
      entitlement_source: 'client',
    });

    if (!result.ok) {
      return res.status(result.status || 500).json({ error: result.error });
    }

    if (result.confirmFailed) {
      return res.status(200).json({
        success: true,
        confirmFailed: true,
        confirmError: result.confirmError,
        confirmDebug: result.confirmDebug || null,
        purchaseId: result.purchaseId,
        razorpayPaymentId: result.razorpayPaymentId,
        transactionId: result.transactionId,
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      redirect_url: result.redirect_url,
      transactionId: result.transactionId,
      session_id: result.session_id,
      return_url: result.return_url,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return res.status(500).json({ error: 'Payment verification failed' });
  }
}
