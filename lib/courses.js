/**
 * appmall membership — one-time fee for all App-Mall apps.
 *
 * From 1 Aug 2026 IST: Rs 499 + 18% GST = Rs 588.82, 12-Month, 1 + 1 for the price of one.
 * Astro Ask Questions pack stays Rs 99 + 18% GST = Rs 116.82 (separate product).
 */

export const ONE_PLUS_ONE_OFFER_LINE = '1 + 1 for the price of one';

export const APPMALL_MEMBERSHIP_PRICE_EXCL_GST = 499;
export const APPMALL_MEMBERSHIP_PRICE_INCL_GST = 588.82;

/** Astro Ask Questions pack (10 questions) — not suite membership. */
export const ASTRO_QUESTION_PRICE_EXCL_GST = 99;
export const ASTRO_QUESTION_PRICE_INCL_GST = 116.82;

export const MEMBERSHIP_TAGLINE =
  `${ONE_PLUS_ONE_OFFER_LINE} — Membership AppMall Validity: 12-Month, Amount Rs ${APPMALL_MEMBERSHIP_PRICE_INCL_GST}`;

export const MEMBERSHIP_LIMITED_TIME_NOTICE =
  `${ONE_PLUS_ONE_OFFER_LINE}. 12-Month membership Rs ${APPMALL_MEMBERSHIP_PRICE_EXCL_GST} + 18% GST (Rs ${APPMALL_MEMBERSHIP_PRICE_INCL_GST}). You plus one Add-On User.`;

/** 12 calendar months */
export const APPMALL_MEMBERSHIP_VALIDITY_DAYS = 365;

export const CURRENT_BUNDLE = {
  id: 'exam-topper-bundle',
  name: 'App-Mall Membership',
  description:
    'One-time membership for all App-Mall apps — Topper, Entrance Exams, Astro, GovtJobs, POExams, IRJ, Life Manager, and every app on appmall.in',
  price: APPMALL_MEMBERSHIP_PRICE_EXCL_GST,
  features: [
    'Access to all App-Mall apps',
    'Topper, Entrance Exams, Astro, GovtJobs, POExams, IRJ',
    'Life Manager — tasks, money, calendar',
    'Learn apps and family catalogue included',
    'Validity: 12 months',
    `${ONE_PLUS_ONE_OFFER_LINE} (you + one Add-On User)`,
    'No recurring monthly fees',
  ],
};

export function getCurrentFee() {
  const basePrice = CURRENT_BUNDLE.price;
  const gst = basePrice * 0.18;
  return {
    basePrice: basePrice * 100,
    gst: Math.round(gst * 100),
    total: Math.round((basePrice + gst) * 100),
    displayBase: basePrice,
    displayGst: gst.toFixed(2),
    displayTotal: (basePrice + gst).toFixed(2),
    period: MEMBERSHIP_TAGLINE,
  };
}

export function getCourseById(courseId) {
  if (courseId === CURRENT_BUNDLE.id) return CURRENT_BUNDLE;
  return null;
}

// Course slugs accepted in payment tokens from appmall.
// Includes legacy aliases so existing payment_transactions records still resolve.
export const APPMALL_ALLOWED_COURSES = [
  'exam-topper-bundle',
  'entrance-exams',
  'topper',
  'astro',
  'govtjobs',
  'poexams',
  'irj',
  'lm',
  'astro-question',
  'janam-kundli',
  // Legacy aliases (kept for existing transaction lookups)
  'learn-ai',
  'learn-developer',
  'learn-pr',
  'learn-management',
  'skills-passport',
  'launch_5_in_1',
  'LAUNCH_5_IN_1_2026',
  'mega_4_in_1',
  'MEGA_4_IN_1_2026',
  'all-courses-bundle',
];

/** Default suite membership: Rs 499 + 18% GST = Rs 588.82 → 58 882 paise */
export const APPMALL_DEFAULT_AMOUNT_PAISE = 58882;

/** Astro Ask Questions: Rs 99 + 18% GST = Rs 116.82 → 11 682 paise */
export const ASTRO_QUESTION_AMOUNT_PAISE = 11682;

/** Instagram follower discount membership (APPMALL-DISC-99) — same paise as Astro pack, different product. */
export const IG_DISCOUNT_AMOUNT_PAISE = 11682;
export const IG_DISCOUNT_PRICE_INCL_GST = 116.82;
export const IG_DISCOUNT_DISPLAY_PRICE = '₹116.82';
export const IG_DISCOUNT_PRICE_BREAKDOWN =
  '(₹99 + 18% GST) — Instagram / YouTube follower membership · 13 months · no 1+1';
export const IG_DISCOUNT_VALIDITY_TEXT = '13 Months';
export const IG_DISCOUNT_TAGLINE =
  'Follower membership (Instagram / YouTube) — Rs 116.82 (incl. GST) — Validity 13 months — no 1+1';
export const IG_DISCOUNT_LIMITED_TIME_NOTICE =
  'Follow Instagram @philintheblank100 or YouTube @phildass2739 must be verified within 24 hours of payment or membership is cancelled with no refund. Username must be @xyz. One use per AppMall account.';

export function isIgDiscountPricingTier(value) {
  return value === 'ig_disc_99' || value === 'ig-disc-99';
}

/**
 * Resolve Razorpay amount (paise) for an App-Mall checkout.
 * Prefers an explicit INR amount from the appmall handoff URL when valid.
 * @param {string} courseSlug
 * @param {string|number|undefined|null} amountInrFromQuery
 * @param {{ pricingTier?: string }=} opts
 */
export function resolveAppmallAmountPaise(courseSlug, amountInrFromQuery, opts = {}) {
  if (isIgDiscountPricingTier(opts.pricingTier)) {
    return IG_DISCOUNT_AMOUNT_PAISE;
  }
  if (courseSlug === 'astro-question' || courseSlug === 'janam-kundli') {
    return ASTRO_QUESTION_AMOUNT_PAISE;
  }
  if (amountInrFromQuery != null && amountInrFromQuery !== '') {
    const n = Number(amountInrFromQuery);
    if (Number.isFinite(n) && n > 0) {
      const paise = Math.round(n * 100);
      // Accept live membership, IG discount, or Astro pack when explicitly passed.
      if (
        paise === APPMALL_DEFAULT_AMOUNT_PAISE ||
        paise === ASTRO_QUESTION_AMOUNT_PAISE ||
        paise === IG_DISCOUNT_AMOUNT_PAISE
      ) {
        return paise;
      }
      // Trust appmall handoff when close to membership (avoids float quirks).
      if (Math.abs(n - APPMALL_MEMBERSHIP_PRICE_INCL_GST) < 0.02) {
        return APPMALL_DEFAULT_AMOUNT_PAISE;
      }
      if (Math.abs(n - IG_DISCOUNT_PRICE_INCL_GST) < 0.02) {
        return IG_DISCOUNT_AMOUNT_PAISE;
      }
    }
  }
  return APPMALL_DEFAULT_AMOUNT_PAISE;
}

export function membershipDisplayPrice() {
  return `₹${APPMALL_MEMBERSHIP_PRICE_INCL_GST.toFixed(2)}`;
}

export function membershipPriceBreakdown() {
  return `(₹${APPMALL_MEMBERSHIP_PRICE_EXCL_GST} + 18% GST) — ${ONE_PLUS_ONE_OFFER_LINE}`;
}
