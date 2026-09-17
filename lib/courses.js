/**
 * appmall membership — one-time fee for all App-Mall apps.
 *
 * Through 30 Sep 2026 midnight IST: festival Rs 116 (incl. GST) — suite + Manual + App Builder.
 * From 1 Oct 2026 IST: Rs 500 + 18% GST = Rs 590 — suite and access to every app.
 * International buyers (separate SKU): Rs 200 (INR default) or USD 3 — /payments/foriegn.
 * Astro Ask Questions pack is Rs 100 + 18% GST = Rs 118 (separate product).
 */

export const ONE_PLUS_ONE_OFFER_LINE = '1 + 1 for the price of one';

/** Festival offer ends 30 Sep 2026 23:59:59 IST. */
export const FESTIVAL_MEMBERSHIP_OFFER_ENDS_AT = new Date('2026-09-30T18:29:59.999Z');
export const FESTIVAL_MEMBERSHIP_PRICE_EXCL_GST = 98;
export const FESTIVAL_MEMBERSHIP_PRICE_INCL_GST = 116;
export const FESTIVAL_MEMBERSHIP_AMOUNT_PAISE = 11600;

/**
 * International buyers — distinct from festival 11600 / standard 59000.
 * INR 20000 paise or USD 300 cents. USD 3 is a round equivalent of ~Rs 200 (no live FX).
 * Gateway path spelling is intentional: /payments/foriegn
 */
export const INTERNATIONAL_COURSE_ID = 'international-course';
export const INTERNATIONAL_PAYMENT_PATH = '/payments/foriegn';
export const INTERNATIONAL_PRICE_INR = 200;
export const INTERNATIONAL_AMOUNT_PAISE = 20000;
export const INTERNATIONAL_PRICE_USD = 3;
export const INTERNATIONAL_AMOUNT_CENTS = 300;
export const INTERNATIONAL_OFFER = 'international';

export const APPMALL_MEMBERSHIP_PRICE_EXCL_GST = 500;
export const APPMALL_MEMBERSHIP_PRICE_INCL_GST = 590;

/** Astro Ask Questions pack (10 questions) — not suite membership. */
export const ASTRO_QUESTION_PRICE_EXCL_GST = 100;
export const ASTRO_QUESTION_PRICE_INCL_GST = 118;

export function isFestivalMembershipOfferActive(now = new Date()) {
  return now.getTime() <= FESTIVAL_MEMBERSHIP_OFFER_ENDS_AT.getTime();
}

export function getMembershipTagline(now = new Date()) {
  if (isFestivalMembershipOfferActive(now)) {
    return `Special festival offer till 30 September 2026: Rs ${FESTIVAL_MEMBERSHIP_PRICE_INCL_GST} (incl. GST) — suite, Manual, App Builder`;
  }
  return `Membership / Registration: Rs ${APPMALL_MEMBERSHIP_PRICE_EXCL_GST} + 18% GST (Rs ${APPMALL_MEMBERSHIP_PRICE_INCL_GST}) — 12-Month — suite and access to every app`;
}

