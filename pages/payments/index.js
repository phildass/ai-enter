import Head from 'next/head';
import Link from 'next/link';

const segments = [
  {
    key: 'iiskills',
    name: 'IIS Skills',
    domain: 'iiskills.cloud',
    emoji: '🎓',
    color: '#7c3aed',
    bg: '#ede9fe',
    description: 'Many learning apps — professional & skill-based courses.',
    price: '₹116.82',
    validity: '1 Year',
  },
  {
    key: 'jaibharat',
    name: 'Jai Bharat',
    domain: 'jaibharat.cloud',
    emoji: '🇮🇳',
    color: '#4f46e5',
    bg: '#e0e7ff',
    description: 'Government jobs portal — SSC, Banking, Railways & more.',
    price: '₹116.82',
    validity: '1 Month',
  },
  {
    key: 'jaikisan',
    name: 'Jai Kisan',
    domain: 'jaikisan.cloud',
    emoji: '🌾',
    color: '#16a34a',
    bg: '#dcfce7',
    description: 'Agricultural support — weather, market prices & expert advice.',
    price: '₹116.82',
    validity: '1 Month',
  },
];

export default function PaymentsIndex() {
  return (
    <>
      <Head>
        <title>Payment Gateway — IIS Skills, Jai Bharat, Jai Kisan</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="Central payment gateway for iiskills.cloud, jaibharat.cloud, and jaikisan.cloud." />
      </Head>

      <style jsx global>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8f9ff; }
      `}</style>

      <div style={{ minHeight: '100vh', padding: '2rem 1rem' }}>
        {/* Hero */}
        <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💳</div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#1e1b4b', marginBottom: '0.75rem' }}>
            Central Payment Gateway
          </h1>
          <p style={{ color: '#4b5563', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '1rem' }}>
            This is a payment gateway for <strong>iiskills.cloud</strong>,{' '}
            <strong>jaibharat.cloud</strong> and <strong>jaikisan.cloud</strong>.
          </p>
          <div style={{
            background: '#fef9c3',
            border: '1px solid #fde68a',
            borderRadius: '12px',
            padding: '0.9rem 1.2rem',
            color: '#92400e',
            fontSize: '0.9rem',
            lineHeight: 1.6,
          }}>
            ⚠️ <strong>Payments can only be initiated from the respective platforms.</strong>{' '}
            Please visit <strong>iiskills.cloud</strong>, <strong>jaibharat.cloud</strong>, or{' '}
            <strong>jaikisan.cloud</strong> to make a payment. Payment buttons are not available on this page.
          </div>
        </div>

        {/* Segment cards */}
        <div style={{
          maxWidth: '720px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem',
        }}>
          {segments.map((seg) => (
            <div key={seg.key} style={{
              background: 'white',
              borderRadius: '20px',
              padding: '1.5rem',
              boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
              borderTop: `4px solid ${seg.color}`,
            }}>
              <div style={{
                width: '52px', height: '52px',
                background: seg.bg,
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.8rem',
                marginBottom: '0.75rem',
              }}>{seg.emoji}</div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: '700', color: seg.color, marginBottom: '0.4rem' }}>
                {seg.name}
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                {seg.description}
              </p>
              <div style={{ fontSize: '0.85rem', color: '#374151' }}>
                <p><strong>Price:</strong> {seg.price} <span style={{ color: '#9ca3af' }}>(₹99 + 18% GST)</span></p>
                <p><strong>Validity:</strong> {seg.validity}</p>
              </div>
              <p style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#9ca3af' }}>
                Initiate from <strong>{seg.domain}</strong>
              </p>
            </div>
          ))}
        </div>

        {/* Support */}
        <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
            Need help?{' '}
            <Link href="/contact" style={{ color: '#4f46e5', textDecoration: 'underline' }}>
              Contact support
            </Link>{' '}
            or email{' '}
            <a href="mailto:support@iiskills.cloud" style={{ color: '#4f46e5' }}>
              support@iiskills.cloud
            </a>
          </p>
          <p style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '0.5rem' }}>
            🔒 All payments are secured by Razorpay
          </p>
        </div>
      </div>
    </>
  );
}
