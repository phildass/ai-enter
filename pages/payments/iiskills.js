import SegmentPaymentPage from '../../components/SegmentPaymentPage';
import { verifyIiskillsToken } from '../../lib/verifyIiskillsToken';
import { invalidatePendingPaymentTransaction } from '../../lib/invalidatePendingPayment';
import { IISKILLS_ALLOWED_COURSES } from '../../lib/courses';
import { BUNDLE_COURSE_SLUG } from '../../lib/iiskillsOffer';

const NO_TOKEN_ERROR = {
  title: 'Payment Link Required',
  lines: [
    'This page can only be accessed from iiskills.in.',
    'Please click "Pay" on your iiskills dashboard to start the payment process.',
  ],
  portalUrl: 'https://iiskills.in/dashboard',
  portalLabel: 'Go to iiskills.in Dashboard',
};

function makeTokenVerificationError(reason) {
  return {
    title: 'Payment Link Expired or Invalid',
    lines: [
      'Your payment link could not be verified.',
      `Reason: ${reason}`,
      'Please go back to iiskills.in and click "Pay" again to get a fresh link.',
    ],
    portalUrl: 'https://iiskills.in/dashboard',
    portalLabel: 'Go to iiskills.in Dashboard',
  };
}

export async function getServerSideProps({ query }) {
  const { purchaseId, token, payment_retry } = query;
  const paymentRetry = payment_retry === '1';

  if (!token) {
    return {
      props: { tokenError: NO_TOKEN_ERROR },
    };
  }

  try {
    const payload = verifyIiskillsToken(token, { expectedPurchaseId: purchaseId });

    if (!IISKILLS_ALLOWED_COURSES.includes(payload.courseSlug)) {
      console.error('[iiskills-payments] Course not in allowed list:', payload.courseSlug);
      return { props: { tokenError: makeTokenVerificationError(`Course "${payload.courseSlug}" is not available.`) } };
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

    const reason = /expire/i.test(err.message)
      ? 'The payment link has expired. Please get a new one.'
      : /signature/i.test(err.message)
        ? 'Security verification failed. The server configuration may need updating.'
        : /secret|configured/i.test(err.message)
          ? 'Payment server is not properly configured. Please contact support.'
          : err.message || 'Unknown verification error.';

    return {
      props: { tokenError: makeTokenVerificationError(reason) },
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
    'Astro detailed Kundli + AI Astrologer',
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
      validityLabel="Entrance Exams + Topper + Astro Bundle"
      features={bundleFeatures}
      originDomain="iiskills.in"
      description="Entrance Exams + Topper + Astro — 1-Year Access"
      tokenKind="iiskills"
      tokenPayload={tokenPayload || null}
      rawToken={rawToken || null}
      tokenError={tokenError || null}
      fixedCourseLabel="Entrance Exams + Topper + Astro Bundle"
      paymentCourse={BUNDLE_COURSE_SLUG}
      displayPrice="₹116.82"
      priceBreakdown="(₹99 + 18% GST)"
      paymentRetry={paymentRetry}
    />
  );
}
