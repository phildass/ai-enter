import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

/**
 * Reusable payment page component for iiskills, jaibharat, and jaikisan segments.
 *
 * Props:
 *   - segmentKey: API app_name value ('iiskills' | 'jai-bharat' | 'jai-kisan')
 *   - brandName: Display name e.g. 'IIS Skills'
 *   - emoji: Emoji icon for the brand
 *   - bgGradient: CSS gradient string for page background
 *   - iconBg: Background color for the emoji circle
 *   - titleColor: CSS color for the brand title
 *   - accentGradient: CSS gradient for the pricing box
 *   - accentColor: Solid accent color (button, etc.)
 *   - accentDisabled: Disabled button color
 *   - validityText: e.g. '1 Year' or '1 Month'
 *   - validityLabel: e.g. '1-Year Access' (used as plan label)
 *   - features: string[] of feature bullet points
 *   - originDomain: e.g. 'iiskills.cloud' for the invalid-link message
 *   - description: Razorpay checkout description string
 *   - allowedCourses: string[] - if set, enables course-based entry (no user_id required);
 *       a dropdown is shown so the user can select a course if not provided in the URL.
 */

const COURSE_LABELS = {
  'learn-ai': 'Learn AI',
  'learn-developer': 'Learn Developer',
  'learn-pr': 'Learn PR',
  'learn-management': 'Learn Management',
};

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

  // For token-based flow (jai-bharat, jai-kisan): use verified server-side payload.
  // For legacy flow (iiskills): fall back to query params.
  const user_id = tokenPayload ? tokenPayload.user_id : router.query.user_id;
  const email = tokenPayload ? tokenPayload.user_email : router.query.email;

  // Course selection for course-based segments (e.g. iiskills).
  // Prefers query param; falls back to dropdown selection via state.
  const [selectedCourse, setSelectedCourse] = useState('');
  const queryCourse = router.isReady ? router.query.course : undefined;
  const course = allowedCourses ? (queryCourse || selectedCourse || '') : null;
  const isCourseValid = !allowedCourses || allowedCourses.includes(course);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      const orderBody = rawToken
        ? { session_token: rawToken }
        : { user_id, app_name: segmentKey, user_email: email || '', course: course || undefined };

      const orderResponse = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderBody),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        console.error('Order creation error:', orderData.error);
        throw new Error('Payment could not be initiated. Please try again.');
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: brandName,
          description,
          order_id: orderData.orderId,
          handler: async function (response) {
            const verifyBody = rawToken
              ? {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  session_token: rawToken,
                }
              : {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  user_id,
                  app_name: segmentKey,
                  course: course || undefined,
                };

            const verifyResponse = await fetch('/api/payments/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(verifyBody),
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
              // Redirect to origin's return_url with session_id and status
              const returnUrl = verifyData.return_url || orderData.return_url;
              if (returnUrl) {
                const sep = returnUrl.includes('?') ? '&' : '?';
                window.location.href = `${returnUrl}${sep}session_id=${encodeURIComponent(verifyData.session_id || orderData.session_id)}&status=success`;
              } else {
                router.push(`/payments/success?app=${encodeURIComponent(segmentKey)}`);
              }
            } else {
              setError('Payment verification failed. Please contact support.');
              setLoading(false);
            }
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
            },
          },
          theme: {
            color: accentColor,
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      };

      script.onerror = () => {
        setError('Failed to load payment gateway. Please try again.');
        setLoading(false);
      };
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment failed. Please try again.');
      setLoading(false);
    }
  };


  // For token-based segments (jaibharat, jaikisan): show error if token is missing/invalid.
  // For course-based segments (iiskills): skip the user_id check; course validity governs rendering.
  const shouldShowError =
    tokenError ||
    (!tokenPayload && !user_id && !allowedCourses && typeof window !== 'undefined' && router.isReady);

  if (shouldShowError) {

    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: bgGradient }}>
        <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', textAlign: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', maxWidth: '400px' }}>
          <p style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.95rem' }}>
            {tokenError || `Invalid payment link. Please open from ${originDomain}.`}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{brandName} Payment - ₹116.82</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <style jsx global>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: bgGradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}>
        <div style={{
          maxWidth: '420px',
          width: '100%',
          background: 'white',
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
          padding: '2rem',
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{
              width: '72px', height: '72px',
              background: iconBg,
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1rem',
              fontSize: '2.5rem',
            }}>{emoji}</div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '700', color: titleColor, marginBottom: '0.25rem' }}>
              {brandName}
            </h1>
            <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Complete Your Payment</p>
          </div>

          {/* Course dropdown (shown for course-based segments like iiskills) */}
          {allowedCourses && router.isReady && (
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ color: '#374151', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: '500' }}>
                Select your course:
              </p>
              <select
                value={course}
                onChange={(e) => setSelectedCourse(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: `1px solid ${isCourseValid ? '#d1d5db' : '#f87171'}`,
                  fontSize: '0.95rem',
                  color: '#374151',
                  background: 'white',
                  cursor: 'pointer',
                }}
              >
                <option value="">-- Select a course --</option>
                {allowedCourses.map((c) => (
                  <option key={c} value={c}>{COURSE_LABELS[c] || c}</option>
                ))}
              </select>
              {!isCourseValid && course === '' && (
                <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.4rem' }}>
                  Please select a course to continue.
                </p>
              )}
            </div>
          )}

          {/* Pricing Box */}
          <div style={{
            background: accentGradient,
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            color: 'white',
          }}>
            <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.85, marginBottom: '0.5rem' }}>
              {validityLabel}
            </p>
            <div style={{ marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '3rem', fontWeight: '700' }}>₹116.82</span>
            </div>
            <p style={{ fontSize: '0.8rem', opacity: 0.85, marginBottom: '1rem' }}>(₹99 + 18% GST)</p>

            <p style={{ fontSize: '0.8rem', opacity: 0.9, marginBottom: '1rem' }}>
              ✅ Valid for {validityText}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
              {features.map((feature) => (
                <div key={feature} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>✓</span>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pay Button */}
          <button
            onClick={handlePayment}
            disabled={loading || !isCourseValid}
            style={{
              width: '100%',
              background: (loading || !isCourseValid) ? accentDisabled : accentColor,
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '1rem',
              fontSize: '1.1rem',
              fontWeight: '700',
              cursor: (loading || !isCourseValid) ? 'not-allowed' : 'pointer',
              marginBottom: '1rem',
              transition: 'background 0.2s',
            }}
          >
            {loading ? 'Processing...' : 'Pay ₹116.82'}
          </button>

          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              borderRadius: '8px',
              padding: '0.75rem',
              marginBottom: '1rem',
              fontSize: '0.85rem',
            }}>
              {error}
            </div>
          )}

          {/* Footer */}
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.5rem' }}>🔒 Secured by Razorpay</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', fontSize: '0.75rem', color: '#6b7280' }}>
              <span>💳 Cards</span>
              <span>📱 UPI</span>
              <span>🏦 Net Banking</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
