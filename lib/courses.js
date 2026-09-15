/**
 * appmall membership — one-time fee for all App-Mall apps.
 *
 * From 1 Aug 2026 IST: Rs 500 + 18% GST = Rs 590, 12-Month, 1 + 1 for the price of one.
 * Astro Ask Questions pack is Rs 100 + 18% GST = Rs 118 (separate product).
 */

export const ONE_PLUS_ONE_OFFER_LINE = '1 + 1 for the price of one';

export const APPMALL_MEMBERSHIP_PRICE_EXCL_GST = 500;
export const APPMALL_MEMBERSHIP_PRICE_INCL_GST = 590;

/** Astro Ask Questions pack (10 questions) — not suite membership. */
export const ASTRO_QUESTION_PRICE_EXCL_GST = 100;
export const ASTRO_QUESTION_PRICE_INCL_GST = 118;

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
  'masterclass',
  'masterclass-intro',
  'appmaker',
  'appmaker-reg',
  'appmaker2',
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

/** Default suite membership: Rs 500 + 18% GST = Rs 590 → 59 000 paise */
export const APPMALL_DEFAULT_AMOUNT_PAISE = 59000;

/** Astro Ask Questions: Rs 100 + 18% GST = Rs 118 → 11 800 paise */
export const ASTRO_QUESTION_AMOUNT_PAISE = 11800;

/** AI Masterclass: Rs 5,000 + 18% GST = Rs 5,900 → 590 000 paise */
export const MASTERCLASS_AMOUNT_PAISE = 590000;
export const MASTERCLASS_PRICE_EXCL_GST = 5000;
export const MASTERCLASS_PRICE_INCL_GST = 5900;
export const MASTERCLASS_DISPLAY_PRICE = '₹5,900.00';
export const MASTERCLASS_PRICE_BREAKDOWN =
  'Masterclass base ₹5,000.00 · CGST (9%) ₹450.00 · SGST (9%) ₹450.00 · Total ₹5,900.00';
export const MASTERCLASS_VALIDITY_TEXT = 'One-Day Masterclass + 12-month App Mall Reg User access';

/** Masterclass intro (1 hour): Rs 500 + 18% GST = Rs 590 → 59 000 paise */
export const MASTERCLASS_INTRO_AMOUNT_PAISE = 59000;
export const MASTERCLASS_INTRO_PRICE_EXCL_GST = 500;
export const MASTERCLASS_INTRO_PRICE_INCL_GST = 590;
export const MASTERCLASS_INTRO_DISPLAY_PRICE = '₹590.00';
export const MASTERCLASS_INTRO_PRICE_BREAKDOWN =
  'Intro base ₹500.00 · CGST (9%) ₹45.00 · SGST (9%) ₹45.00 · Total ₹590.00';
export const MASTERCLASS_INTRO_VALIDITY_TEXT =
  '1-hour Masterclass intro + 12-month App Mall Reg User access';

/** App Maker's Manual: Rs 500 + 18% GST = Rs 590 → 59 000 paise */
export const APPMAKER_AMOUNT_PAISE = 59000;
export const APPMAKER_PRICE_EXCL_GST = 500;
export const APPMAKER_PRICE_INCL_GST = 590;
export const APPMAKER_DISPLAY_PRICE = '₹590.00';
export const APPMAKER_PRICE_BREAKDOWN =
  "App Maker's Manual base ₹500.00 · CGST (9%) ₹45.00 · SGST (9%) ₹45.00 · Total ₹590.00";
export const APPMAKER_VALIDITY_TEXT =
  "1-year App Maker's Manual plus Appmall suite (ALL) — online + one download + one query";

/** App Maker add-on for existing Appmall Reg Users: Rs 400 + 18% GST = Rs 472 → 47 200 paise */
export const APPMAKER_REG_COURSE_ID = 'appmaker-reg';
export const APPMAKER_REG_AMOUNT_PAISE = 47200;
export const APPMAKER_REG_PRICE_EXCL_GST = 400;
export const APPMAKER_REG_PRICE_INCL_GST = 472;
export const APPMAKER_REG_DISPLAY_PRICE = '₹472.00';
export const APPMAKER_REG_PRICE_BREAKDOWN =
  "Appmaker Payment For Registered Users base ₹400.00 · CGST (9%) ₹36.00 · SGST (9%) ₹36.00 · Total ₹472.00";
export const APPMAKER_REG_VALIDITY_TEXT =
  "Adds The App Maker's Manual for existing Appmall Reg Users (ALL)";

/** App Maker Premium User: Rs 1000 + 18% GST = Rs 1180 → 118 000 paise */
export const APPMAKER2_AMOUNT_PAISE = 118000;
export const APPMAKER2_PRICE_EXCL_GST = 1000;
export const APPMAKER2_PRICE_INCL_GST = 1180;
export const APPMAKER2_DISPLAY_PRICE = '₹1,180.00';
export const APPMAKER2_PRICE_BREAKDOWN =
  'App Maker Premium tickets base ₹1,000.00 · CGST (9%) ₹90.00 · SGST (9%) ₹90.00 · Total ₹1,180.00';
export const APPMAKER2_VALIDITY_TEXT =
  "Premium User in The App Maker's Manual — 10 extra tickets (not suite membership)";

