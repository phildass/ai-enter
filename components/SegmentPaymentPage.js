import React, { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

// NOTE: This file was updated to improve Razorpay cancel/failure handling.
// Key changes:
// - Add rzp.on('payment.failed', ...) to show a clear error and stop redirect/verification attempts.
// - Improve modal.ondismiss message to explicitly say "Payment cancelled".
// - Guard the success handler to ensure required Razorpay fields exist before calling verify.
// - Keep behavior: only verify on success handler; cancel/fail do not verify.

function getApiBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');
}

function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  return fetch(url, { ...options, signal: controller.signal }).finally(() =>
    clearTimeout(timeout),
  );
}

const COURSE_LABELS = {
  'learn-ai': 'Learn AI',
  'learn-developer': 'Learn Developer',
  'learn-pr': 'Learn PR',
  'learn-management': 'Learn Management',
};

const PHONE_RE = /^\d{10}$/;

export default function SegmentPaymentPage({
  segmentKey,
  brandName,
  emoji,
  bgGradient,
  iconBg,
  titleColor,
  accentGradient,
  accentColor,
  accentDisabled,
  validityText,
  validityLabel,
  features,
  originDomain,
  description,
  tokenPayload,
  rawToken,
  tokenError,
  allowedCourses,
}) {
  const router = useRouter();

  const userIdFromToken = tokenPayload ? tokenPayload.user_id : undefined;
  const userEmailFromToken = tokenPayload ? tokenPayload.user_email : undefined;

  const userId = tokenPayload ? userIdFromToken : router.query.user_id;
  const userEmail = tokenPayload ? userEmailFromToken : router.query.email;

  const purchaseId = router.isReady ? router.query.purchaseId : undefined;
  const courseFromQuery = router.isReady ? router.query.course : undefined;

  const [selectedCourse, setSelectedCourse] = useState('');
  const course = allowedCourses ? courseFromQuery || selectedCourse || '' : null;

  const courseAllowed = !allowedCourses || allowedCourses.includes(course);

  const [processing, setProcessing] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [error, setError] = useState('');
  const [confirmRetryPayload, setConfirmRetryPayload] = useState(null);

  // Customer details (used on iiskills page)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  const canSubmitCustomerDetails = useMemo(() => {
    if (!allowedCourses) return true;
    return (
      firstName.trim().length > 0 &&
      lastName.trim().length > 0 &&
      PHONE_RE.test(phone.trim())
    );
  }, [allowedCourses, firstName, lastName, phone]);

  const isIiskillsSegment = segmentKey === 'iiskills' && !!rawToken;

  // Main pay action
  const startPayment = async () => {
    setProcessing(true);
    setStatusText('Creating order…');
    setError('');
    setConfirmRetryPayload(null);

    const apiBase = getApiBaseUrl();

    try {
      let body;

      if (isIiskillsSegment) {
        if (!purchaseId) throw new Error('Invalid payment link. Missing purchaseId.');
        body = { iiskills_token: rawToken, purchaseId };
      } else {
        body = rawToken
          ? {
              session_token: rawToken,
              ...(course ? { course } : {}),
            }
          : {
              user_id: userId,
              app_name: segmentKey,
              user_email: userEmail || '',
              customer_name: allowedCourses
                ? `${firstName.trim()} ${lastName.trim()}`
                : undefined,
              user_phone: allowedCourses ? phone.trim() : undefined,
              course: course || undefined,
            };
      }

      console.log('[payment] Creating order for app:', segmentKey);

      let createRes;
      try {
        createRes = await fetchWithTimeout(`${apiBase}/api/payments/create-order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } catch (e) {
        if (e.name === 'AbortError') {
          throw new Error(
            'Order creation timed out. Please check your connection and try again.',
          );
        }
        throw new Error(
          'Could not reach the payment server. Please check your connection and try again.',
        );
      }

      const createJson = await createRes.json();
      if (!createRes.ok) {
        console.error('[payment] Order creation failed:', createJson?.error);
        throw new Error(createJson?.error || 'Payment could not be initiated. Please try again.');
      }

      console.log('[payment] Order created:', createJson.orderId);
      setStatusText('Loading payment gateway…');

      // Load Razorpay checkout script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);

      const loadTimeout = setTimeout(() => {
        console.error('[payment] Razorpay script load timed out');
        if (script.parentNode) document.body.removeChild(script);
        setError('Payment gateway took too long to load. Please refresh and try again.');
        setProcessing(false);
        setStatusText('');
      }, 15000);

      script.onload = () => {
        clearTimeout(loadTimeout);
        console.log('[payment] Razorpay script loaded, opening checkout');
        setStatusText('Processing your payment…');

        const options = {
          key: createJson.keyId,
          amount: createJson.amount,
          currency: createJson.currency,
          name: brandName,
          description,
          order_id: createJson.orderId,

          handler: async function (resp) {
            try {
              // Guard: only verify on a real success callback with required IDs.
              if (
                !resp?.razorpay_order_id ||
                !resp?.razorpay_payment_id ||
                !resp?.razorpay_signature
              ) {
                console.error('[payment] Missing Razorpay fields in handler:', resp);
                setError('Payment did not complete. Please try again.');
                setProcessing(false);
                setStatusText('');
                return;
              }

              setStatusText('Verifying payment…');
              console.log(
                '[payment] Razorpay payment received, verifying:',
                resp.razorpay_payment_id,
              );

              await verifyPayment({
                razorpay_order_id: resp.razorpay_order_id,
                razorpay_payment_id: resp.razorpay_payment_id,
                razorpay_signature: resp.razorpay_signature,
                orderData: createJson,
              });
            } catch (e) {
              console.error('[payment] handler error:', e);
              setError(e?.message || 'Payment verification failed. Please try again.');
              setProcessing(false);
              setStatusText('');
            }
          },

          modal: {
            ondismiss: function () {
              console.log('[payment] Checkout modal dismissed');
              // Make cancel explicit; do NOT verify, do NOT redirect.
              setError('Payment cancelled. No money was debited.');
              setProcessing(false);
              setStatusText('');
            },
          },

          theme: { color: accentColor },
        };

        const rzp = new window.Razorpay(options);

        // IMPORTANT: handle checkout failures (desktop deep-link failures, insufficient funds, etc.)
        rzp.on('payment.failed', function (resp) {
          console.error('[payment] payment.failed:', resp?.error);

          const msg =
            resp?.error?.description ||
            resp?.error?.reason ||
            'Payment failed. Please try again using UPI QR / Google Pay / card.';

          setError(msg);
          setProcessing(false);
          setStatusText('');
        });

        rzp.open();
      };

      script.onerror = () => {
        clearTimeout(loadTimeout);
        console.error('[payment] Failed to load Razorpay script');
        setError('Failed to load payment gateway. Please try again.');
        setProcessing(false);
        setStatusText('');
      };
    } catch (e) {
      console.error('[payment] Unexpected error:', e);
      setError(e?.message || 'Payment failed. Please try again.');
      setProcessing(false);
      setStatusText('');
    }
  };

  const verifyPayment = async ({
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderData,
  }) => {
    const apiBase = getApiBaseUrl();

    let body;

    if (isIiskillsSegment) {
      if (!purchaseId) {
        setError('Invalid payment link. Missing purchaseId.');
        setProcessing(false);
        setStatusText('');
        return;
      }
      body = {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        iiskills_token: rawToken,
        purchaseId,
      };
    } else {
      body = rawToken
        ? {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            session_token: rawToken,
          }
        : {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            user_id: userId,
            app_name: segmentKey,
            course: course || undefined,
          };
    }

    let res;
    try {
      res = await fetchWithTimeout(`${apiBase}/api/payments/verify-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch (e) {
      const msg =
        e.name === 'AbortError'
          ? `Payment verification timed out. Your payment may have succeeded — please contact support with your payment ID: ${razorpay_payment_id}`
          : `Could not reach the verification server. Your payment may have succeeded — please contact support with your payment ID: ${razorpay_payment_id}`;
      console.error('[payment] Verify fetch error:', e);
      setError(msg);
      setProcessing(false);
      setStatusText('');
      return;
    }

    const json = await res.json();

    if (json?.success && json?.confirmFailed) {
      console.error(
        '[payment] iiskills confirm failed:',
        json.confirmError,
        'purchaseId:',
        json.purchaseId,
        'paymentId:',
        razorpay_payment_id,
      );

      setConfirmRetryPayload({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        orderData,
      });

      setError(
        'Payment received but confirmation failed. Please use the button below to retry.',
      );
      setProcessing(false);
      setStatusText('');
      return;
    }

    if (json?.success) {
      console.log('[payment] Verification successful, redirecting');
      setStatusText('Redirecting…');

      const redirect =
        json.redirect_url || json.return_url || (orderData && orderData.return_url);

      if (redirect) {
        const join = redirect.includes('?') ? '&' : '?';
        const sessionId = json.session_id || (orderData && orderData.session_id);

        window.location.href = sessionId
          ? `${redirect}${join}session_id=${encodeURIComponent(sessionId)}&status=success`
          : `${redirect}${join}status=success`;
      } else {
        router.push(`/payments/success?app=${encodeURIComponent(segmentKey)}`);
      }
      return;
    }

    console.error('[payment] Verification failed:', json);
    setError(
      `Payment verification failed. Please contact support with your payment ID: ${razorpay_payment_id}`,
    );
    setProcessing(false);
    setStatusText('');
  };

  const retryConfirmation = async () => {
    if (!confirmRetryPayload) return;
    setProcessing(true);
    setStatusText('Retrying confirmation…');
    setError('');
    await verifyPayment(confirmRetryPayload);
  };

  // Render guards
  if (tokenError) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: bgGradient }}>
        <div style={{ background: 'white', borderRadius: 16, padding: '2rem', textAlign: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', maxWidth: 400 }}>
          <p style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.95rem' }}>
            {tokenError || `Invalid payment link. Please open from ${originDomain}.`}
          </p>
        </div>
      </div>
    );
  }

  // Basic page shell (kept consistent with your existing UI approach)
  const disablePay =
    processing ||
    !courseAllowed ||
    (allowedCourses && (!course || !canSubmitCustomerDetails));

  return (
    <>
      <Head>
        <title>{brandName} Payment - ₹116.82</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div
        style={{
          minHeight: '100vh',
          background: bgGradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
        }}
      >
        <div
          style={{
            maxWidth: 420,
            width: '100%',
            background: 'white',
            borderRadius: 20,
            boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
            padding: '2rem',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div
              style={{
                width: 72,
                height: 72,
                background: iconBg,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                fontSize: '2.5rem',
              }}
            >
              {emoji}
            </div>

            <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: titleColor, marginBottom: '0.25rem' }}>
              {brandName}
            </h1>
            <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Complete Your Payment</p>
          </div>

          {allowedCourses && router.isReady && (
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ color: '#374151', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 500 }}>
                Select your course:
              </p>

              <select
                value={course}
                onChange={(e) => setSelectedCourse(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: 8,
                  border: `1px solid ${courseAllowed ? '#d1d5db' : '#f87171'}`,
                  fontSize: '0.95rem',
                  color: '#374151',
                  background: 'white',
                  cursor: 'pointer',
                }}
              >
                <option value="">-- Select a course --</option>
                {allowedCourses.map((c) => (
                  <option key={c} value={c}>
                    {COURSE_LABELS[c] || c}
                  </option>
                ))}
              </select>

              {!courseAllowed && course === '' && (
                <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.4rem' }}>
                  Please select a course to continue.
                </p>
              )}
            </div>
          )}

          {allowedCourses && router.isReady && (
            <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ color: '#374151', fontSize: '0.85rem', marginBottom: '0.3rem', fontWeight: 500 }}>
                    First Name *
                  </p>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      borderRadius: 8,
                      border: '1px solid #d1d5db',
                      fontSize: '0.9rem',
                      color: '#374151',
                    }}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <p style={{ color: '#374151', fontSize: '0.85rem', marginBottom: '0.3rem', fontWeight: 500 }}>
                    Last Name *
                  </p>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      borderRadius: 8,
                      border: '1px solid #d1d5db',
                      fontSize: '0.9rem',
                      color: '#374151',
                    }}
                  />
                </div>
              </div>

              <div>
                <p style={{ color: '#374151', fontSize: '0.85rem', marginBottom: '0.3rem', fontWeight: 500 }}>
                  Phone Number * (10 digits)
                </p>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))
                  }
                  placeholder="10-digit mobile number"
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    borderRadius: 8,
                    border: `1px solid ${
                      phone && !PHONE_RE.test(phone) ? '#f87171' : '#d1d5db'
                    }`,
                    fontSize: '0.9rem',
                    color: '#374151',
                  }}
                />
                {phone && !PHONE_RE.test(phone) && (
                  <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.3rem' }}>
                    Please enter a valid 10-digit phone number.
                  </p>
                )}
              </div>
            </div>
          )}

          <div
            style={{
              background: accentGradient,
              borderRadius: 16,
              padding: '1.5rem',
              marginBottom: '1.5rem',
              color: 'white',
            }}
          >
            <p
              style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                opacity: 0.85,
                marginBottom: '0.5rem',
              }}
            >
              {validityLabel}
            </p>

            <div style={{ marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '3rem', fontWeight: 700 }}>₹116.82</span>
            </div>

            <p style={{ fontSize: '0.8rem', opacity: 0.85, marginBottom: '1rem' }}>
              (₹99 + 18% GST)
            </p>

            <p style={{ fontSize: '0.8rem', opacity: 0.9, marginBottom: '1rem' }}>
              ✅ Valid for {validityText}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
              {features.map((f) => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>✓</span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={startPayment}
            disabled={disablePay}
            style={{
              width: '100%',
              padding: '1rem',
              borderRadius: 12,
              border: 'none',
              background: processing ? accentDisabled : accentColor,
              color: 'white',
              fontSize: '1.05rem',
              fontWeight: 700,
              cursor: disablePay ? 'not-allowed' : 'pointer',
              transition: '0.2s',
              marginBottom: '0.75rem',
            }}
          >
            {processing ? statusText || 'Processing…' : 'Pay ₹116.82'}
          </button>

          {confirmRetryPayload && (
            <button
              onClick={retryConfirmation}
 /etc/</div>             disabled={processing}
              style={{
                width: '100%',
                padding: '0.9rem',
                borderRadius: 12,
                border: `2px solid ${accentColor}`,
                background: 'transparent',
                color: accentColor,
                fontSize: '1rem',
                fontWeight: 700,
                cursor: processing ? 'not-allowed' : 'pointer',
                transition: '0.2s',
                marginBottom: '0.75rem',
              }}
            >
              {processing ? statusText || 'Retrying…' : 'Retry Confirmation'}
            </button>
          )}

          {error && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 12,
                padding: '0.9rem',
                color: '#dc2626',
                fontSize: '0.9rem',
                textAlign: 'center',
                marginBottom: '0.5rem',
              }}
            >
              {error}
            </div>
          )}

          <p style={{ color: '#9ca3af', fontSize: '0.8rem', textAlign: 'center' }}>
            Secured by Razorpay • SSL Encrypted
          </p>
        </div>
      </div>
    </>
  );
}