/**
 * iiskills course config — single bundle product: Entrance Exams + Topper.
 * Rs 99 + 18% GST = Rs 116.82 (11 682 paise).
 */

export const CURRENT_BUNDLE = {
  id: 'exam-topper-bundle',
  name: 'Entrance Exams + Topper',
  description: 'Complete exam preparation — Entrance Exams and Topper apps bundled together',
  price: 99,
  features: [
    'Full Entrance Exams app access',
    'Full Topper app access',
    'Exam-oriented content and analytics',
    '1-year validity',
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
    period: 'Entrance Exams + Topper Bundle',
  };
}

export function getCourseById(courseId) {
  if (courseId === CURRENT_BUNDLE.id) return CURRENT_BUNDLE;
  return null;
}

// Course slugs accepted in payment tokens from iiskills.
// Includes legacy aliases so existing payment_transactions records still resolve.
export const IISKILLS_ALLOWED_COURSES = [
  'exam-topper-bundle',
  'entrance-exams',
  'topper',
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
export const IISKILLS_DEFAULT_AMOUNT_PAISE = 11682;
