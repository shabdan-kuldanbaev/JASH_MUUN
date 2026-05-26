import type { OnNavigate } from '@sveltejs/kit';

/**
 * Route depth: count path segments after the locale prefix.
 * /ru/           → 0
 * /ru/practices  → 1
 * /ru/gallery    → 1
 * /ru/practices/felt-making → 2
 */
function routeDepth(pathname: string): number {
  const segments = pathname.replace(/\/$/, '').split('/').filter(Boolean);
  return Math.max(0, segments.length - 1);
}

/** Sibling order for same-depth content pages */
const SIBLING_ORDER: Record<string, number> = {
  practices: 0,
  gallery: 1
};

function siblingIndex(pathname: string): number {
  const segments = pathname.replace(/\/$/, '').split('/').filter(Boolean);
  const key = segments[1] ?? '';
  return SIBLING_ORDER[key] ?? 0;
}

export type TransitionDirection = 'forward' | 'back';

/**
 * Determine slide direction from navigation event.
 *
 * Priority:
 * 1. Browser back/forward (popstate with delta) — delta < 0 means "back"
 * 2. Route depth comparison — deeper = forward, shallower = back
 * 3. Sibling order — higher order = forward
 * 4. Default: forward
 */
export function getTransitionDirection(navigation: OnNavigate): TransitionDirection {
  if (navigation.type === 'popstate') {
    return navigation.delta < 0 ? 'back' : 'forward';
  }

  const fromPath = navigation.from?.url.pathname ?? '/';
  const toPath = navigation.to?.url.pathname ?? '/';

  const fromDepth = routeDepth(fromPath);
  const toDepth = routeDepth(toPath);

  if (toDepth !== fromDepth) {
    return toDepth > fromDepth ? 'forward' : 'back';
  }

  const fromOrder = siblingIndex(fromPath);
  const toOrder = siblingIndex(toPath);

  if (toOrder !== fromOrder) {
    return toOrder > fromOrder ? 'forward' : 'back';
  }

  return 'forward';
}
