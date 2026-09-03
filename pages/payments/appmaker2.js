import SegmentPaymentPage from '../../components/SegmentPaymentPage';
import { verifyAppmallToken } from '../../lib/verifyAppmallToken';
import { invalidatePendingPaymentTransaction } from '../../lib/invalidatePendingPayment';
import {
  APPMALL_ALLOWED_COURSES,
  APPMAKER2_AMOUNT_PAISE,
  APPMAKER2_DISPLAY_PRICE,
  APPMAKER2_PRICE_BREAKDOWN,
  APPMAKER2_VALIDITY_TEXT,
} from '../../lib/courses';

const NO_TOKEN_ERROR = {
  title: 'Payment Link Required',
  lines: [
    'This page can only be accessed from appmaker.appmall.in after you start checkout for App Maker Premium tickets.',
    'Please return to your App Maker dashboard and buy 10 additional tickets.',
  ],
  portalUrl: 'https://appmaker.appmall.in/library',
  portalLabel: 'Go to App Maker dashboard',
};

function makeTokenVerificationError(reason) {
  return {
    title: 'Payment Link Expired or Invalid',
    lines: [
      'Your payment link could not be verified.',
      `Reason: ${reason}`,
      'Please go back to your App Maker dashboard and start checkout again.',
    ],
    portalUrl: 'https://appmaker.appmall.in/library',
    portalLabel: 'Go to App Maker dashboard',
  };
}

export async function getServerSideProps({ query }) {
  const { purchaseId, token, payment_retry } = query;
  const paymentRetry = payment_retry === '1';
  const amountPaise = APPMAKER2_AMOUNT_PAISE;
  const displayPrice = APPMAKER2_DISPLAY_PRICE;
  const priceBreakdown = APPMAKER2_PRICE_BREAKDOWN;
  const validityText = APPMAKER2_VALIDITY_TEXT;

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

    if (!APPMALL_ALLOWED_COURSES.includes(payload.courseSlug) && payload.courseSlug !== 'appmaker2') {
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

    if (payload.courseSlug && payload.courseSlug !== 'appmaker2') {
      return {
        props: {
          tokenError: makeTokenVerificationError(
            'This checkout is only for App Maker Premium User (10 extra tickets).',
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
    console.error('[appmaker2-payments] Token verification failed:', err.message);

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

export default function AppMakerPremiumPaymentsPage({
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
      brandName="App Maker Premium User"
      emoji="📘"
      bgGradient="linear-gradient(135deg, #f4f1ea 0%, #fde8c8 100%)"
      iconBg="#fde8c8"
      titleColor="#b45309"
      accentGradient="linear-gradient(135deg, #b45309 0%, #1f4b7a 100%)"
      accentColor="#b45309"
      accentDisabled="#94a3b8"
      validityText={validityText || '10 extra App Maker tickets'}
      validityLabel="Premium User — 10 additional tickets"
      features={[
        'Awards Premium User in The App Maker’s Manual app',
        '10 additional tickets (on top of the one included query)',
        'Queries max 100 words',
        'Answers in 24 to 72 hours on your dashboard',
        'Not App Mall suite membership',
      ]}
      limitedTimeNotice="Standalone App Maker add-on. Does not include App Mall suite access."
      originDomain="appmaker.appmall.in"
      description="App Maker Premium User — 10 extra tickets"
      tokenKind="appmall"
      tokenPayload={tokenPayload || null}
      rawToken={rawToken || null}
      tokenError={tokenError || null}
      fixedCourseLabel="App Maker Premium — ₹1,180 (incl. GST)"
      paymentCourse="appmaker2"
      displayPrice={displayPrice || APPMAKER2_DISPLAY_PRICE}
      priceBreakdown={priceBreakdown || APPMAKER2_PRICE_BREAKDOWN}
      amountPaise={amountPaise || APPMAKER2_AMOUNT_PAISE}
      paymentRetry={paymentRetry}
    />
  );
}
