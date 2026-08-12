import SegmentPaymentPage from '../../components/SegmentPaymentPage';
import { verifyAppmallToken } from '../../lib/verifyAppmallToken';
import { invalidatePendingPaymentTransaction } from '../../lib/invalidatePendingPayment';
import {
  APPMALL_ALLOWED_COURSES,
  MASTERCLASS_INTRO_AMOUNT_PAISE,
  MASTERCLASS_INTRO_DISPLAY_PRICE,
  MASTERCLASS_INTRO_PRICE_BREAKDOWN,
  MASTERCLASS_INTRO_VALIDITY_TEXT,
} from '../../lib/courses';

const NO_TOKEN_ERROR = {
  title: 'Payment Link Required',
  lines: [
    'This page can only be accessed from masterclass.appmall.in after you register for the introductory class.',
    'Please return to the masterclass site and click Try Introductory Class.',
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
      'Please go back to masterclass.appmall.in and register for the intro class again.',
    ],
    portalUrl: 'https://masterclass.appmall.in',
    portalLabel: 'Go to Masterclass',
  };
}

export async function getServerSideProps({ query }) {
  const { purchaseId, token, payment_retry } = query;
  const paymentRetry = payment_retry === '1';
  const amountPaise = MASTERCLASS_INTRO_AMOUNT_PAISE;
  const displayPrice = MASTERCLASS_INTRO_DISPLAY_PRICE;
  const priceBreakdown = MASTERCLASS_INTRO_PRICE_BREAKDOWN;
  const validityText = MASTERCLASS_INTRO_VALIDITY_TEXT;

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

    if (
      !APPMALL_ALLOWED_COURSES.includes(payload.courseSlug) &&
      payload.courseSlug !== 'masterclass-intro'
    ) {
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

    if (payload.courseSlug && payload.courseSlug !== 'masterclass-intro') {
      return {
        props: {
          tokenError: makeTokenVerificationError(
            'This checkout is only for the one-hour Masterclass introductory class.',
          ),
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
      },
    };
  } catch (err) {
    console.error('[intromaster-payments] Token verification failed:', err.message);

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

export default function IntroMasterPaymentsPage({
  tokenPayload,
  rawToken,
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
      brandName="App Mall Masterclass Intro"
      emoji="🎓"
      bgGradient="linear-gradient(135deg, #f7f6f3 0%, #e8f0f7 100%)"
      iconBg="#e8f0f7"
      titleColor="#1f4b7a"
      accentGradient="linear-gradient(135deg, #1f4b7a 0%, #2f6fa8 100%)"
      accentColor="#1f4b7a"
      accentDisabled="#94a3b8"
      validityText={validityText || '1-hour intro + 12-month App Mall access'}
      validityLabel="Introductory class — AI-Assisted App Development"
      features={[
        'One-hour online intro via Google Meet',
        'Brief overview of what the full Masterclass covers',
        'Decide afterwards whether to take the One-Day Masterclass',
        'Bonus: 12-month Reg User access to all App Mall apps',
      ]}
      limitedTimeNotice="Date and Meet details are emailed manually after payment from info@appmall.in or info@aienter.in."
      originDomain="masterclass.appmall.in"
      description="One-hour introductory class to the AI Masterclass"
      tokenKind="appmall"
      tokenPayload={tokenPayload || null}
      rawToken={rawToken || null}
      tokenError={tokenError || null}
      fixedCourseLabel="Masterclass Intro — ₹590 (incl. GST)"
      paymentCourse="masterclass-intro"
      displayPrice={displayPrice || MASTERCLASS_INTRO_DISPLAY_PRICE}
      priceBreakdown={priceBreakdown || MASTERCLASS_INTRO_PRICE_BREAKDOWN}
      amountPaise={amountPaise || MASTERCLASS_INTRO_AMOUNT_PAISE}
      paymentRetry={paymentRetry}
    />
  );
}
