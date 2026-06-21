import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

const appDetails = {
  name: 'iiskills',
  bgColor: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
  cardBg: '#ede9fe',
  titleColor: '#4c1d95',
  accentColor: '#7c3aed',
  validity: '1 year',
  dashboardUrl: 'https://iiskills.in/dashboard',
};

export default function PaymentSuccess() {
  const router = useRouter();
  const hasError = router.isReady && Boolean(router.query.error);
  const isCapturedSuccess =
    router.isReady &&
    (router.query.status === 'captured' || router.query.status === 'success');
  const isPending =
    router.isReady && !isCapturedSuccess && !hasError;

  useEffect(() => {
    if (!router.isReady || hasError || isPending || !isCapturedSuccess) return undefined;

    const timer = setTimeout(() => {
      window.location.href = appDetails.dashboardUrl;
    }, 3000);

    return () => clearTimeout(timer);
  }, [router.isReady, hasError, isPending, isCapturedSuccess]);

  const handleRedirectNow = () => {
    window.location.href = appDetails.dashboardUrl;
  };

  const pageTitle = hasError
    ? 'Payment Issue'
    : isCapturedSuccess
      ? 'Payment Successful'
      : 'Payment Pending';

  return (
    <>
      <Head>
        <title>{pageTitle} - {appDetails.name}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <style jsx global>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: appDetails.bgColor,
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
            background: isCapturedSuccess ? appDetails.cardBg : '#eff6ff',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem',
            fontSize: '2.5rem',
          }}>{isCapturedSuccess ? '✅' : isPending ? '⏳' : '⚠️'}</div>

          <h1 style={{ fontSize: '1.8rem', fontWeight: '700', color: appDetails.titleColor, marginBottom: '0.5rem' }}>
            {hasError ? 'Payment Issue' : isCapturedSuccess ? 'Payment Successful!' : 'Payment Pending'}
          </h1>

          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
            {hasError ? (
              <span>{router.query.error}</span>
            ) : isCapturedSuccess ? (
              <>
                Thank you for your payment to <strong>{appDetails.name}</strong>.
              </>
            ) : (
              <span>
                Payment pending — please check your UPI app and enter your passcode. Access is granted only after your bank clears the transaction.
              </span>
            )}
          </p>

          {isCapturedSuccess && (
          <div style={{
            background: appDetails.cardBg,
            borderLeft: `4px solid ${appDetails.accentColor}`,
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1.5rem',
            textAlign: 'left',
          }}>
            <p style={{ fontSize: '0.85rem', fontWeight: '700', color: appDetails.titleColor, marginBottom: '0.5rem' }}>
              Next step: access your course
            </p>
            <p style={{ fontSize: '0.8rem', color: '#374151' }}>
              Your iiskills access is being activated. Redirecting to your dashboard in 3 seconds…
            </p>
          </div>
          )}

          {isCapturedSuccess && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.9rem', color: '#374151' }}>
            <p>✅ Payment Amount: ₹116.82</p>
            <p>✅ Access Valid for {appDetails.validity}</p>
            <p>✅ No Recurring Fees</p>
          </div>
          )}

          {isCapturedSuccess && (
          <button
            onClick={handleRedirectNow}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              background: `linear-gradient(135deg, ${appDetails.accentColor} 0%, #a855f7 100%)`,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontWeight: '600',
              cursor: 'pointer',
              marginBottom: '1rem',
              transition: 'transform 0.2s',
            }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          >
            Go to Dashboard Now
          </button>
          )}

          {isPending && (
          <a
            href={appDetails.dashboardUrl}
            style={{
              display: 'inline-block',
              width: '100%',
              padding: '0.75rem 1rem',
              background: `linear-gradient(135deg, ${appDetails.accentColor} 0%, #a855f7 100%)`,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontWeight: '600',
              cursor: 'pointer',
              marginBottom: '1rem',
              textDecoration: 'none',
            }}
          >
            Go to iiskills.in
          </a>
          )}

          <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
            If you have any issues, contact: support@iiskills.in
          </p>
        </div>
      </div>
    </>
  );
}
