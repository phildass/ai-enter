import SegmentPaymentPage from '../../components/SegmentPaymentPage';
import { verifyHandoffToken } from '../../lib/verifyHandoffToken';
import { IISKILLS_ALLOWED_COURSES } from '../../lib/courses';

const IISKILLS_COURSES = IISKILLS_ALLOWED_COURSES;

export async function getServerSideProps({ query }) {
  const { token } = query;
  if (token) {
    try {
      const payload = verifyHandoffToken(token);
      return { props: { tokenPayload: payload, rawToken: token } };
    } catch (err) {
      console.error('[iiskills] Token verification failed:', err.message);
      return { props: { tokenError: 'Invalid payment link. Please open from iiskills.cloud.' } };
    }
  }
  return { props: {} };
}

export default function IisSkillsPay({ tokenPayload, rawToken, tokenError }) {
  return (
    <SegmentPaymentPage
      segmentKey="iiskills"
      brandName="iiskills"
      emoji="🎓"
      bgGradient="linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)"
      iconBg="#ede9fe"
      titleColor="#4c1d95"
      accentGradient="linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)"
      accentColor="#7c3aed"
      accentDisabled="#c4b5fd"
      validityText="1 Year"
      validityLabel="1-Year Access"
      features={[
        'Access to all learning apps',
        'Professional & skill courses',
        'Progress tracking',
        'No recurring fees',
      ]}
      originDomain="iiskills.cloud"
      description="1-Year Access - iiskills Learning"
      allowedCourses={IISKILLS_COURSES}
      tokenPayload={tokenPayload || null}
      rawToken={rawToken || null}
      tokenError={tokenError || null}
    />
  );
}
