import { useRouter } from 'next/router';
import Head from 'next/head';

const appDetails = {
  'jai-kisan': {
    name: 'Jai Kisan',
    emoji: '🌾',
    bgColor: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
    cardBg: '#dcfce7',
    titleColor: '#14532d',
    accentColor: '#16a34a',
    borderColor: '#86efac',
  },
  'jai-bharat': {
    name: 'Jai Bharat',
    emoji: '🇮🇳',
    bgColor: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)',
    cardBg: '#e0e7ff',
    titleColor: '#1e1b4b',
    accentColor: '#4f46e5',
    borderColor: '#a5b4fc',
  },
};

export default function PaymentSuccess() {
  const router = useRouter();
  const { app } = router.query;

  const currentApp = appDetails[app] || appDetails['jai-kisan'];

  return (
    <>
      <Head>
        <title>Payment Successful - {currentApp.name}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <style jsx global>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: currentApp.bgColor,
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
          textAlign: 'center',
        }}>
          <div style={{
            width: '72px', height: '72px',
            background: currentApp.cardBg,
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem',
            fontSize: '2.5rem',
          }}>✅</div>

          <h1 style={{ fontSize: '1.8rem', fontWeight: '700', color: currentApp.titleColor, marginBottom: '0.5rem' }}>
            Payment Successful!
          </h1>

          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
            Thank you for your payment to <strong>{currentApp.name}</strong>.
          </p>

          <div style={{
            background: currentApp.cardBg,
            borderLeft: `4px solid ${currentApp.accentColor}`,
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1.5rem',
            textAlign: 'left',
          }}>
            <p style={{ fontSize: '0.85rem', fontWeight: '700', color: currentApp.titleColor, marginBottom: '0.5rem' }}>
              ⏰ Next Step: Enter OTP
            </p>
            <p style={{ fontSize: '0.8rem', color: '#374151' }}>
              You will receive an OTP within 5 minutes. Please check your app notifications and enter it to activate your subscription.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.9rem', color: '#374151' }}>
            <p>✅ Payment Amount: ₹116.82</p>
            <p>✅ Lifetime Access Granted</p>
            <p>✅ No Recurring Fees</p>
          </div>

          <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
            If you have any issues, contact: support@iiskills.cloud
          </p>
        </div>
      </div>
    </>
  );
}
