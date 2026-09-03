import SegmentPaymentPage from '../../components/SegmentPaymentPage';
import { verifyAppmallToken } from '../../lib/verifyAppmallToken';
import { invalidatePendingPaymentTransaction } from '../../lib/invalidatePendingPayment';
import {
  APPMALL_ALLOWED_COURSES,
  APPMAKER_AMOUNT_PAISE,
  APPMAKER_DISPLAY_PRICE,
  APPMAKER_PRICE_BREAKDOWN,
  APPMAKER_VALIDITY_TEXT,
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

export async function getServerSideProps({ query }) {
  const { purchaseId, token, payment_retry } = query;
  const paymentRetry = payment_retry === '1';
  const amountPaise = APPMAKER_AMOUNT_PAISE;
  const displayPrice = APPMAKER_DISPLAY_PRICE;
  const priceBreakdown = APPMAKER_PRICE_BREAKDOWN;
  const validityText = APPMAKER_VALIDITY_TEXT;

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

    if (!APPMALL_ALLOWED_COURSES.includes(payload.courseSlug) && payload.courseSlug !== 'appmaker') {
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

    if (payload.courseSlug && payload.courseSlug !== 'appmaker') {
      return {
        props: {
          tokenError: makeTokenVerificationError("This checkout is only for The App Maker's Manual."),
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
        amountPaise,
        displayPrice,
        priceBreakdown,
        validityText,
      },
    };
  }
}

export default function AppMakerPaymentsPage({
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
      brandName="App Maker's Manual"
      emoji="📘"
      bgGradient="linear-gradient(135deg, #f4f1ea 0%, #fde8c8 100%)"
      iconBg="#fde8c8"
      titleColor="#b45309"
      accentGradient="linear-gradient(135deg, #b45309 0%, #1f4b7a 100%)"
      accentColor="#b45309"
      accentDisabled="#94a3b8"
      validityText={validityText || "1-year App Maker's Manual"}
      validityLabel="The App Maker's Manual — 1 year"
      features={[
        'Online reader with index and chapter links',
        'Google Translate — read in any language',
        'One download (English PDF or translated HTML)',
        'One admin-answered query (max 100 words, 24–72 hours)',
        'Not App Mall suite membership',
      ]}
      limitedTimeNotice="Refund only if unused download, online-only, within 1 hour of purchase."
      originDomain="appmaker.appmall.in"
      description="The App Maker's Manual — 1-year ebook membership"
      tokenKind="appmall"
      tokenPayload={tokenPayload || null}
      rawToken={rawToken || null}
      tokenError={tokenError || null}
      fixedCourseLabel="App Maker's Manual — ₹590 (incl. GST)"
      paymentCourse="appmaker"
      displayPrice={displayPrice || APPMAKER_DISPLAY_PRICE}
      priceBreakdown={priceBreakdown || APPMAKER_PRICE_BREAKDOWN}
      amountPaise={amountPaise || APPMAKER_AMOUNT_PAISE}
      paymentRetry={paymentRetry}
    />
  );
}
