/** 5-for-1 bundle offer ends at the start of July 1, 2026 UTC (through June 30). */
export const BUNDLE_OFFER_CUTOFF = new Date('2026-07-01T00:00:00Z');

export const BUNDLE_COURSE_SLUG = 'all-courses-bundle';

export const IISKILLS_INDIVIDUAL_COURSES = [
  'learn-ai',
  'learn-developer',
  'learn-pr',
  'learn-management',
];

export function isIiskillsBundleOfferActive(now = new Date()) {
  return now < BUNDLE_OFFER_CUTOFF;
}

export function resolveIiskillsCourseSlug(tokenCourseSlug, now = new Date()) {
  if (isIiskillsBundleOfferActive(now)) {
    return BUNDLE_COURSE_SLUG;
  }
  return tokenCourseSlug;
}
