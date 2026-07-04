/**
 * iiskills offer — single product: Entrance Exams + Topper bundle.
 * No promo phases — this is the permanent product.
 */

export const BUNDLE_COURSE_SLUG = 'exam-topper-bundle';

export const IISKILLS_ACCEPTED_COURSES = [
  'exam-topper-bundle',
  'entrance-exams',
  'topper',
];

/**
 * Resolve any incoming course slug to the canonical bundle ID.
 * Legacy slugs from older tokens are normalised to the current bundle.
 */
export function resolveIiskillsCourseSlug(tokenCourseSlug) {
  if (!tokenCourseSlug) return BUNDLE_COURSE_SLUG;

  if (IISKILLS_ACCEPTED_COURSES.includes(tokenCourseSlug)) {
    return BUNDLE_COURSE_SLUG;
  }

  // Legacy promotional slugs all map to the current bundle
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
