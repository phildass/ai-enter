import SegmentPaymentPage from '../../components/SegmentPaymentPage';
import { verifyAppmallToken } from '../../lib/verifyAppmallToken';
import { invalidatePendingPaymentTransaction } from '../../lib/invalidatePendingPayment';
import {
  APPMALL_ALLOWED_COURSES,
  isAppmakerManualCourse,
  resolveAppmakerManualPricing,
} from '../../lib/courses';

const NO_TOKEN_ERROR = {
  title: 'Payment Link Required',
  lines: [
    'This page can only be accessed from appmaker.appmall.in after you start checkout for The App Maker’s Manual.',
    'Please return to the App Maker site and click Buy.',
  ],
  portalUrl: 'https://appmaker.appmall.in',
  portalLabel: 'Go to App Maker',
};

function makeTokenVerificationError(reason) {
  return {
    title: 'Payment Link Expired or Invalid',
    lines: [
      'Your payment link could not be verified.',
      `Reason: ${reason}`,
      'Please go back to appmaker.appmall.in and start checkout again.',
    ],
    portalUrl: 'https://appmaker.appmall.in',
    portalLabel: 'Go to App Maker',
  };
}

function courseFromQuery(query) {
  const fromCourseId = typeof query.course_id === 'string' ? query.course_id.trim() : '';
  const fromCourse = typeof query.course === 'string' ? query.course.trim() : '';
  const fromSource = typeof query.source === 'string' ? query.source.trim() : '';
  return fromCourseId || fromCourse || fromSource || 'appmaker';
}

export async function getServerSideProps({ query }) {
  const { purchaseId, token, payment_retry } = query;
  const paymentRetry = payment_retry === '1';
  let pricing = resolveAppmakerManualPricing(courseFromQuery(query));

  if (!token) {
    return {
      props: {
        tokenError: NO_TOKEN_ERROR,
        ...pricing,
      },
    };
  }

  try {
    const payload = verifyAppmallToken(token, { expectedPurchaseId: purchaseId });

    if (!APPMALL_ALLOWED_COURSES.includes(payload.courseSlug)) {
      return {
        props: {
          tokenError: makeTokenVerificationError(`Course "${payload.courseSlug}" is not available.`),
          ...pricing,
        },
      };
    }

    if (!isAppmakerManualCourse(payload.courseSlug)) {
      return {
        props: {
          tokenError: makeTokenVerificationError("This checkout is only for The App Maker's Manual."),
          ...pricing,
        },
      };
    }

    pricing = resolveAppmakerManualPricing(payload.courseSlug);

    if (paymentRetry) {
      await invalidatePendingPaymentTransaction({
        appName: 'appmall',
        sessionId: payload.purchaseId,
      });
    }

    const queryName = typeof query.user_name === 'string' ? query.user_name.trim() : '';
    const queryPhone = typeof query.phone === 'string' ? query.phone.trim() : '';
    const queryEmail = typeof query.email === 'string' ? query.email.trim() : '';

    return {
      props: {
        tokenPayload: {
          ...payload,
          name: payload.name || queryName || null,
          user_name: payload.user_name || queryName || payload.name || null,
          phone: payload.phone || queryPhone || null,
          email: payload.email || queryEmail || null,
          user_email: payload.user_email || payload.email || queryEmail || null,
        },
        rawToken: token,
        purchaseId: payload.purchaseId,
        paymentRetry,
        ...pricing,
      },
    };
  } catch (err) {
    console.error('[appmaker-payments] Token verification failed:', err.message);

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
        ...pricing,
      },
    };
  }
}

export default function AppMakerPaymentsPage({
  tokenPayload,
  rawToken,
  tokenError,
  paymentRetry,
  course,
  amountPaise,
  displayPrice,
  priceBreakdown,
  validityText,
  fixedCourseLabel,
  description,
  features,
}) {
  const pricing = resolveAppmakerManualPricing(course);
  return (
    <SegmentPaymentPage
      segmentKey="appmall"
      brandName="App Maker's Manual"
      emoji="📘"
      bgGradient="linear-gradient(135deg, #f4f1ea 0%, #fde8c8 100%)"
      iconBg="#fde8c8"
      titleColor="#b45309"
      accentGradient="linear-gradient(135deg, #b45309 0%, #1f4b7a 100%)"
      accentColor="#b45309"
      accentDisabled="#94a3b8"
      validityText={validityText || pricing.validityText}
      validityLabel="The App Maker's Manual — 1 year"
      features={features || pricing.features}
      limitedTimeNotice="Refund only if unused download, online-only, within 1 hour of purchase."
      originDomain="appmaker.appmall.in"
      description={description || pricing.description}
      tokenKind="appmall"
      tokenPayload={tokenPayload || null}
      rawToken={rawToken || null}
      tokenError={tokenError || null}
      fixedCourseLabel={fixedCourseLabel || pricing.fixedCourseLabel}
      paymentCourse={course || pricing.course}
      displayPrice={displayPrice || pricing.displayPrice}
      priceBreakdown={priceBreakdown || pricing.priceBreakdown}
      amountPaise={amountPaise || pricing.amountPaise}
      paymentRetry={paymentRetry}
    />
  );
}
