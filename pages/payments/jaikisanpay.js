import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function JaiKisanPay() {
  const router = useRouter();
  const { user_id } = router.query;

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
          user_id: user_id,
          app_name: 'jai-kisan',
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
          name: 'Jai Kisan',
          description: 'Lifetime Access - Agricultural Support',
          order_id: orderData.orderId,
          handler: async function (response) {
            const verifyResponse = await fetch('/api/payments/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                user_id: user_id,
                app_name: 'jai-kisan',
              }),
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
              router.push('/payments/success?app=jai-kisan');
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
            color: '#16A34A',
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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0fdf4' }}>
        <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', textAlign: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}>
          <p style={{ color: '#ef4444', marginBottom: '1rem' }}>Invalid payment link. Please open from the Jai Kisan app.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Jai Kisan Payment - ₹116.82</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <style jsx global>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
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
              background: '#dcfce7',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1rem',
              fontSize: '2.5rem',
            }}>🌾</div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#14532d', marginBottom: '0.25rem' }}>
              Jai Kisan
            </h1>
            <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Complete Your Payment</p>
          </div>

          {/* Pricing Box */}
          <div style={{
            background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            color: 'white',
          }}>
            <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.85, marginBottom: '0.5rem' }}>
              Lifetime Access
            </p>
            <div style={{ marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '3rem', fontWeight: '700' }}>₹116.82</span>
            </div>
            <p style={{ fontSize: '0.8rem', opacity: 0.85, marginBottom: '1rem' }}>(₹99 + 18% GST)</p>

            {/* Introductory Offer Banner */}
            <div style={{
              background: '#fef08a',
              color: '#713f12',
              borderRadius: '8px',
              padding: '0.6rem 0.75rem',
              marginBottom: '1rem',
            }}>
              <p style={{ fontSize: '0.7rem', fontWeight: '700', marginBottom: '0.15rem' }}>🎉 INTRODUCTORY OFFER</p>
              <p style={{ fontSize: '0.7rem' }}>Valid only until Feb 28, 2026</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
              {['Daily weather & market prices', 'Expert agricultural advice', 'Community support', 'No recurring fees'].map((feature) => (
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
              background: loading ? '#86efac' : '#16a34a',
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
