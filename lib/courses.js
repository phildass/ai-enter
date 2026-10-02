/**
 * appmall membership — one-time fee for all App-Mall apps.
 *
 * Live (owner 2026-10-02): Rs 100 + 18% GST + 2.5% other = Rs 120.50 (12050 paise) for a limited period —
 * suite + Manual + App Builder. Festival branding and Rs 590 / Rs 612.50 retired from live checkout.
 * Historical allowlist still accepts 11600 / 59000 / 61250 for prior paid orders.
 * International buyers (separate SKU): USD 5 all-inclusive — /payments/foriegn.
 * Astro Ask Questions pack is Rs 100 + 18% GST = Rs 118 (separate product).
 *
 * Note: /payments/glocalwire is a different product (press release / Media Jobs) —
 * do not use AppMall suite amounts there.
 */

export const ONE_PLUS_ONE_OFFER_LINE = '1 + 1 for the price of one';

/** @deprecated Festival calendar retired — kept for historical comment/tests only. */
export const FESTIVAL_MEMBERSHIP_OFFER_ENDS_AT = new Date('2026-09-30T18:29:59.999Z');

/** Live limited-period domestic suite price. */
export const MEMBERSHIP_PRICE_EXCL_GST = 100;
export const MEMBERSHIP_PRICE_INCL_GST = 120.5;
export const MEMBERSHIP_AMOUNT_PAISE = 12050;
export const MEMBERSHIP_PRICE_LABEL = MEMBERSHIP_PRICE_INCL_GST.toFixed(2);

/** @deprecated Prefer MEMBERSHIP_* — same live amount. */
export const FESTIVAL_MEMBERSHIP_PRICE_EXCL_GST = MEMBERSHIP_PRICE_EXCL_GST;
/** @deprecated Prefer MEMBERSHIP_PRICE_INCL_GST */
export const FESTIVAL_MEMBERSHIP_PRICE_INCL_GST = MEMBERSHIP_PRICE_INCL_GST;
/** @deprecated Prefer MEMBERSHIP_AMOUNT_PAISE */
export const FESTIVAL_MEMBERSHIP_AMOUNT_PAISE = MEMBERSHIP_AMOUNT_PAISE;

/**
 * International buyers — distinct from domestic Rs 120.50.
 * USD 5 all-inclusive (500 cents) only. No INR on this path.
 * Gateway path spelling is intentional: /payments/foriegn
 */
export const INTERNATIONAL_COURSE_ID = 'international-course';
export const INTERNATIONAL_PAYMENT_PATH = '/payments/foriegn';
export const INTERNATIONAL_PRICE_USD = 5;
export const INTERNATIONAL_AMOUNT_CENTS = 500;
export const INTERNATIONAL_OFFER = 'international';

/** @deprecated Live suite is MEMBERSHIP_* (12050). Kept for historical order allowlist only. */
export const APPMALL_MEMBERSHIP_PRICE_EXCL_GST = 500;
/** @deprecated Historical Rs 590 display — not live. */
export const APPMALL_MEMBERSHIP_PRICE_INCL_GST = 590;

export function isFestivalMembershipOfferActive(_now = new Date()) {
  // Festival branding retired; limited Rs 120.50 is always the live domestic suite price.
  return true;
}

export function getMembershipTagline(_now = new Date()) {
  return `Rs ${MEMBERSHIP_PRICE_LABEL} (incl. GST) for a limited period — suite, Manual, App Builder`;
}

export function getMembershipLimitedTimeNotice(_now = new Date()) {
  return `Rs ${MEMBERSHIP_PRICE_LABEL} (incl. GST) for a limited period for the AppMall suite, The App Maker’s Manual download, and App Builder.`;
}

/** @deprecated Prefer getMembershipTagline() so the 1 Oct switch is live. */
export const MEMBERSHIP_TAGLINE = getMembershipTagline();

/** @deprecated Prefer getMembershipLimitedTimeNotice(). */
export const MEMBERSHIP_LIMITED_TIME_NOTICE = getMembershipLimitedTimeNotice();

