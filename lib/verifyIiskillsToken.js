import crypto from 'crypto';
import { IISKILLS_ALLOWED_COURSES } from './courses';

/**
 * Verify a standard JWT (HS256) token issued by iiskills generate-token endpoint.
 *
 * The token is a standard JWT signed with HMAC-SHA256 using the secret stored
 * in IISKILLS_PAYMENT_TOKEN_SECRET.
 *
 * Expected payload fields (token may vary by version):
 *   - purchaseId   {string}  unique purchase ID from iiskills
 *   - purchase_id  {string}  (alt) unique purchase ID from iiskills
 *   - course_slug  {string}  course identifier (must be in IISKILLS_ALLOWED_COURSES)
 *   - appId        {string}  alternative field name for course_slug
 *   - courseSlug   {string}  alternative field name for course_slug
 *   - user_id      {string}  (optional) iiskills user identifier
 *   - phone        {string}  (optional) user phone number
 *   - name         {string}  (optional) user display name
 *   - return_to    {string}  (optional) URL to redirect the user after payment
 *   - exp          {number}  Unix timestamp expiry
 *
 * Behavior:
 * - Verifies HS256 signature.
 * - Enforces expiry.
 * - Validates course slug against IISKILLS_ALLOWED_COURSES.
 * - Ensures a purchaseId exists, either from the token payload OR (optionally)
 *   from a trusted external value (e.g., query string) passed as expectedPurchaseId.
 *
 * Returns the normalized decoded payload on success, throws an Error on failure.
 */
export function verifyIiskillsToken(token, opts = {}) {
  const { expectedPurchaseId } = opts;

  const secret = process.env.IISKILLS_PAYMENT_TOKEN_SECRET;
  console.log('[verifyIiskillsToken] Starting token verification...');
  console.log('[verifyIiskillsToken] Secret configured:', !!secret);
  console.log('[verifyIiskillsToken] Token received:', !!token);
  
  if (!secret) {
    const err = 'IISKILLS_PAYMENT_TOKEN_SECRET is not configured';
    console.error('[verifyIiskillsToken] ❌', err);
    throw new Error(err);
  }

  if (!token || typeof token !== 'string') {
    const err = 'Token is required';
    console.error('[verifyIiskillsToken] ❌', err);
    throw new Error(err);
  }

  const parts = token.split('.');
  console.log('[verifyIiskillsToken] Token parts:', parts.length);
  
  if (parts.length !== 3) {
    const err = `Invalid token format (expected JWT with 3 parts, got ${parts.length})`;
    console.error('[verifyIiskillsToken] ❌', err);
    throw new Error(err);
  }

  const [headerB64, payloadB64, sigB64] = parts;

  // Verify HS256 signature: HMAC-SHA256(headerB64 + '.' + payloadB64, secret)
  const signingInput = `${headerB64}.${payloadB64}`;
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(signingInput)
    .digest('base64url');

  console.log('[verifyIiskillsToken] Token signature (first 20 chars):', sigB64.substring(0, 20));
  console.log('[verifyIiskillsToken] Expected signature (first 20 chars):', expectedSig.substring(0, 20));

  let sigBuf, expectedBuf;
  try {
    sigBuf = Buffer.from(sigB64, 'base64url');
    expectedBuf = Buffer.from(expectedSig, 'base64url');
  } catch (e) {
    const err = `Invalid token signature encoding: ${e.message}`;
    console.error('[verifyIiskillsToken] ❌', err);
    throw new Error(err);
  }

  if (
    sigBuf.length === 0 ||
    sigBuf.length !== expectedBuf.length ||
    !crypto.timingSafeEqual(sigBuf, expectedBuf)
  ) {
    const err = `Invalid token signature (sigBuf.length=${sigBuf.length}, expectedBuf.length=${expectedBuf.length})`;
    console.error('[verifyIiskillsToken] ❌', err);
    throw new Error(err);
  }

  console.log('[verifyIiskillsToken] ✅ Signature verified');

  // Decode payload
  let payload;
  try {
    payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    console.log('[verifyIiskillsToken] Payload decoded:', {
      purchaseId: payload.purchaseId || payload.purchase_id,
      course_slug: payload.course_slug,
      exp: payload.exp,
      nowSec: Math.floor(Date.now() / 1000),
    });
  } catch (e) {
    const err = `Invalid token payload: ${e.message}`;
    console.error('[verifyIiskillsToken] ❌', err);
    throw new Error(err);
  }

  // Verify expiry
  const nowSec = Math.floor(Date.now() / 1000);
  if (!payload.exp || payload.exp < nowSec) {
    const err = `Token has expired (exp=${payload.exp}, now=${nowSec})`;
    console.error('[verifyIiskillsToken] ❌', err);
    throw new Error(err);
  }

  console.log('[verifyIiskillsToken] ✅ Token not expired');

  // Normalize purchaseId (token may use purchaseId or purchase_id).
  const tokenPurchaseId = payload.purchaseId || payload.purchase_id;

  // Require purchaseId:
  // - Prefer token claim
  // - Allow fallback from expectedPurchaseId (e.g. query param), if provided
  const purchaseId = tokenPurchaseId || expectedPurchaseId;
  if (!purchaseId) {
    const err = 'Token missing purchaseId';
    console.error('[verifyIiskillsToken] ❌', err);
    throw new Error(err);
  }

  // If both exist, they must match
  if (tokenPurchaseId && expectedPurchaseId && tokenPurchaseId !== expectedPurchaseId) {
    const err = 'Token purchaseId mismatch';
    console.error('[verifyIiskillsToken] ❌', err);
    throw new Error(err);
  }

  // Resolve course slug (iiskills may send course_slug or appId)
  const courseSlug = payload.course_slug || payload.appId || payload.courseSlug;
  console.log('[verifyIiskillsToken] Course slug:', courseSlug);
  console.log('[verifyIiskillsToken] Allowed courses:', IISKILLS_ALLOWED_COURSES);
  
  if (!courseSlug) {
    const err = 'Token missing course_slug/appId';
    console.error('[verifyIiskillsToken] ❌', err);
    throw new Error(err);
  }
  if (!IISKILLS_ALLOWED_COURSES.includes(courseSlug)) {
    const err = `Invalid course in token: ${courseSlug}. Allowed: ${IISKILLS_ALLOWED_COURSES.join(', ')}`;
    console.error('[verifyIiskillsToken] ❌', err);
    throw new Error(err);
  }

  console.log('[verifyIiskillsToken] ✅ All validations passed');

  return {
    ...payload,
    purchaseId, // normalized
    courseSlug,
  };
}
