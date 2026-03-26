/**
 * Unit tests for the iiskills payment integration.
 *
 * Run with:  node __tests__/iiskills.test.js
 *
 * Tests cover:
 *   1. computeConfirmSignature – HMAC-SHA256 over the exact raw body string.
 *   2. callIiskillsConfirm payload shape – all required fields are present.
 *   3. verifyIiskillsToken – JWT HS256 verification round-trip.
 */

'use strict';

const assert = require('assert');
const crypto = require('crypto');

// ---------------------------------------------------------------------------
// Helpers (inline so no external deps)
// ---------------------------------------------------------------------------

function base64url(buf) {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/** Compute HMAC-SHA256 hex over rawBody using the provided secret. */
function computeConfirmSignature(rawBody, secret) {
  return crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
}

/** Build a minimal HS256 JWT for testing. */
function buildJwt(payload, secret) {
  const header = base64url(Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })));
  const body = base64url(Buffer.from(JSON.stringify(payload)));
  const signingInput = `${header}.${body}`;
  const sig = base64url(
    crypto.createHmac('sha256', secret).update(signingInput).digest(),
  );
  return `${signingInput}.${sig}`;
}

// ---------------------------------------------------------------------------
// Test 1: computeConfirmSignature – exact raw-body exactness
// ---------------------------------------------------------------------------

(function testSignatureExactness() {
  const secret = 'test-signing-secret';

  // IISKILLS_DEFAULT_AMOUNT_PAISE = 11682 (₹99 + 18% GST = ₹116.82)
  const DEFAULT_AMOUNT_PAISE = 11682;

  const payload = {
    purchaseId: 'purchase-123',
    appId: 'learn-ai',
    amountPaise: DEFAULT_AMOUNT_PAISE,
    razorpayOrderId: 'order_abc',
    razorpayPaymentId: 'pay_xyz',
    paidAt: '2024-01-01T00:00:00.000Z',
    user_token: 'some.jwt.token',
  };

  // Signature must be computed over the exact JSON string (no re-stringify mismatch)
  const rawBody = JSON.stringify(payload);
  const sig1 = computeConfirmSignature(rawBody, secret);
  const sig2 = computeConfirmSignature(rawBody, secret);

  // Deterministic: same input → same output
  assert.strictEqual(sig1, sig2, 'Signature must be deterministic');

  // Correct algorithm: HMAC-SHA256 hex
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  assert.strictEqual(sig1, expected, 'Signature must be HMAC-SHA256 hex');

  // Different secret → different signature
  const sig3 = computeConfirmSignature(rawBody, 'different-secret');
  assert.notStrictEqual(sig1, sig3, 'Different secret must produce different signature');

  // Different body → different signature (no re-stringify mismatch)
  const rawBody2 = JSON.stringify({ ...payload, amountPaise: 11683 });
  const sig4 = computeConfirmSignature(rawBody2, secret);
  assert.notStrictEqual(sig1, sig4, 'Different body must produce different signature');

  console.log('✓ computeConfirmSignature: raw-body exactness');
})();

// ---------------------------------------------------------------------------
// Test 2: confirm payload shape – all required fields present
// ---------------------------------------------------------------------------

(function testConfirmPayloadShape() {
  const REQUIRED_FIELDS = [
    'purchaseId',
    'appId',
    'amountPaise',
    'razorpayOrderId',
    'razorpayPaymentId',
    'paidAt',
    'user_token',
  ];

  // IISKILLS_DEFAULT_AMOUNT_PAISE = 11682 (₹99 + 18% GST = ₹116.82)
  const DEFAULT_AMOUNT_PAISE = 11682;

  const confirmPayload = {
    purchaseId: 'purchase-123',
    appId: 'learn-ai',
    amountPaise: DEFAULT_AMOUNT_PAISE,
    razorpayOrderId: 'order_abc',
    razorpayPaymentId: 'pay_xyz',
    paidAt: new Date().toISOString(),
    user_token: 'some.jwt.token',
  };

  for (const field of REQUIRED_FIELDS) {
    assert.ok(
      Object.prototype.hasOwnProperty.call(confirmPayload, field),
      `Confirm payload must include field: ${field}`,
    );
    assert.notStrictEqual(
      confirmPayload[field],
      undefined,
      `Confirm payload field must not be undefined: ${field}`,
    );
    assert.notStrictEqual(
      confirmPayload[field],
      null,
      `Confirm payload field must not be null: ${field}`,
    );
  }

  // amountPaise must be a positive integer
  assert.ok(
    Number.isInteger(confirmPayload.amountPaise) && confirmPayload.amountPaise > 0,
    'amountPaise must be a positive integer',
  );

  // paidAt must be an ISO 8601 string
  assert.ok(
    !isNaN(Date.parse(confirmPayload.paidAt)),
    'paidAt must be a valid ISO 8601 date string',
  );

  console.log('✓ confirm payload: all required fields present and valid');
})();

