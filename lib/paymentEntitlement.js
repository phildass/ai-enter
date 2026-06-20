/** Sources allowed to grant iiskills/uriq entitlements (confirm endpoint). */
export const ENTITLEMENT_SOURCES = new Set(['callback', 'webhook', 'resume']);

export function canGrantEntitlements(source) {
  return ENTITLEMENT_SOURCES.has(source);
}
