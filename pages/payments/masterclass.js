import SegmentPaymentPage from '../../components/SegmentPaymentPage';
import { verifyAppmallToken } from '../../lib/verifyAppmallToken';
import { invalidatePendingPaymentTransaction } from '../../lib/invalidatePendingPayment';
import {
  APPMALL_ALLOWED_COURSES,
  MASTERCLASS_AMOUNT_PAISE,
  MASTERCLASS_DISPLAY_PRICE,
  MASTERCLASS_PRICE_BREAKDOWN,
  MASTERCLASS_VALIDITY_TEXT,
} from '../../lib/courses';

const NO_TOKEN_ERROR = {
  title: 'Payment Link Required',
  lines: [
    'This page can only be accessed from masterclass.appmall.in after you clear the eligibility test and submit registration.',
    'Please return to the masterclass site and continue from registration.',
  ],
  portalUrl: 'https://masterclass.appmall.in',
  portalLabel: 'Go to Masterclass',
};

function makeTokenVerificationError(reason) {
  return {
    title: 'Payment Link Expired or Invalid',
    lines: [
      'Your payment link could not be verified.',
      `Reason: ${reason}`,
      'Please go back to masterclass.appmall.in and register again to get a fresh link.',
    ],
    portalUrl: 'https://masterclass.appmall.in',
    portalLabel: 'Go to Masterclass',
  };
}

export async function getServerSideProps({ query }) {
  const { purchaseId, token, payment_retry, amount, course_id, course } = query;
  const paymentRetry = payment_retry === '1';
  const courseSlug =
    typeof course_id === 'string' ? course_id : typeof course === 'string' ? course : 'masterclass';
  const amountPaise = MASTERCLASS_AMOUNT_PAISE;
  const displayPrice = MASTERCLASS_DISPLAY_PRICE;
  const priceBreakdown = MASTERCLASS_PRICE_BREAKDOWN;
  const validityText = MASTERCLASS_VALIDITY_TEXT;

  if (!token) {
    return {
      props: {
        tokenError: NO_TOKEN_ERROR,
        amountPaise,
        displayPrice,
        priceBreakdown,
        validityText,
      },
    };
  }

  try {
    const payload = verifyAppmallToken(token, { expectedPurchaseId: purchaseId });

    if (!APPMALL_ALLOWED_COURSES.includes(payload.courseSlug) && payload.courseSlug !== 'masterclass') {
      console.error('[masterclass-payments] Course not in allowed list:', payload.courseSlug);
      return {
        props: {
          tokenError: makeTokenVerificationError(`Course "${payload.courseSlug}" is not available.`),
          amountPaise,
          displayPrice,
          priceBreakdown,
          validityText,
        },
      };
    }

    if (payload.courseSlug && payload.courseSlug !== 'masterclass') {
      return {
        props: {
          tokenError: makeTokenVerificationError('This checkout is only for the AI Masterclass.'),
          amountPaise,
          displayPrice,
          priceBreakdown,
          validityText,
        },
      };
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
        amountHint: amount || null,
        courseSlugHint: courseSlug,
      },
    };
  } catch (err) {
    console.error('[masterclass-payments] Token verification failed:', err.message);

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

export default function MasterclassPaymentsPage({
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
      brandName="App Mall Masterclass"
      emoji="🎓"
      bgGradient="linear-gradient(135deg, #f7f6f3 0%, #e8f0f7 100%)"
      iconBg="#e8f0f7"
      titleColor="#1f4b7a"
      accentGradient="linear-gradient(135deg, #1f4b7a 0%, #2f6fa8 100%)"
      accentColor="#1f4b7a"
      accentDisabled="#94a3b8"
      validityText={validityText || 'One-Day Masterclass + 12-month App Mall access'}
      validityLabel="AI-Assisted App Development Masterclass"
      features={[
        'One-Day online masterclass via Google Meet',
        'Seat on your selected alternate Sunday',
        'Bonus: 12-month Reg User access to all App Mall apps',
        'Refund eligible up to 24 hours before class',
      ]}
      limitedTimeNotice="Meet joining details are emailed manually after payment from info@appmall.in or info@aienter.in."
      originDomain="masterclass.appmall.in"
      description="One-Day Masterclass in AI-Assisted App Development"
      tokenKind="appmall"
      tokenPayload={tokenPayload || null}
      rawToken={rawToken || null}
      tokenError={tokenError || null}
      fixedCourseLabel="AI Masterclass — ₹5,900 (incl. GST)"
      paymentCourse="masterclass"
      displayPrice={displayPrice || MASTERCLASS_DISPLAY_PRICE}
      priceBreakdown={priceBreakdown || MASTERCLASS_PRICE_BREAKDOWN}
      amountPaise={amountPaise || MASTERCLASS_AMOUNT_PAISE}
      paymentRetry={paymentRetry}
    />
  );
}
