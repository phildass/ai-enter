/**
 * appmall offer — single membership product for all App-Mall apps.
 * Checkout ID remains exam-topper-bundle for gateway compatibility.
 */

export const BUNDLE_COURSE_SLUG = 'exam-topper-bundle';

export const APPMALL_ACCEPTED_COURSES = [
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
];

/**
 * Resolve any incoming course slug to the canonical membership checkout ID.
 * Legacy / suite app slugs normalise to the membership bundle.
 * Per-question Astro / Janam Kundli stay as their own products.
 */
export function resolveAppmallCourseSlug(tokenCourseSlug) {
  if (!tokenCourseSlug) return BUNDLE_COURSE_SLUG;

  if (tokenCourseSlug === 'astro-question' || tokenCourseSlug === 'janam-kundli') {
    return tokenCourseSlug;
  }

  if (APPMALL_ACCEPTED_COURSES.includes(tokenCourseSlug)) {
    return BUNDLE_COURSE_SLUG;
  }

  const LEGACY_SLUGS = [
    'all-courses-bundle',
    'launch_5_in_1',
    'LAUNCH_5_IN_1_2026',
    'mega_4_in_1',
    'MEGA_4_IN_1_2026',
    'learn-ai',
    'learn-developer',
    'learn-pr',
    'learn-management',
    'skills-passport',
  ];
  if (LEGACY_SLUGS.includes(tokenCourseSlug)) {
    return BUNDLE_COURSE_SLUG;
  }

  return tokenCourseSlug;
}
