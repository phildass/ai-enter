import SegmentPaymentPage from '../../components/SegmentPaymentPage';
import { verifyHandoffToken } from '../../lib/verifyHandoffToken';

// ₹999 + 18% GST = ₹1,178.82 = 117882 paise
const IISACADEMY_AMOUNT_PAISE = 117882;

export async function getServerSideProps({ query }) {
  const { token } = query;
  if (!token) {
    return {
      props: { tokenError: 'Missing payment token. Please open from iisacademy.in.' },
    };
  }
  try {
    const payload = verifyHandoffToken(token, { expectedAmountPaise: IISACADEMY_AMOUNT_PAISE });
    return { props: { tokenPayload: payload, rawToken: token } };
  } catch (err) {
    return {
      props: { tokenError: 'Invalid payment link. Please open from iisacademy.in.' },
    };
  }
}

export default function IisAcademyPay({ tokenPayload, rawToken, tokenError }) {
  return (
    <SegmentPaymentPage
      segmentKey="iisacademy"
      brandName="IIS Academy"
      emoji="🎓"
      bgGradient="linear-gradient(135deg, #fdf4ff 0%, #fae8ff 100%)"
      iconBg="#fae8ff"
      titleColor="#581c87"
      accentGradient="linear-gradient(135deg, #9333ea 0%, #7e22ce 100%)"
      accentColor="#9333ea"
      accentDisabled="#d8b4fe"
      validityText="1 Year"
      validityLabel="Class Enrolment — 1-Year Access"
      displayPrice="₹1,178.82"
      priceBreakdown="(₹999 + 18% GST)"
      features={[
        'Full class content access',
        'Competitive plugins (JEE/NEET/CA)',
        'Voice-active flashcards & quizzes',
        'Board + entrance exam preparation',
      ]}
      originDomain="iisacademy.in"
      description="Class Enrolment — IIS Academy"
      tokenPayload={tokenPayload || null}
      rawToken={rawToken || null}
      tokenError={tokenError || null}
    />
  );
}
