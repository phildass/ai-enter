import crypto from 'crypto';

const ALLOWED_APPS = ['jai-bharat', 'jai-kisan'];
const ALLOWED_RETURN_DOMAINS = ['jaibharat.cloud', 'jaikisan.cloud'];
const EXPECTED_AMOUNT_PAISE = 11682;

/**
 * Verify a signed handoff token from an origin site.
 *
 * Token format:
 *   base64url(payload_json) + "." + base64url(hmac_sha256(base64url_payload, HANDOFF_SIGNING_SECRET))
 *
 * Returns the parsed payload object on success, or throws an Error describing the failure.
 */
export function verifyHandoffToken(token) {
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
  if (payload.amount_paise !== EXPECTED_AMOUNT_PAISE) {
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