/** 12 calendar months */
export const APPMALL_MEMBERSHIP_VALIDITY_DAYS = 365;

export const CURRENT_BUNDLE = {
  id: 'exam-topper-bundle',
  name: 'App-Mall Membership',
  description:
    'One-time membership for all App-Mall apps — Topper, Entrance Exams, Astro, GovtJobs, POExams, IRJ, Life Manager, and every app on appmall.in',
  price: MEMBERSHIP_PRICE_EXCL_GST,
  features: [
    'Access to all App-Mall apps',
    'The App Maker’s Manual download and App Builder included',
    'Topper, Entrance Exams, Astro, GovtJobs, POExams, IRJ',
    'Life Manager — tasks, money, calendar',
    'Learn apps and family catalogue included',
    'Validity: 12 months',
    'No recurring monthly fees',
  ],
};

export function getCurrentFee(now = new Date()) {
  return {
    basePrice: MEMBERSHIP_AMOUNT_PAISE,
    gst: 0,
    total: MEMBERSHIP_AMOUNT_PAISE,
    displayBase: MEMBERSHIP_PRICE_INCL_GST,
    displayGst: 'incl.',
    displayTotal: MEMBERSHIP_PRICE_LABEL,
    period: getMembershipTagline(now),
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
  'international-course',
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

/** Historical suite amounts (retired from live checkout; still accepted on verify). */
export const APPMALL_HISTORICAL_FESTIVAL_AMOUNT_PAISE = 11600;
export const APPMALL_HISTORICAL_STANDARD_AMOUNT_PAISE = 59000;
export const APPMALL_HISTORICAL_61250_AMOUNT_PAISE = 61250;
/** @deprecated Prefer MEMBERSHIP_AMOUNT_PAISE */
export const APPMALL_STANDARD_AMOUNT_PAISE = APPMALL_HISTORICAL_STANDARD_AMOUNT_PAISE;
/** @deprecated Prefer getAppmallDefaultAmountPaise() */
export const APPMALL_DEFAULT_AMOUNT_PAISE = MEMBERSHIP_AMOUNT_PAISE;

export function getAppmallDefaultAmountPaise(_now = new Date()) {
  return MEMBERSHIP_AMOUNT_PAISE;
}

export function isAllowedAppmallAmountPaise(paise) {
  const n = Number(paise);
  return (
    n === MEMBERSHIP_AMOUNT_PAISE ||
    n === APPMALL_HISTORICAL_FESTIVAL_AMOUNT_PAISE ||
    n === APPMALL_HISTORICAL_STANDARD_AMOUNT_PAISE ||
    n === APPMALL_HISTORICAL_61250_AMOUNT_PAISE ||
    n === ASTRO_QUESTION_AMOUNT_PAISE ||
    n === MASTERCLASS_AMOUNT_PAISE ||
    n === MASTERCLASS_INTRO_AMOUNT_PAISE ||
    n === APPMAKER_AMOUNT_PAISE ||
    n === APPMAKER_REG_AMOUNT_PAISE ||
    n === APPMAKER2_AMOUNT_PAISE
  );
}

export function isInternationalPaymentCourse(courseId) {
  const t = String(courseId || '').trim().toLowerCase();
  return t === INTERNATIONAL_COURSE_ID || t === 'international' || t === 'foriegn' || t === 'foreign';
}

export function normalizeInternationalCurrency(_raw) {
  return 'USD';
}

/**
 * Allowlist for /payments/foriegn only — USD 500 cents.
 * Never falls back to domestic suite paise (12050 / historical) or INR 20000.
 */
export function isAllowedInternationalCharge(amountMinor, currency) {
  const n = Number(amountMinor);
  const cur = String(currency || 'USD').trim().toUpperCase();
  return cur === 'USD' && n === INTERNATIONAL_AMOUNT_CENTS;
}

export function resolveInternationalCharge(payload = {}, query = {}) {
  const signedMinor = Number(
    payload.amount_cents || payload.amount_paise || payload.amountPaise || 0,
  );
  if (isAllowedInternationalCharge(signedMinor, 'USD')) {
    return { currency: 'USD', amountMinor: signedMinor };
  }
  const queryMajor = query.amount != null && query.amount !== '' ? Number(query.amount) : NaN;
  if (Number.isFinite(queryMajor) && Math.round(queryMajor * 100) === INTERNATIONAL_AMOUNT_CENTS) {
    return { currency: 'USD', amountMinor: INTERNATIONAL_AMOUNT_CENTS };
  }
  return { currency: 'USD', amountMinor: INTERNATIONAL_AMOUNT_CENTS };
}

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
 * Prefers an explicit INR amount from the appmall handoff URL / signed token when valid.
 * @param {string} courseSlug
 * @param {string|number|undefined|null} amountInrFromQuery
 * @param {{ pricingTier?: string, offer?: string, amountPaise?: number }=} opts
 */
export function resolveAppmallAmountPaise(courseSlug, amountInrFromQuery, opts = {}) {
  const signedPaise = Number(opts.amountPaise || 0);
  if (isAllowedAppmallAmountPaise(signedPaise)) {
    return signedPaise;
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
  if (
    opts.offer === 'limited' ||
    opts.offer === 'festival' ||
    opts.offer === 'suite' ||
    isFestivalMembershipOfferActive()
  ) {
    if (amountInrFromQuery == null || amountInrFromQuery === '') {
      return MEMBERSHIP_AMOUNT_PAISE;
    }
  }
  if (amountInrFromQuery != null && amountInrFromQuery !== '') {
    const n = Number(amountInrFromQuery);
    if (Number.isFinite(n) && n > 0) {
      const paise = Math.round(n * 100);
      if (isAllowedAppmallAmountPaise(paise)) {
        return paise;
      }
      if (Math.abs(n - MEMBERSHIP_PRICE_INCL_GST) < 0.02) {
        return MEMBERSHIP_AMOUNT_PAISE;
      }
      if (Math.abs(n - APPMALL_MEMBERSHIP_PRICE_INCL_GST) < 0.02) {
        return APPMALL_HISTORICAL_STANDARD_AMOUNT_PAISE;
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
  return getAppmallDefaultAmountPaise();
}

export function membershipDisplayPrice(_now = new Date()) {
  return `₹${MEMBERSHIP_PRICE_LABEL}`;
}

export function membershipPriceBreakdown(_now = new Date()) {
  return `Rs ${MEMBERSHIP_PRICE_LABEL} (incl. GST) for a limited period — suite, Manual, App Builder`;
}

export function displayPriceForAmountPaise(amountPaise, now = new Date()) {
  const n = Number(amountPaise);
  if (n === MEMBERSHIP_AMOUNT_PAISE || n === APPMALL_HISTORICAL_FESTIVAL_AMOUNT_PAISE) {
    return `₹${MEMBERSHIP_PRICE_LABEL}`;
  }
  if (n === APPMALL_HISTORICAL_STANDARD_AMOUNT_PAISE || n === APPMALL_HISTORICAL_61250_AMOUNT_PAISE) {
    return `₹${(n / 100).toFixed(2)}`;
  }
  if (n === ASTRO_QUESTION_AMOUNT_PAISE) {
    return `₹${ASTRO_QUESTION_PRICE_INCL_GST.toFixed(2)}`;
  }
  return membershipDisplayPrice(now);
}

export function priceBreakdownForAmountPaise(amountPaise, now = new Date()) {
  const n = Number(amountPaise);
  if (n === MEMBERSHIP_AMOUNT_PAISE || n === APPMALL_HISTORICAL_FESTIVAL_AMOUNT_PAISE) {
    return `Rs ${MEMBERSHIP_PRICE_LABEL} (incl. GST) for a limited period — suite, Manual, App Builder`;
  }
  if (n === APPMALL_HISTORICAL_STANDARD_AMOUNT_PAISE || n === APPMALL_HISTORICAL_61250_AMOUNT_PAISE) {
    return `Historical suite membership ₹${(n / 100).toFixed(2)}`;
  }
  return membershipPriceBreakdown(now);
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
