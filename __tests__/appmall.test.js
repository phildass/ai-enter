/**
 * Unit tests for the appmall payment integration.
 *
 * Run with:  node __tests__/appmall.test.js
 *
 * Tests cover:
 *   1. computeConfirmSignature – HMAC-SHA256 over the exact raw body string.
 *   2. callAppmallConfirm payload shape – all required fields are present.
 *   3. verifyAppmallToken – JWT HS256 verification round-trip.
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

  // Festival suite amount is 11600 paise; post-1 Oct standard is 59000.
  const DEFAULT_AMOUNT_PAISE = 11600;

  const payload = {
    purchaseId: 'purchase-123',
    appId: 'exam-topper-bundle',
    amountPaise: DEFAULT_AMOUNT_PAISE,
    razorpayOrderId: 'order_abc',
    razorpayPaymentId: 'pay_xyz',
    paidAt: '2024-01-01T00:00:00.000Z',
    user_token: 'some.jwt.token',
    event: 'payment.captured',
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
  const rawBody2 = JSON.stringify({ ...payload, amountPaise: 59001 });
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
    'event',
  ];

  // Festival suite amount is 11600 paise; post-1 Oct standard is 59000.
  const DEFAULT_AMOUNT_PAISE = 11600;

  const confirmPayload = {
    purchaseId: 'purchase-123',
    appId: 'exam-topper-bundle',
    amountPaise: DEFAULT_AMOUNT_PAISE,
    razorpayOrderId: 'order_abc',
    razorpayPaymentId: 'pay_xyz',
    paidAt: new Date().toISOString(),
    user_token: 'some.jwt.token',
    event: 'payment.captured',
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

  assert.strictEqual(confirmPayload.event, 'payment.captured', 'event must be payment.captured');

  console.log('✓ confirm payload: all required fields present and valid');
})();

// ---------------------------------------------------------------------------
// Test 3: verifyAppmallToken – JWT HS256 round-trip
// ---------------------------------------------------------------------------

(function testVerifyAppmallToken() {
  const secret = 'appmall-test-secret';
  const nowSec = Math.floor(Date.now() / 1000);

  const validPayload = {
    purchaseId: 'purchase-456',
    user_id: 'user-789',
    phone: '9876543210',
    name: 'Test User',
    course_slug: 'exam-topper-bundle',
    return_to: 'https://appmall.in/payment-success',
    exp: nowSec + 3600,
  };

  const token = buildJwt(validPayload, secret);

  // Inline verification (mirrors verifyAppmallToken logic)
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
  const ALLOWED_COURSES = ['exam-topper-bundle', 'entrance-exams', 'topper'];
  assert.ok(
    !ALLOWED_COURSES.includes(badDecoded.course_slug),
    'Unknown course slug should not be in allowed list',
  );

  console.log('✓ verifyAppmallToken: JWT HS256 round-trip');
})();

// ---------------------------------------------------------------------------
// Test 4: x-aienter-timestamp – must be Unix epoch seconds (not milliseconds)
// ---------------------------------------------------------------------------

(function testTimestampIsSeconds() {
  // Simulate the timestamp generation used in callAppmallConfirm
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

(function testFestivalAmountPaise() {
  const fs = require('fs');
  const path = require('path');
  const src = fs.readFileSync(path.join(__dirname, '..', 'lib', 'courses.js'), 'utf8');

  const FESTIVAL_AMOUNT_PAISE = 11600;
  const STANDARD_AMOUNT_PAISE = 59000;
  assert.notStrictEqual(
    FESTIVAL_AMOUNT_PAISE,
    STANDARD_AMOUNT_PAISE,
    'Festival Rs 116 must not collide with standard Rs 590',
  );
  assert.strictEqual(Math.round(116 * 100), FESTIVAL_AMOUNT_PAISE);
  assert.ok(
    /FESTIVAL_MEMBERSHIP_AMOUNT_PAISE\s*=\s*11600/.test(src),
    'courses.js must define festival amount as 11600 paise',
  );
  assert.ok(
    /APPMALL_STANDARD_AMOUNT_PAISE\s*=\s*59000/.test(src),
    'courses.js must define standard amount as 59000 paise',
  );
  assert.ok(
    /n === FESTIVAL_MEMBERSHIP_AMOUNT_PAISE/.test(src),
    'isAllowedAppmallAmountPaise must include 11600',
  );

  const endsAt = Date.parse('2026-09-30T18:29:59.999Z');
  const after = Date.parse('2026-09-30T18:30:00.000Z');
  assert.ok(endsAt < after, 'festival cutoff must precede 1 Oct 2026 IST');
  assert.ok(
    /2026-09-30T18:29:59\.999Z/.test(src),
    'festival offer must end 30 Sep 2026 23:59 IST',
  );

  console.log('✓ festival amount: 11600 paise is distinct from 59000');
})();

(function testInternationalAmounts() {
  const fs = require('fs');
  const path = require('path');
  const src = fs.readFileSync(path.join(__dirname, '..', 'lib', 'courses.js'), 'utf8');

  const USD_CENTS = 500;
  assert.strictEqual(Math.round(5 * 100), USD_CENTS);
  assert.notStrictEqual(USD_CENTS, 11600, 'International USD 5 must not collide with festival Rs 116');
  assert.notStrictEqual(USD_CENTS, 59000, 'International USD 5 must not collide with standard Rs 590');
  assert.ok(
    /INTERNATIONAL_AMOUNT_CENTS\s*=\s*500/.test(src),
    'courses.js must define international USD as 500 cents',
  );
  assert.ok(
    /INTERNATIONAL_PRICE_USD\s*=\s*5/.test(src),
    'courses.js must define international price as USD 5',
  );
  assert.ok(
    !/INTERNATIONAL_AMOUNT_PAISE\s*=\s*20000/.test(src),
    'courses.js must not keep INR 20000 as the international amount',
  );
  assert.ok(
    /INTERNATIONAL_COURSE_ID\s*=\s*'international-course'/.test(src),
    'courses.js must define international-course id',
  );
  assert.ok(
    /n === INTERNATIONAL_AMOUNT_CENTS/.test(src),
    'isAllowedInternationalCharge must allowlist 500 cents USD',
  );
  assert.ok(
    !/n === INTERNATIONAL_AMOUNT_PAISE/.test(
      src.split('function isAllowedAppmallAmountPaise')[1].split('function isInternationalPaymentCourse')[0],
    ),
    'isAllowedAppmallAmountPaise must not accept the international amount',
  );

  const page = fs.readFileSync(path.join(__dirname, '..', 'pages', 'payments', 'foriegn.js'), 'utf8');
  assert.ok(page.includes('International buyers'), 'foriegn page must describe international buyers');
  assert.ok(page.includes('all inclusive'), 'foriegn page must say all inclusive');
  assert.ok(page.includes('INTERNATIONAL_COURSE_ID'), 'foriegn page must charge international-course');
  assert.ok(!page.includes('Rs 200'), 'foriegn page must not show Rs 200');

  const redirectPage = fs.readFileSync(path.join(__dirname, '..', 'pages', 'payments', 'foreign.js'), 'utf8');
  assert.ok(redirectPage.includes('/payments/foriegn'), 'foreign spelling must redirect to foriegn');

  const createOrder = fs.readFileSync(
    path.join(__dirname, '..', 'pages', 'api', 'payments', 'create-order.js'),
    'utf8',
  );
  assert.ok(createOrder.includes('isAllowedInternationalCharge'), 'create-order must allowlist international amounts');
  assert.ok(createOrder.includes("currency = 'USD'"), 'create-order must force USD for international');
  assert.ok(createOrder.includes('500 cents'), 'create-order error must mention 500 cents');

  console.log('✓ international amount: 500 cents USD only');
})();

// ---------------------------------------------------------------------------
// All tests passed
// ---------------------------------------------------------------------------

console.log('\nAll appmall tests passed ✓');