export function getMembershipLimitedTimeNotice(now = new Date()) {
  if (isFestivalMembershipOfferActive(now)) {
    return `Special festival offer till 30 September 2026: Rs ${FESTIVAL_MEMBERSHIP_PRICE_INCL_GST} (incl. GST) for the AppMall suite, The App Maker’s Manual download, and App Builder. From 1 October: Rs ${APPMALL_MEMBERSHIP_PRICE_EXCL_GST} + 18% GST (Rs ${APPMALL_MEMBERSHIP_PRICE_INCL_GST}) for the suite and access to every app.`;
  }
  return `12-Month membership Rs ${APPMALL_MEMBERSHIP_PRICE_EXCL_GST} + 18% GST (Rs ${APPMALL_MEMBERSHIP_PRICE_INCL_GST}). Suite and access to every app, including The App Maker’s Manual download and App Builder.`;
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
  price: APPMALL_MEMBERSHIP_PRICE_EXCL_GST,
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
  if (isFestivalMembershipOfferActive(now)) {
    return {
      basePrice: FESTIVAL_MEMBERSHIP_AMOUNT_PAISE,
      gst: 0,
      total: FESTIVAL_MEMBERSHIP_AMOUNT_PAISE,
      displayBase: FESTIVAL_MEMBERSHIP_PRICE_INCL_GST,
      displayGst: 'incl.',
      displayTotal: FESTIVAL_MEMBERSHIP_PRICE_INCL_GST.toFixed(2),
      period: getMembershipTagline(now),
    };
  }
  const basePrice = CURRENT_BUNDLE.price;
  const gst = basePrice * 0.18;
  return {
    basePrice: basePrice * 100,
    gst: Math.round(gst * 100),
    total: Math.round((basePrice + gst) * 100),
    displayBase: basePrice,
    displayGst: gst.toFixed(2),
    displayTotal: (basePrice + gst).toFixed(2),
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

/** Post-festival suite membership: Rs 500 + 18% GST = Rs 590 → 59 000 paise */
export const APPMALL_STANDARD_AMOUNT_PAISE = 59000;
/** @deprecated Prefer getAppmallDefaultAmountPaise() — 59000 is the 1 Oct rate, not the festival rate. */
export const APPMALL_DEFAULT_AMOUNT_PAISE = APPMALL_STANDARD_AMOUNT_PAISE;

export function getAppmallDefaultAmountPaise(now = new Date()) {
  return isFestivalMembershipOfferActive(now)
    ? FESTIVAL_MEMBERSHIP_AMOUNT_PAISE
    : APPMALL_STANDARD_AMOUNT_PAISE;
}

export function isAllowedAppmallAmountPaise(paise) {
  const n = Number(paise);
  return (
    n === FESTIVAL_MEMBERSHIP_AMOUNT_PAISE ||
    n === APPMALL_STANDARD_AMOUNT_PAISE ||
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

export function normalizeInternationalCurrency(raw) {
  return String(raw || '').trim().toUpperCase() === 'USD' ? 'USD' : 'INR';
}

/**
 * Allowlist for /payments/foriegn only — INR 20000 paise or USD 300 cents.
 * Never falls back to festival 11600 or standard 59000.
 */
export function isAllowedInternationalCharge(amountMinor, currency) {
  const n = Number(amountMinor);
  const cur = normalizeInternationalCurrency(currency);
  if (cur === 'USD') return n === INTERNATIONAL_AMOUNT_CENTS;
  return n === INTERNATIONAL_AMOUNT_PAISE;
}

export function resolveInternationalCharge(payload = {}, query = {}) {
  const currency = normalizeInternationalCurrency(payload.currency || query.currency);
  const signedMinor =
    currency === 'USD'
      ? Number(payload.amount_cents || payload.amountPaise || payload.amount_paise || 0)
      : Number(payload.amount_paise || payload.amountPaise || 0);
  if (isAllowedInternationalCharge(signedMinor, currency)) {
    return { currency, amountMinor: signedMinor };
  }
  const queryMajor = query.amount != null && query.amount !== '' ? Number(query.amount) : NaN;
  if (Number.isFinite(queryMajor)) {
    const fromQuery =
      currency === 'USD' ? Math.round(queryMajor * 100) : Math.round(queryMajor * 100);
    if (isAllowedInternationalCharge(fromQuery, currency)) {
      return { currency, amountMinor: fromQuery };
    }
  }
  // Default INR 200 — never Rs 590 / 116.
  return { currency: 'INR', amountMinor: INTERNATIONAL_AMOUNT_PAISE };
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
  if (opts.offer === 'festival' || isFestivalMembershipOfferActive()) {
    if (amountInrFromQuery == null || amountInrFromQuery === '') {
      return FESTIVAL_MEMBERSHIP_AMOUNT_PAISE;
    }
  }
  if (amountInrFromQuery != null && amountInrFromQuery !== '') {
    const n = Number(amountInrFromQuery);
    if (Number.isFinite(n) && n > 0) {
      const paise = Math.round(n * 100);
      if (isAllowedAppmallAmountPaise(paise)) {
        return paise;
      }
      if (Math.abs(n - FESTIVAL_MEMBERSHIP_PRICE_INCL_GST) < 0.02) {
        return FESTIVAL_MEMBERSHIP_AMOUNT_PAISE;
      }
      if (Math.abs(n - APPMALL_MEMBERSHIP_PRICE_INCL_GST) < 0.02) {
        return APPMALL_STANDARD_AMOUNT_PAISE;
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

export function membershipDisplayPrice(now = new Date()) {
  const amount = isFestivalMembershipOfferActive(now)
    ? FESTIVAL_MEMBERSHIP_PRICE_INCL_GST
    : APPMALL_MEMBERSHIP_PRICE_INCL_GST;
  return `₹${amount.toFixed(2)}`;
}

export function membershipPriceBreakdown(now = new Date()) {
  if (isFestivalMembershipOfferActive(now)) {
    return `Special festival offer till 30 September 2026 — Rs ${FESTIVAL_MEMBERSHIP_PRICE_INCL_GST} (incl. GST) — suite, Manual, App Builder`;
  }
  return `(₹${APPMALL_MEMBERSHIP_PRICE_EXCL_GST} + 18% GST) — suite and access to every app`;
}

export function displayPriceForAmountPaise(amountPaise, now = new Date()) {
  const n = Number(amountPaise);
  if (n === FESTIVAL_MEMBERSHIP_AMOUNT_PAISE) {
    return `₹${FESTIVAL_MEMBERSHIP_PRICE_INCL_GST.toFixed(2)}`;
  }
  if (n === APPMALL_STANDARD_AMOUNT_PAISE) {
    return `₹${APPMALL_MEMBERSHIP_PRICE_INCL_GST.toFixed(2)}`;
  }
  if (n === ASTRO_QUESTION_AMOUNT_PAISE) {
    return `₹${ASTRO_QUESTION_PRICE_INCL_GST.toFixed(2)}`;
  }
  return membershipDisplayPrice(now);
}

export function priceBreakdownForAmountPaise(amountPaise, now = new Date()) {
  const n = Number(amountPaise);
  if (n === FESTIVAL_MEMBERSHIP_AMOUNT_PAISE) {
    return `Special festival offer till 30 September 2026 — Rs ${FESTIVAL_MEMBERSHIP_PRICE_INCL_GST} (incl. GST) — suite, Manual, App Builder`;
  }
  if (n === APPMALL_STANDARD_AMOUNT_PAISE) {
    return `(₹${APPMALL_MEMBERSHIP_PRICE_EXCL_GST} + 18% GST) — suite and access to every app`;
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
