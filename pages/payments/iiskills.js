import SegmentPaymentPage from '../../components/SegmentPaymentPage';
import { verifyIiskillsToken } from '../../lib/verifyIiskillsToken';
import { IISKILLS_ALLOWED_COURSES } from '../../lib/courses';
import {
  BUNDLE_COURSE_SLUG,
  IISKILLS_INDIVIDUAL_COURSES,
  isIiskillsBundleOfferActive,
} from '../../lib/iiskillsOffer';

const COURSE_LABELS = {
  'learn-ai': 'Learn AI',
  'learn-developer': 'Learn Developer',
  'learn-pr': 'Learn PR',
  'learn-management': 'Learn Management',
  'skills-passport': 'Skills Passport',
};

const DIRECT_ACCESS_ERROR = {
  title: '⚠️ Direct Access Not Allowed',
  lines: [
    'Payments are only accepted from official AI Cloud Enterprises portals.',
    'For iiskills payments, please visit:',
    'If you were redirected here by iiskills.in, please try again or contact support.',
    'This security measure protects your payment information.',
  ],
  portalUrl: 'https://iiskills.in',
  portalLabel: '🔗 https://iiskills.in',
};

export async function getServerSideProps({ query }) {
  const { purchaseId, token } = query;
  const isBundlePhase = isIiskillsBundleOfferActive();

  if (!token) {
    return {
      props: { tokenError: DIRECT_ACCESS_ERROR, isBundlePhase },
    };
  }

  try {
    const payload = verifyIiskillsToken(token, { expectedPurchaseId: purchaseId });

    if (!IISKILLS_ALLOWED_COURSES.includes(payload.courseSlug)) {
      return { props: { tokenError: 'Course not available for purchase.', isBundlePhase } };
    }

    if (!isBundlePhase && !IISKILLS_INDIVIDUAL_COURSES.includes(payload.courseSlug)) {
      return {
        props: {
          tokenError: 'Please select a single course on iiskills.in to continue.',
          isBundlePhase,
        },
      };
    }

    return {
      props: {
        tokenPayload: payload,
        rawToken: token,
        purchaseId: payload.purchaseId,
        isBundlePhase,
      },
    };
  } catch (err) {
    console.error('[iiskills-payments] Token verification failed:', err.message);
    return {
      props: { tokenError: DIRECT_ACCESS_ERROR, isBundlePhase },
    };
  }
}

export default function IisSkillsPaymentsPage({
  tokenPayload,
  rawToken,
  purchaseId,
  tokenError,
  isBundlePhase,
}) {
  const selectedCourseLabel = tokenPayload?.courseSlug
    ? COURSE_LABELS[tokenPayload.courseSlug] || tokenPayload.courseSlug
    : null;

  const bundleFeatures = [
    'All 5 paid apps for the price of 1',
    'Learn AI, Developer, PR, Management & Skills Passport',
    'Limited time 5-for-1 launch offer',
    'Access valid till June 30, 2026',
  ];

  const individualFeatures = [
    'Full course access for 1 year',
    'Exam-oriented content and analytics',
    'Certificate of completion',
    'No recurring monthly fees',
  ];

  return (
    <SegmentPaymentPage
      segmentKey="iiskills"
      brandName="iiskills"
      emoji="🎓"
      bgGradient="linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)"
      iconBg="#ede9fe"
      titleColor="#5b21b6"
      accentGradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      accentColor="#667eea"
      accentDisabled="#a5b4fc"
      validityText={isBundlePhase ? 'till June 30, 2026' : '1 Year'}
      validityLabel={isBundlePhase ? '5-for-1 Launch Offer' : '1-Year Access'}
      features={isBundlePhase ? bundleFeatures : individualFeatures}
      originDomain="iiskills.in"
      description={
        isBundlePhase
          ? 'All Paid Apps — 5 for 1 Launch Offer (till June 30, 2026)'
          : '1-Year Access — iiskills'
      }
      tokenKind="iiskills"
      tokenPayload={tokenPayload || null}
      rawToken={rawToken || null}
      tokenError={tokenError || null}
      fixedCourseLabel={
        isBundlePhase
          ? 'All Courses (5 Paid Apps) — till June 30, 2026'
          : selectedCourseLabel
      }
      paymentCourse={isBundlePhase ? BUNDLE_COURSE_SLUG : undefined}
      displayPrice="₹116.82"
      priceBreakdown="(₹99 + 18% GST)"
    />
  );
}