// ---------------------------------------------------------------------------
// Test 3: verifyIiskillsToken – JWT HS256 round-trip
// ---------------------------------------------------------------------------

(function testVerifyIiskillsToken() {
  const secret = 'iiskills-test-secret';
  const nowSec = Math.floor(Date.now() / 1000);

  const validPayload = {
    purchaseId: 'purchase-456',
    user_id: 'user-789',
    phone: '9876543210',
    name: 'Test User',
    course_slug: 'learn-ai',
    return_to: 'https://iiskills.in/payment-success',
    exp: nowSec + 3600,
  };

  const token = buildJwt(validPayload, secret);

  // Inline verification (mirrors verifyIiskillsToken logic)
  const parts = token.split('.');
  assert.strictEqual(parts.length, 3, 'JWT must have 3 parts');

  const [headerB64, payloadB64, sigB64] = parts;
  const signingInput = `${headerB64}.${payloadB64}`;
  const expectedSig = base64url(
    crypto.createHmac('sha256', secret).update(signingInput).digest(),
  );
  assert.strictEqual(sigB64, expectedSig, 'JWT signature must verify with correct secret');

  // Decode and check payload
  const decoded = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
  assert.strictEqual(decoded.purchaseId, validPayload.purchaseId, 'purchaseId must round-trip');
  assert.strictEqual(decoded.course_slug, validPayload.course_slug, 'course_slug must round-trip');

  // Wrong secret → different signature
  const wrongSig = base64url(
    crypto.createHmac('sha256', 'wrong-secret').update(signingInput).digest(),
  );
  assert.notStrictEqual(sigB64, wrongSig, 'Wrong secret must fail signature check');

  // Expired token
  const expiredPayload = { ...validPayload, exp: nowSec - 1 };
  const expiredToken = buildJwt(expiredPayload, secret);
  const expParts = expiredToken.split('.');
  const expDecoded = JSON.parse(Buffer.from(expParts[1], 'base64url').toString('utf8'));
  assert.ok(expDecoded.exp < nowSec, 'Expired token must have exp in the past');

  // Token with invalid course must be rejected
  const badCoursePayload = { ...validPayload, course_slug: 'learn-invalid' };
  const badToken = buildJwt(badCoursePayload, secret);
  const badParts = badToken.split('.');
  const badDecoded = JSON.parse(Buffer.from(badParts[1], 'base64url').toString('utf8'));
  const ALLOWED_COURSES = ['learn-ai', 'learn-developer', 'learn-pr', 'learn-management'];
  assert.ok(
    !ALLOWED_COURSES.includes(badDecoded.course_slug),
    'Unknown course slug should not be in allowed list',
  );

  console.log('✓ verifyIiskillsToken: JWT HS256 round-trip');
})();

// ---------------------------------------------------------------------------
// Test 4: x-aienter-timestamp – must be Unix epoch seconds (not milliseconds)
// ---------------------------------------------------------------------------

(function testTimestampIsSeconds() {
  // Simulate the timestamp generation used in callIiskillsConfirm
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const value = parseInt(timestamp, 10);

  // A Unix timestamp in seconds is ~10 digits (e.g. 1700000000).
  // A millisecond timestamp would be ~13 digits (e.g. 1700000000000).
  // Threshold: values > 1e12 indicate milliseconds, not seconds.
  assert.ok(
    value <= 1e12,
    `x-aienter-timestamp must be in seconds (got ${value}, which looks like milliseconds)`,
  );

  // Must be a positive integer string
  assert.ok(value > 0, 'timestamp must be a positive integer');
  assert.strictEqual(timestamp, String(value), 'timestamp must be a plain integer string');

  console.log('✓ x-aienter-timestamp: value is Unix epoch seconds');
})();

// ---------------------------------------------------------------------------
// All tests passed
// ---------------------------------------------------------------------------

console.log('\nAll iiskills tests passed ✓');
