import SegmentPaymentPage from '../../components/SegmentPaymentPage';
import { verifyUriqToken } from '../../lib/verifyUriqToken';

export async function getServerSideProps({ query }) {
  const { purchaseId, token } = query;

  if (!purchaseId || !token) {
    return {
      props: { tokenError: 'Invalid payment link. Missing required parameters.' },
    };
  }

  try {
    const payload = verifyUriqToken(token, { expectedPurchaseId: purchaseId });
    return { props: { tokenPayload: payload, rawToken: token, purchaseId } };
  } catch (err) {
    console.error('[uriq] Token verification failed:', err.message);
    return {
      props: { tokenError: 'Invalid payment link. Please open from uriq.in.' },
    };
  }
}

export default function UriqPay({ tokenPayload, rawToken, tokenError }) {
  return (
    <SegmentPaymentPage
      segmentKey="uriq.in"
      brandName="uriq.in"
      emoji="🧠"
      bgGradient="linear-gradient(135deg, #f8faff 0%, #eef2ff 100%)"
      iconBg="#eef2ff"
      titleColor="#1e1b4b"
      accentGradient="linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)"
      accentColor="#6366f1"
      accentDisabled="#a5b4fc"
      validityText="1 Year"
      validityLabel="1-Year Access"
      features={[
        'Full IQ breakdown',
        'Exam-oriented aptitude analytics',
        'Daily intelligence feed',
        'No recurring monthly fees',
      ]}
      originDomain="uriq.in"
      description="1-Year Access - uriq.in Premium"
      tokenKind="uriq"
      tokenPayload={tokenPayload || null}
      rawToken={rawToken || null}
      tokenError={tokenError || null}
      displayPrice="₹116.82"
      priceBreakdown="(₹99 + 18% GST)"
    />
  );
}
