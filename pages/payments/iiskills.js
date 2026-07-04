import SegmentPaymentPage from '../../components/SegmentPaymentPage';
import { verifyIiskillsToken } from '../../lib/verifyIiskillsToken';
import { invalidatePendingPaymentTransaction } from '../../lib/invalidatePendingPayment';
import { IISKILLS_ALLOWED_COURSES } from '../../lib/courses';
import { BUNDLE_COURSE_SLUG } from '../../lib/iiskillsOffer';

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
  const { purchaseId, token, payment_retry } = query;
  const paymentRetry = payment_retry === '1';

  if (!token) {
    return {
      props: { tokenError: DIRECT_ACCESS_ERROR },
    };
  }

  try {
    const payload = verifyIiskillsToken(token, { expectedPurchaseId: purchaseId });

    if (!IISKILLS_ALLOWED_COURSES.includes(payload.courseSlug)) {
      return { props: { tokenError: 'Course not available for purchase.' } };
    }

    if (paymentRetry) {
      await invalidatePendingPaymentTransaction({
        appName: 'iiskills',
        sessionId: payload.purchaseId,
      });
    }

    return {
      props: {
        tokenPayload: payload,
        rawToken: token,
        purchaseId: payload.purchaseId,
        paymentRetry,
      },
    };
  } catch (err) {
    console.error('[iiskills-payments] Token verification failed:', err.message);
    return {
      props: { tokenError: DIRECT_ACCESS_ERROR },
    };
  }
}

export default function IisSkillsPaymentsPage({
  tokenPayload,
  rawToken,
  purchaseId,
  tokenError,
  paymentRetry,
}) {
  const bundleFeatures = [
    'Full Entrance Exams app access',
    'Full Topper app access',
    'Exam-oriented content and analytics',
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
      validityText="1 Year"
      validityLabel="Entrance Exams + Topper Bundle"
      features={bundleFeatures}
      originDomain="iiskills.in"
      description="Entrance Exams + Topper — 1-Year Access"
      tokenKind="iiskills"
      tokenPayload={tokenPayload || null}
      rawToken={rawToken || null}
      tokenError={tokenError || null}
      fixedCourseLabel="Entrance Exams + Topper Bundle"
      paymentCourse={BUNDLE_COURSE_SLUG}
      displayPrice="₹116.82"
      priceBreakdown="(₹99 + 18% GST)"
      paymentRetry={paymentRetry}
    />
  );
}
