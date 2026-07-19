/**
 * Auto-hide header state — Headroom.js-style pin/unpin.
 *
 * The header hides after a deliberate downward scroll and returns on the
 * slightest upward one. Direction detection uses per-direction tolerances
 * (hysteresis) so trackpad jitter never flips the state, and the header is
 * always pinned inside the top offset zone.
 *
 * Scoped to the vertical content pages: the `(content)` layout calls
 * `initHeaderReveal()` in onMount and the returned teardown in cleanup. The
 * horizontal homepage never initializes it, so the header stays static there.
 * Lenis drives the native window scroll, so one passive window listener covers
 * both smooth-scroll and `prefers-reduced-motion` (Lenis disabled) modes.
 */

/** Hide only after this many accumulated px of downward scroll. */
const DOWN_TOLERANCE = 12;
/** Show after this many accumulated px of upward scroll — near-instant. */
const UP_TOLERANCE = 4;
/** Fallback pin zone when --nav-h cannot be read. */
const DEFAULT_OFFSET = 88;

let _hidden = $state(false);

export const headerReveal = {
  get hidden() {
    return _hidden;
  },

  /** Pin the header (navigation, teardown, lock guards). */
  show() {
    _hidden = false;
  }
};

/** Attach the scroll tracker. Returns a teardown that also re-pins the header. */
export function initHeaderReveal(): () => void {
  if (typeof window === 'undefined') return () => {};

  const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'));
  const offset = Number.isFinite(navH) ? navH : DEFAULT_OFFSET;

  let lastY = Math.max(window.scrollY, 0);
  let accumulated = 0;
  let lastDirection: 1 | -1 = 1;
  let ticking = false;

  const update = () => {
    ticking = false;

    // Panel / mobile menu lock the page — never hide underneath them.
    if (
      document.body.hasAttribute('data-panel-open') ||
      document.body.hasAttribute('data-mobile-menu-open')
    ) {
      _hidden = false;
      return;
    }

    // Clamp away iOS rubber-band negatives.
    const y = Math.max(window.scrollY, 0);
    const delta = y - lastY;
    lastY = y;
    if (delta === 0) return;

    // Always pinned inside the top zone.
    if (y <= offset) {
      _hidden = false;
      accumulated = 0;
      return;
    }

    // Hysteresis: the accumulator resets whenever the direction flips.
    const direction: 1 | -1 = delta > 0 ? 1 : -1;
    if (direction !== lastDirection) {
      lastDirection = direction;
      accumulated = 0;
    }
    accumulated += Math.abs(delta);

    if (direction === 1 && accumulated >= DOWN_TOLERANCE) _hidden = true;
    else if (direction === -1 && accumulated >= UP_TOLERANCE) _hidden = false;
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  window.addEventListener('scroll', onScroll, { passive: true });

  return () => {
    window.removeEventListener('scroll', onScroll);
    // Re-pin so the header is never stuck hidden on a surface without the
    // tracker (e.g. navigating content → horizontal homepage).
    _hidden = false;
  };
}
