import crypto from 'crypto';

/**
 * Verify a signed handoff token from an origin site.
 *
 * Token format: base64url(JSON.stringify(payload)) + '.' + hmac_sha256_hex(base64url_payload, secret)
 *
 * @param {string} token - The signed token string
 * @returns {object} Verified and decoded payload
 * @throws {Error} If the token is invalid, tampered with, or expired
 */
export function verifyHandoffToken(token) {
  if (!process.env.HANDOFF_SIGNING_SECRET) {
    throw new Error('HANDOFF_SIGNING_SECRET not configured');
  }

  const parts = token.split('.');
  if (parts.length !== 2) {
    throw new Error('Invalid token format');
  }

  const [payloadB64, sig] = parts;

  const expected = crypto
    .createHmac('sha256', process.env.HANDOFF_SIGNING_SECRET)
    .update(payloadB64)
    .digest('hex');

  // Use constant-time comparison to prevent timing attacks
  let sigBuf, expectedBuf;
  try {
    sigBuf = Buffer.from(sig, 'hex');
    expectedBuf = Buffer.from(expected, 'hex');
  } catch {
    throw new Error('Invalid token signature encoding');
  }

  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    throw new Error('Invalid token signature');
  }

  let payload;
  try {
    payload = JSON.parse(Buffer.from(payloadB64, 'base64').toString('utf8'));
  } catch {
    throw new Error('Invalid token payload encoding');
  }

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) {
    throw new Error('Token expired');
  }

  if (!['iiskills', 'jai-bharat', 'jai-kisan'].includes(payload.app_name)) {
    throw new Error('Invalid app_name in token');
  }

  return payload;
}

/**
 * Build the HMAC-SHA256 signature for an outgoing webhook payload.
 *
 * @param {string} rawBody - The raw JSON string body
 * @returns {string} Hex-encoded HMAC-SHA256 signature
 */
export function signWebhookPayload(rawBody) {
  if (!process.env.ORIGIN_WEBHOOK_SECRET) {
    throw new Error('ORIGIN_WEBHOOK_SECRET not configured');
  }
  return crypto
    .createHmac('sha256', process.env.ORIGIN_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');
}
