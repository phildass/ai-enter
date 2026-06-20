import crypto from 'crypto';

/**
 * Verify URIQ payment JWT token (HS256).
 * Supports purchaseId from claim or expectedPurchaseId fallback.
 */
export function verifyUriqToken(token, opts = {}) {
  const { expectedPurchaseId } = opts;
  const secret = process.env.URIQ_PAYMENT_TOKEN_SECRET;
  if (!secret) {
    throw new Error('URIQ_PAYMENT_TOKEN_SECRET is not configured');
  }

  if (!token || typeof token !== 'string') {
    throw new Error('Token is required');
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid token format (expected JWT with 3 parts)');
  }

  const [headerB64, payloadB64, sigB64] = parts;
  const signingInput = `${headerB64}.${payloadB64}`;
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(signingInput)
    .digest('base64url');

  const sigBuf = Buffer.from(sigB64, 'base64url');
  const expectedBuf = Buffer.from(expectedSig, 'base64url');
  if (
    sigBuf.length === 0 ||
    sigBuf.length !== expectedBuf.length ||
    !crypto.timingSafeEqual(sigBuf, expectedBuf)
  ) {
    throw new Error('Invalid token signature');
  }

  let payload;
  try {
    payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
  } catch {
    throw new Error('Invalid token payload');
  }

  const nowSec = Math.floor(Date.now() / 1000);
  if (!payload.exp || payload.exp < nowSec) {
    throw new Error('Token has expired');
  }

  const tokenPurchaseId = payload.purchaseId || payload.purchase_id;
  const purchaseId = tokenPurchaseId || expectedPurchaseId;
  if (!purchaseId) {
    throw new Error('Token missing purchaseId');
  }
  if (tokenPurchaseId && expectedPurchaseId && tokenPurchaseId !== expectedPurchaseId) {
    throw new Error('Token purchaseId mismatch');
  }

  return {
    ...payload,
    purchaseId,
  };
}
