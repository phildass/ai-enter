import SegmentPaymentPage from '../../components/SegmentPaymentPage';
import { verifyAppmallToken } from '../../lib/verifyAppmallToken';
import { invalidatePendingPaymentTransaction } from '../../lib/invalidatePendingPayment';
import {
  APPMALL_ALLOWED_COURSES,
  IG_DISCOUNT_AMOUNT_PAISE,
  IG_DISCOUNT_DISPLAY_PRICE,
  IG_DISCOUNT_LIMITED_TIME_NOTICE,
  IG_DISCOUNT_PRICE_BREAKDOWN,
  IG_DISCOUNT_TAGLINE,
  IG_DISCOUNT_VALIDITY_TEXT,
  isIgDiscountPricingTier,
  resolveAppmallAmountPaise,
} from '../../lib/courses';
import { BUNDLE_COURSE_SLUG } from '../../lib/appmallOffer';

const NO_TOKEN_ERROR = {
  title: 'Payment Link Required',
  lines: [
    'This discounted page can only be opened from appmall.in with a valid signed link.',
    'Open the Instagram discount checkout on appmall.in and enter code APPMALL-DISC-99.',
  ],
  portalUrl: 'https://appmall.in/payments/discounted',
  portalLabel: 'Go to AppMall discounted checkout',
};

function makeTokenVerificationError(reason) {
  return {
    title: 'Payment Link Expired or Invalid',
    lines: [
      'Your discounted payment link could not be verified.',
      `Reason: ${reason}`,
      'Please return to appmall.in/payments/discounted and try again.',
    ],
    portalUrl: 'https://appmall.in/payments/discounted',
    portalLabel: 'Restart discounted checkout',
  };
}

const IG_FEATURES = [
  'Access to all App-Mall apps',
  'Validity: 13 months',
  'Instagram follower offer — no 1+1 add-on',
  'Follow @philintheblank100 must be confirmed within 24 hours',
  'No refund if membership is cancelled for failed follow verification',
  'No recurring monthly fees',
];

export async function getServerSideProps({ query }) {
  const { purchaseId, token, payment_retry, amount, course_id, course, pricing_tier, offer } =
    query;
  const paymentRetry = payment_retry === '1';
  const courseSlug =
    typeof course_id === 'string' ? course_id : typeof course === 'string' ? course : BUNDLE_COURSE_SLUG;

  if (!token) {
    return { props: { tokenError: NO_TOKEN_ERROR } };
  }

  try {
    const payload = verifyAppmallToken(token, { expectedPurchaseId: purchaseId });
    const tier =
      (typeof pricing_tier === 'string' && pricing_tier) ||
      payload.pricing_tier ||
      payload.pricingTier ||
      '';
    const offerVal =
      (typeof offer === 'string' && offer) || payload.offer || '';

    if (!isIgDiscountPricingTier(tier) && offerVal !== 'ig-disc-99') {
      return {
        props: {
          tokenError: makeTokenVerificationError(
            'This link is not an Instagram discount session. Use the standard membership checkout.',
          ),
        },
      };
    }

    if (!APPMALL_ALLOWED_COURSES.includes(payload.courseSlug)) {
      return {
        props: {
          tokenError: makeTokenVerificationError(
            `Course "${payload.courseSlug}" is not available.`,
          ),
        },
      };
    }

    const amountPaise = resolveAppmallAmountPaise(courseSlug, amount, {
      pricingTier: tier || 'ig_disc_99',
    });

    if (amountPaise !== IG_DISCOUNT_AMOUNT_PAISE) {
      return {
        props: {
          tokenError: makeTokenVerificationError(
            'Discount amount mismatch. Restart checkout from appmall.in.',
          ),
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
        displayPrice: IG_DISCOUNT_DISPLAY_PRICE,
        priceBreakdown: IG_DISCOUNT_PRICE_BREAKDOWN,
        validityText: IG_DISCOUNT_VALIDITY_TEXT,
      },
    };
  } catch (err) {
    console.error('[discounted-payments] Token verification failed:', err.message);
    const reason = /expire/i.test(err.message)
      ? 'The payment link has expired. Please get a new one.'
      : /signature/i.test(err.message)
        ? 'Security verification failed.'
        : err.message || 'Unknown verification error.';
    return {
      props: {
        tokenError: makeTokenVerificationError(reason),
        amountPaise: IG_DISCOUNT_AMOUNT_PAISE,
        displayPrice: IG_DISCOUNT_DISPLAY_PRICE,
        priceBreakdown: IG_DISCOUNT_PRICE_BREAKDOWN,
        validityText: IG_DISCOUNT_VALIDITY_TEXT,
      },
    };
  }
}

export default function AppMallDiscountedPaymentsPage({
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
      bgGradient="linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)"
      iconBg="#d1fae5"
      titleColor="#065f46"
      accentGradient="linear-gradient(135deg, #059669 0%, #047857 100%)"
      accentColor="#059669"
      accentDisabled="#6ee7b7"
      validityText={validityText || IG_DISCOUNT_VALIDITY_TEXT}
      validityLabel={IG_DISCOUNT_TAGLINE}
      features={IG_FEATURES}
      limitedTimeNotice={IG_DISCOUNT_LIMITED_TIME_NOTICE}
      originDomain="appmall.in"
      description={IG_DISCOUNT_TAGLINE}
      tokenKind="appmall"
      tokenPayload={tokenPayload || null}
      rawToken={rawToken || null}
      tokenError={tokenError || null}
      fixedCourseLabel="App-Mall IG Discount — All Apps"
      paymentCourse={BUNDLE_COURSE_SLUG}
      displayPrice={displayPrice || IG_DISCOUNT_DISPLAY_PRICE}
      priceBreakdown={priceBreakdown || IG_DISCOUNT_PRICE_BREAKDOWN}
      amountPaise={amountPaise || IG_DISCOUNT_AMOUNT_PAISE}
      paymentRetry={paymentRetry}
    />
  );
}
