/**
 * appmall membership — one-time fee for all App-Mall apps.
 * Membership AppMall Validity: 12 + 1 Month, Amount Rs 116.82
 * (Rs 99 + 18% GST). Fee is limited-time and may change at any moment.
 */

export const MEMBERSHIP_TAGLINE =
  'Membership AppMall Validity: 12 + 1 Month, Amount Rs 116.82';

export const MEMBERSHIP_LIMITED_TIME_NOTICE =
  'This Rs 99 membership fee is for a limited time only and can be changed at any moment.';

/** ~12 + 1 calendar months */
export const APPMALL_MEMBERSHIP_VALIDITY_DAYS = 395;

export const CURRENT_BUNDLE = {
  id: 'exam-topper-bundle',
  name: 'App-Mall Membership',
  description:
    'One-time membership for all App-Mall apps — Topper, Entrance Exams, Astro, GovtJobs, POExams, IRJ, Life Manager, and every app on appmall.in',
  price: 99,
  features: [
    'Access to all App-Mall apps',
    'Topper, Entrance Exams, Astro, GovtJobs, POExams, IRJ',
    'Life Manager — tasks, money, calendar',
    'Learn apps and family catalogue included',
    'Validity: 12 + 1 months',
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

// Default amount: Rs 99 + 18% GST = Rs 116.82 → 11 682 paise
export const APPMALL_DEFAULT_AMOUNT_PAISE = 11682;
