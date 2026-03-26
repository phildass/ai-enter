import crypto from 'crypto';

const ALLOWED_APPS = ['jai-bharat', 'jai-kisan', 'iiskills', 'iisacademy'];
const ALLOWED_RETURN_DOMAINS = ['jaibharat.cloud', 'jaikisan.cloud', 'iiskills.in', 'iisacademy.in'];
const EXPECTED_AMOUNT_PAISE = 11682;
// Valid IIS Academy amounts: ₹999 + 18% GST = 117882 paise, ₹2999 + 18% GST = 353882 paise
const IISACADEMY_ALLOWED_AMOUNTS = [117882, 353882];

/**
 * Verify a signed handoff token from an origin site.
 *
 * Token format:
 *   base64url(payload_json) + "." + base64url(hmac_sha256(base64url_payload, HANDOFF_SIGNING_SECRET))
 *
 * Returns the parsed payload object on success, or throws an Error describing the failure.
 *
 * @param {string} token
 * @param {{ expectedAmountPaise?: number }} [options]
 */
export function verifyHandoffToken(token, options = {}) {
  const secret = process.env.HANDOFF_SIGNING_SECRET;
  if (!secret) {
    throw new Error('HANDOFF_SIGNING_SECRET is not configured');
  }

  if (!token || typeof token !== 'string') {
    throw new Error('Token is required');
  }

  const dotIndex = token.indexOf('.');
  if (dotIndex === -1 || dotIndex === 0 || dotIndex === token.length - 1) {
    throw new Error('Invalid token format');
  }

  const payloadB64 = token.slice(0, dotIndex);
  const sigB64 = token.slice(dotIndex + 1);

  // Compute expected signature
  const expectedSigB64 = Buffer.from(
    crypto.createHmac('sha256', secret).update(payloadB64).digest()
  ).toString('base64url');

  // Constant-time comparison to prevent timing attacks
  const sigBuf = Buffer.from(sigB64);
  const expectedBuf = Buffer.from(expectedSigB64);
  if (
    sigBuf.length !== expectedBuf.length ||
    !crypto.timingSafeEqual(sigBuf, expectedBuf)
  ) {
    throw new Error('Invalid token signature');
  }

  // Decode and parse payload
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

  // Verify app_name
  if (!ALLOWED_APPS.includes(payload.app_name)) {
    throw new Error('Invalid app_name in token');
  }

  // Verify amount_paise
  if (payload.app_name === 'iisacademy') {
    // For iisacademy, validate against caller-supplied expected amount (117882 or 353882 paise).
    // If no expected amount is provided (e.g. in create-order), just ensure it is a valid iisacademy amount.
    const expected = options.expectedAmountPaise;
    if (expected !== undefined) {
      if (payload.amount_paise !== expected) {
        throw new Error('Invalid amount in token');
      }
    } else if (!IISACADEMY_ALLOWED_AMOUNTS.includes(payload.amount_paise)) {
      throw new Error('Invalid amount in token');
    }
  } else if (payload.amount_paise !== EXPECTED_AMOUNT_PAISE) {
    throw new Error('Invalid amount in token');
  }

  // Verify return_url domain (prevent open redirect)
  if (payload.return_url) {
    let hostname;
    try {
      hostname = new URL(payload.return_url).hostname.replace(/^www\./, '');
    } catch {
      throw new Error('Invalid return_url format');
    }
    if (!ALLOWED_RETURN_DOMAINS.includes(hostname)) {
      throw new Error('Invalid return_url domain');
    }
  }

  return payload;
}
