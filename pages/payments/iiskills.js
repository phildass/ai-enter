import SegmentPaymentPage from '../../components/SegmentPaymentPage';
import { verifyIiskillsToken } from '../../lib/verifyIiskillsToken';
import { IISKILLS_ALLOWED_COURSES } from '../../lib/courses';

const IISKILLS_COURSES = IISKILLS_ALLOWED_COURSES;

export async function getServerSideProps({ query }) {
  const { purchaseId, token } = query;

  if (!purchaseId || !token) {
    return { props: { tokenError: 'Invalid payment link. Missing required parameters.' } };
  }

  try {
    const payload = verifyIiskillsToken(token);

    // Validate that the URL purchaseId matches the token's purchaseId
    if (payload.purchaseId !== purchaseId) {
      return { props: { tokenError: 'Invalid payment link. Purchase ID mismatch.' } };
    }

    // Validate course slug against the allowlist
    if (!IISKILLS_COURSES.includes(payload.courseSlug)) {
      return { props: { tokenError: 'Course not available for purchase.' } };
    }

    return { props: { tokenPayload: payload, rawToken: token, purchaseId } };
  } catch (err) {
    console.error('[iiskills] Token verification failed:', err.message);
    return { props: { tokenError: 'Invalid payment link. Please open from iiskills.cloud.' } };
  }
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
