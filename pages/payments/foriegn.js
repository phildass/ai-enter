import SegmentPaymentPage from '../../components/SegmentPaymentPage';
import { verifyAppmallToken } from '../../lib/verifyAppmallToken';
import { invalidatePendingPaymentTransaction } from '../../lib/invalidatePendingPayment';
import {
  APPMALL_ALLOWED_COURSES,
  CURRENT_BUNDLE,
  INTERNATIONAL_AMOUNT_CENTS,
  INTERNATIONAL_COURSE_ID,
  INTERNATIONAL_PRICE_USD,
  isInternationalPaymentCourse,
  resolveInternationalCharge,
} from '../../lib/courses';

const DISPLAY_PRICE = `$${INTERNATIONAL_PRICE_USD}.00`;
const TAGLINE = `International buyers — $${INTERNATIONAL_PRICE_USD} (all inclusive)`;
const PRICE_BREAKDOWN =
  `International buyers — $${INTERNATIONAL_PRICE_USD} (all inclusive). One 12-month membership: AppMall suite, The App Maker’s Manual download, and App Builder.`;
const LIMITED_NOTICE =
  `USD ${INTERNATIONAL_PRICE_USD} all-inclusive. Same entitlements as AppMall suite membership.`;

const NO_TOKEN_ERROR = {
  title: 'Payment Link Required',
  lines: [
    'This page can only be accessed from appmall.in.',
    'Please choose International buyers on appmall.in/pay to start a signed checkout.',
  ],
  portalUrl: 'https://appmall.in/pay',
  portalLabel: 'Go to appmall.in/pay',
};

function makeTokenVerificationError(reason) {
  return {
    title: 'Payment Link Expired or Invalid',
    lines: [
      'Your payment link could not be verified.',
      `Reason: ${reason}`,
      'Please go back to appmall.in/pay and choose International buyers again.',
    ],
    portalUrl: 'https://appmall.in/pay',
    portalLabel: 'Go to appmall.in/pay',
  };
}

function queryString(query) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query || {})) {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item != null && item !== '') params.append(key, String(item));
      });
    } else if (value != null && value !== '') {
      params.set(key, String(value));
    }
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export async function getServerSideProps({ query }) {
  const { purchaseId, token, payment_retry, amount, currency, course_id, course, offer } = query;
  const paymentRetry = payment_retry === '1';
  const courseSlug =
    typeof course_id === 'string' ? course_id : typeof course === 'string' ? course : INTERNATIONAL_COURSE_ID;

  if (!token) {
    const charge = resolveInternationalCharge({ currency }, { amount, currency });
    return {
      props: {
        tokenError: NO_TOKEN_ERROR,
        amountPaise: charge.amountMinor,
        displayPrice: DISPLAY_PRICE,
        checkoutCurrency: 'USD',
      },
    };
  }

  try {
    const payload = verifyAppmallToken(token, { expectedPurchaseId: purchaseId });

    if (!APPMALL_ALLOWED_COURSES.includes(payload.courseSlug)) {
      return {
        props: {
          tokenError: makeTokenVerificationError(`Course "${payload.courseSlug}" is not available.`),
        },
      };
    }

    if (
      !isInternationalPaymentCourse(payload.courseSlug) &&
      offer !== 'international' &&
      !isInternationalPaymentCourse(courseSlug)
    ) {
      return {
        redirect: {
          destination: `/payments/appmall${queryString(query)}`,
          permanent: false,
        },
      };
    }

    const charge = resolveInternationalCharge(
      {
        currency: payload.currency || currency,
        amount_paise: payload.amount_paise || payload.amountPaise,
        amount_cents: payload.amount_cents,
        amountPaise: payload.amount_paise || payload.amountPaise,
      },
      { amount: amount ?? payload.amount_incl_gst, currency: payload.currency || currency },
    );

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
        amountPaise: charge.amountMinor,
        displayPrice: DISPLAY_PRICE,
        priceBreakdown: PRICE_BREAKDOWN,
        validityText: '12 Months',
        checkoutCurrency: 'USD',
        membershipTagline: TAGLINE,
        limitedTimeNotice: LIMITED_NOTICE,
      },
    };
  } catch (err) {
    console.error('[foriegn-payments] Token verification failed:', err.message);

    const reason = /expire/i.test(err.message)
      ? 'The payment link has expired. Please get a new one.'
      : /signature/i.test(err.message)
        ? 'Security verification failed. The server configuration may need updating.'
        : /secret|configured/i.test(err.message)
          ? 'Payment server is not properly configured. Please contact support.'
          : err.message || 'Unknown verification error.';

    const charge = resolveInternationalCharge({ currency }, { amount, currency });
    return {
      props: {
        tokenError: makeTokenVerificationError(reason),
        amountPaise: charge.amountMinor,
        displayPrice: DISPLAY_PRICE,
        checkoutCurrency: 'USD',
      },
    };
  }
}

export default function InternationalPaymentsPage({
  tokenPayload,
  rawToken,
  purchaseId,
  tokenError,
  paymentRetry,
  amountPaise,
  displayPrice,
  priceBreakdown,
  validityText,
  membershipTagline,
  limitedTimeNotice,
}) {
  const tagline = membershipTagline || TAGLINE;
  return (
    <SegmentPaymentPage
      segmentKey="appmall"
      brandName="appmall"
      emoji="🌍"
      bgGradient="linear-gradient(135deg, #ecfeff 0%, #e0f2fe 100%)"
      iconBg="#e0f2fe"
      titleColor="#0c4a6e"
      accentGradient="linear-gradient(135deg, #0284c7 0%, #0369a1 100%)"
      accentColor="#0284c7"
      accentDisabled="#7dd3fc"
      validityText={validityText || '12 Months'}
      validityLabel={tagline}
      features={CURRENT_BUNDLE.features}
      limitedTimeNotice={limitedTimeNotice || LIMITED_NOTICE}
      originDomain="appmall.in"
      description={tagline}
      tokenKind="appmall"
      tokenPayload={tokenPayload || null}
      rawToken={rawToken || null}
      tokenError={tokenError || null}
      fixedCourseLabel={TAGLINE}
      paymentCourse={INTERNATIONAL_COURSE_ID}
      displayPrice={displayPrice || DISPLAY_PRICE}
      priceBreakdown={priceBreakdown || PRICE_BREAKDOWN}
      amountPaise={amountPaise || INTERNATIONAL_AMOUNT_CENTS}
      paymentRetry={paymentRetry}
    />
  );
}
