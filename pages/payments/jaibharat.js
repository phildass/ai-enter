import SegmentPaymentPage from '../../components/SegmentPaymentPage';
import { verifyHandoffToken } from '../../lib/verifyHandoffToken';

export async function getServerSideProps({ query }) {
  const { token } = query;
  if (!token) {
    return { props: { tokenError: 'Missing payment token. Please open from jaibharat.cloud.' } };
  }
  try {
    const payload = verifyHandoffToken(token);
    return { props: { tokenPayload: payload, rawToken: token } };
  } catch (err) {
    return { props: { tokenError: 'Invalid payment link. Please open from jaibharat.cloud.' } };
  }
}

export default function JaiBharatPay({ tokenPayload, rawToken, tokenError }) {
  return (
    <SegmentPaymentPage
      segmentKey="jai-bharat"
      brandName="Jai Bharat"
      emoji="🇮🇳"
      bgGradient="linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)"
      iconBg="#e0e7ff"
      titleColor="#1e1b4b"
      accentGradient="linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)"
      accentColor="#4f46e5"
      accentDisabled="#a5b4fc"
      validityText="1 Month"
      validityLabel="1-Month Access"
      features={[
        'Access to all govt. job prep',
        'SSC, Banking, Railways, IAS',
        'Mock tests & career ladder',
        'No recurring fees',
      ]}
      originDomain="jaibharat.cloud"
      description="1-Month Access - Government Jobs"
      tokenPayload={tokenPayload || null}
      rawToken={rawToken || null}
      tokenError={tokenError || null}
    />
  );
}
