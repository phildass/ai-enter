import SegmentPaymentPage from '../../components/SegmentPaymentPage';
import { verifyAppmallToken } from '../../lib/verifyAppmallToken';
import { invalidatePendingPaymentTransaction } from '../../lib/invalidatePendingPayment';
import {
  APPMALL_ALLOWED_COURSES,
  CURRENT_BUNDLE,
  MEMBERSHIP_LIMITED_TIME_NOTICE,
  MEMBERSHIP_TAGLINE,
  ASTRO_QUESTION_PRICE_EXCL_GST,
  ASTRO_QUESTION_PRICE_INCL_GST,
  membershipDisplayPrice,
  membershipPriceBreakdown,
  resolveAppmallAmountPaise,
} from '../../lib/courses';
import { BUNDLE_COURSE_SLUG } from '../../lib/appmallOffer';

const NO_TOKEN_ERROR = {
  title: 'Payment Link Required',
  lines: [
    'This page can only be accessed from appmall.in.',
    'Please click "Pay" on your appmall dashboard to start the payment process.',
  ],
  portalUrl: 'https://appmall.in/dashboard',
  portalLabel: 'Go to appmall.in Dashboard',
};

function makeTokenVerificationError(reason) {
  return {
    title: 'Payment Link Expired or Invalid',
    lines: [
      'Your payment link could not be verified.',
      `Reason: ${reason}`,
      'Please go back to appmall.in and click "Pay" again to get a fresh link.',
    ],
    portalUrl: 'https://appmall.in/dashboard',
    portalLabel: 'Go to appmall.in Dashboard',
  };
}

export async function getServerSideProps({ query }) {
  const { purchaseId, token, payment_retry, amount, course_id, course } = query;
  const paymentRetry = payment_retry === '1';
  const courseSlug = typeof course_id === 'string' ? course_id : typeof course === 'string' ? course : BUNDLE_COURSE_SLUG;
  const amountPaise = resolveAppmallAmountPaise(courseSlug, amount);
  const isAstroPack = courseSlug === 'astro-question' || courseSlug === 'janam-kundli';
  const displayPrice = isAstroPack
    ? `₹${ASTRO_QUESTION_PRICE_INCL_GST.toFixed(2)}`
    : membershipDisplayPrice();
  const priceBreakdown = isAstroPack
    ? `(₹${ASTRO_QUESTION_PRICE_EXCL_GST} + 18% GST) — Astro Ask Questions pack`
    : membershipPriceBreakdown();
  const validityText = isAstroPack ? '10 AI questions' : '12 Months';

  if (!token) {
    return {
      props: { tokenError: NO_TOKEN_ERROR },
    };
  }

  try {
    const payload = verifyAppmallToken(token, { expectedPurchaseId: purchaseId });

    if (!APPMALL_ALLOWED_COURSES.includes(payload.courseSlug)) {
      console.error('[appmall-payments] Course not in allowed list:', payload.courseSlug);
      return { props: { tokenError: makeTokenVerificationError(`Course "${payload.courseSlug}" is not available.`) } };
    }

    if (paymentRetry) {
      await invalidatePendingPaymentTransaction({
        appName: 'appmall',
        sessionId: payload.purchaseId,
      });
    }

    return {
      props: {
        tokenPayload: payload,
        rawToken: token,
        purchaseId: payload.purchaseId,
        paymentRetry,
        amountPaise,
        displayPrice,
        priceBreakdown,
        validityText,
      },
    };
  } catch (err) {
    console.error('[appmall-payments] Token verification failed:', err.message);

    const reason = /expire/i.test(err.message)
      ? 'The payment link has expired. Please get a new one.'
      : /signature/i.test(err.message)
        ? 'Security verification failed. The server configuration may need updating.'
        : /secret|configured/i.test(err.message)
          ? 'Payment server is not properly configured. Please contact support.'
          : err.message || 'Unknown verification error.';

    return {
      props: {
        tokenError: makeTokenVerificationError(reason),
        amountPaise,
        displayPrice,
        priceBreakdown,
        validityText,
      },
    };
  }
}

export default function AppMallPaymentsPage({
  tokenPayload,
  rawToken,
  purchaseId,
  tokenError,
  paymentRetry,
  amountPaise,
  displayPrice,
  priceBreakdown,
  validityText,
}) {
  return (
    <SegmentPaymentPage
      segmentKey="appmall"
      brandName="appmall"
      emoji="🎓"
      bgGradient="linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)"
      iconBg="#ede9fe"
      titleColor="#5b21b6"
      accentGradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      accentColor="#667eea"
      accentDisabled="#a5b4fc"
      validityText={validityText || '12 Months'}
      validityLabel={MEMBERSHIP_TAGLINE}
      features={CURRENT_BUNDLE.features}
      limitedTimeNotice={MEMBERSHIP_LIMITED_TIME_NOTICE}
      originDomain="appmall.in"
      description={MEMBERSHIP_TAGLINE}
      tokenKind="appmall"
      tokenPayload={tokenPayload || null}
      rawToken={rawToken || null}
      tokenError={tokenError || null}
      fixedCourseLabel="App-Mall Membership — All Apps"
      paymentCourse={BUNDLE_COURSE_SLUG}
      displayPrice={displayPrice || membershipDisplayPrice()}
      priceBreakdown={priceBreakdown || membershipPriceBreakdown()}
      amountPaise={amountPaise || undefined}
      paymentRetry={paymentRetry}
    />
  );
}