/** Instagram / YouTube follower discount membership (APPMALL-DISC-99). */
export const IG_DISCOUNT_AMOUNT_PAISE = 11800;
export const IG_DISCOUNT_PRICE_EXCL_GST = 100;
export const IG_DISCOUNT_PRICE_INCL_GST = 118;
export const IG_DISCOUNT_DISPLAY_PRICE = '₹118.00';
export const IG_DISCOUNT_PRICE_BREAKDOWN =
  '(₹100 + 18% GST) — Instagram / YouTube follower membership · 13 months · no 1+1';
export const IG_DISCOUNT_VALIDITY_TEXT = '13 Months';
export const IG_DISCOUNT_TAGLINE =
  'Follower membership (Instagram / YouTube) — Rs 118 (incl. GST) — Validity 13 months — no 1+1';
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
  if (courseSlug === 'masterclass') {
    return MASTERCLASS_AMOUNT_PAISE;
  }
  if (courseSlug === 'masterclass-intro') {
    return MASTERCLASS_INTRO_AMOUNT_PAISE;
  }
  if (courseSlug === 'appmaker') {
    return APPMAKER_AMOUNT_PAISE;
  }
  if (courseSlug === 'appmaker-reg') {
    return APPMAKER_REG_AMOUNT_PAISE;
  }
  if (courseSlug === 'appmaker2') {
    return APPMAKER2_AMOUNT_PAISE;
  }
  if (courseSlug === 'astro-question' || courseSlug === 'janam-kundli') {
    return ASTRO_QUESTION_AMOUNT_PAISE;
  }
  if (amountInrFromQuery != null && amountInrFromQuery !== '') {
    const n = Number(amountInrFromQuery);
    if (Number.isFinite(n) && n > 0) {
      const paise = Math.round(n * 100);
      // Accept live membership, IG discount, Astro pack, or masterclass when explicitly passed.
      if (
        paise === APPMALL_DEFAULT_AMOUNT_PAISE ||
        paise === ASTRO_QUESTION_AMOUNT_PAISE ||
        paise === IG_DISCOUNT_AMOUNT_PAISE ||
        paise === MASTERCLASS_AMOUNT_PAISE ||
        paise === MASTERCLASS_INTRO_AMOUNT_PAISE ||
        paise === APPMAKER_AMOUNT_PAISE ||
        paise === APPMAKER_REG_AMOUNT_PAISE ||
        paise === APPMAKER2_AMOUNT_PAISE
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
      if (Math.abs(n - MASTERCLASS_PRICE_INCL_GST) < 0.02) {
        return MASTERCLASS_AMOUNT_PAISE;
      }
      if (Math.abs(n - MASTERCLASS_INTRO_PRICE_INCL_GST) < 0.02) {
        return MASTERCLASS_INTRO_AMOUNT_PAISE;
      }
      if (Math.abs(n - APPMAKER_PRICE_INCL_GST) < 0.02) {
        return APPMAKER_AMOUNT_PAISE;
      }
      if (Math.abs(n - APPMAKER_REG_PRICE_INCL_GST) < 0.02) {
        return APPMAKER_REG_AMOUNT_PAISE;
      }
      if (Math.abs(n - APPMAKER2_PRICE_INCL_GST) < 0.02) {
        return APPMAKER2_AMOUNT_PAISE;
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

export function isAppmakerManualCourse(courseId) {
  const t = String(courseId || '').trim();
  return t === 'appmaker' || t === APPMAKER_REG_COURSE_ID;
}

export function resolveAppmakerManualPricing(courseId) {
  if (String(courseId || '').trim() === APPMAKER_REG_COURSE_ID) {
    return {
      course: APPMAKER_REG_COURSE_ID,
      amountPaise: APPMAKER_REG_AMOUNT_PAISE,
      displayPrice: APPMAKER_REG_DISPLAY_PRICE,
      priceBreakdown: APPMAKER_REG_PRICE_BREAKDOWN,
      validityText: APPMAKER_REG_VALIDITY_TEXT,
      fixedCourseLabel: 'Appmaker Payment For Registered Users — ₹472 (incl. GST)',
      description: "Appmaker Payment For Registered Users — adds The App Maker's Manual",
      features: [
        'Adds The App Maker’s Manual for existing Appmall Reg Users',
        'Online reader with index and chapter links',
        'Google Translate — read in any language',
        'One download (English PDF or translated HTML)',
        'One admin-answered query (max 100 words, 24–72 hours)',
      ],
    };
  }
  return {
    course: 'appmaker',
    amountPaise: APPMAKER_AMOUNT_PAISE,
    displayPrice: APPMAKER_DISPLAY_PRICE,
    priceBreakdown: APPMAKER_PRICE_BREAKDOWN,
    validityText: APPMAKER_VALIDITY_TEXT,
    fixedCourseLabel: "App Maker's Manual — ALL access ₹590 (incl. GST)",
    description: "The App Maker's Manual — ALL access (book + Appmall suite)",
    features: [
      'ALL access: this book plus the Appmall suite',
      'Online reader with index and chapter links',
      'Google Translate — read in any language',
      'One download (English PDF or translated HTML)',
      'One admin-answered query (max 100 words, 24–72 hours)',
    ],
  };
}
