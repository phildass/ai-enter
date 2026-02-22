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
 */
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
}) {
  const router = useRouter();
  const { user_id, email } = router.query;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      const orderResponse = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id,
          app_name: segmentKey,
          user_email: email || '',
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderData.error || 'Failed to create order');
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
            const verifyResponse = await fetch('/api/payments/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                user_id,
                app_name: segmentKey,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
              router.push(`/payments/success?app=${encodeURIComponent(segmentKey)}`);
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

  if (!user_id && typeof window !== 'undefined' && router.isReady) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: bgGradient }}>
        <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', textAlign: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', maxWidth: '400px' }}>
          <p style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.95rem' }}>
            Invalid payment link. Please open from {originDomain}.
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
            disabled={loading}
            style={{
              width: '100%',
              background: loading ? accentDisabled : accentColor,
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '1rem',
              fontSize: '1.1rem',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
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
