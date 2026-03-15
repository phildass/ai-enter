import SegmentPaymentPage from '../../components/SegmentPaymentPage';
import { verifyHandoffToken } from '../../lib/verifyHandoffToken';

// ₹2999 + 18% GST = ₹3,538.82 = 353882 paise
const IISACADEMY2_AMOUNT_PAISE = 353882;

export async function getServerSideProps({ query }) {
  const { token } = query;
  if (!token) {
    return {
      props: { tokenError: 'Missing payment token. Please open from iisacademy.in.' },
    };
  }
  try {
    const payload = verifyHandoffToken(token, { expectedAmountPaise: IISACADEMY2_AMOUNT_PAISE });
    return { props: { tokenPayload: payload, rawToken: token } };
  } catch (err) {
    return {
      props: { tokenError: 'Invalid payment link. Please open from iisacademy.in.' },
    };
  }
}

export default function IisAcademy2Pay({ tokenPayload, rawToken, tokenError }) {
  return (
    <SegmentPaymentPage
      segmentKey="iisacademy"
      brandName="IIS Academy"
      emoji="🚀"
      bgGradient="linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)"
      iconBg="#ffedd5"
      titleColor="#7c2d12"
      accentGradient="linear-gradient(135deg, #ea580c 0%, #c2410c 100%)"
      accentColor="#ea580c"
      accentDisabled="#fdba74"
      validityText="1 Year"
      validityLabel="All-Classes Access — 1-Year Access"
      displayPrice="₹3,538.82"
      priceBreakdown="(₹2,999 + 18% GST)"
      features={[
        'All classes (8–12) full content',
        'Competitive plugins for all streams',
        'Voice-active flashcards & rank predictor',
        'JEE / NEET / CA entrance preparation',
      ]}
      originDomain="iisacademy.in"
      description="All-Classes Access — IIS Academy"
      tokenPayload={tokenPayload || null}
      rawToken={rawToken || null}
      tokenError={tokenError || null}
    />
  );
}
