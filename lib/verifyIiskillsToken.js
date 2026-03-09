import crypto from 'crypto';
import { IISKILLS_ALLOWED_COURSES } from './courses';

/**
 * Verify a standard JWT (HS256) token issued by iiskills-cloud.
 *
 * The token is a standard JWT signed with HMAC-SHA256 using the secret stored
 * in IISKILLS_PAYMENT_TOKEN_SECRET.  Expected payload fields:
 *   - purchaseId  {string}  unique purchase ID from iiskills-cloud
 *   - user_id     {string}  (optional) iiskills user identifier
 *   - phone       {string}  (optional) user phone number
 *   - name        {string}  (optional) user display name
 *   - course_slug {string}  course identifier (must be in IISKILLS_ALLOWED_COURSES)
 *   - appId       {string}  alternative field name for course_slug
 *   - return_to   {string}  URL to redirect the user after payment
 *   - exp         {number}  Unix timestamp expiry
 *
 * Returns the decoded payload on success, throws an Error on failure.
 */
export function verifyIiskillsToken(token) {
  const secret = process.env.IISKILLS_PAYMENT_TOKEN_SECRET;
  if (!secret) {
    throw new Error('IISKILLS_PAYMENT_TOKEN_SECRET is not configured');
  }

  if (!token || typeof token !== 'string') {
    throw new Error('Token is required');
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid token format (expected JWT with 3 parts)');
  }

  const [headerB64, payloadB64, sigB64] = parts;

  // Verify HS256 signature: HMAC-SHA256(headerB64 + '.' + payloadB64, secret)
  const signingInput = `${headerB64}.${payloadB64}`;
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(signingInput)
    .digest('base64url');

  let sigBuf, expectedBuf;
  try {
    sigBuf = Buffer.from(sigB64, 'base64url');
    expectedBuf = Buffer.from(expectedSig, 'base64url');
  } catch {
    throw new Error('Invalid token signature encoding');
  }

  if (
    sigBuf.length === 0 ||
    sigBuf.length !== expectedBuf.length ||
    !crypto.timingSafeEqual(sigBuf, expectedBuf)
  ) {
    throw new Error('Invalid token signature');
  }

  // Decode payload
  let payload;
  try {
    payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
  } catch {
    throw new Error('Invalid token payload');
  }

  // Verify expiry
  const nowSec = Math.floor(Date.now() / 1000);
  if (!payload.exp || payload.exp < nowSec) {
    throw new Error('Token has expired');
  }

  // Require purchaseId
  if (!payload.purchaseId) {
    throw new Error('Token missing purchaseId');
  }

  // Resolve course slug (iiskills-cloud may send course_slug or appId)
  const courseSlug = payload.course_slug || payload.appId || payload.courseSlug;
  if (!courseSlug) {
    throw new Error('Token missing course_slug/appId');
  }
  if (!IISKILLS_ALLOWED_COURSES.includes(courseSlug)) {
    throw new Error(`Invalid course in token: ${courseSlug}`);
  }

  return { ...payload, courseSlug };
}
