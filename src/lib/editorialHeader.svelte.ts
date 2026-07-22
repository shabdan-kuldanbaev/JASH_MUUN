/**
 * Editorial header state — the transparent, contrast-adaptive nav.
 *
 *   onLight      — nav over light content; text flips black, logos drop the white filter.
 *   overContent  — same boundary, surfaced separately for the dropdown scrim variant.
 *   hidden       — header retracted (deliberate downward scroll).
 *
 * Uses per-direction hysteresis (trackpad jitter never flips state) plus panel /
 * mobile-menu guards. The init sets the body class `over-content`; the language
 * dropdown owns `lang-open` in the component.
 */

/** Hide only after this many accumulated px of downward scroll. */
const DOWN_TOLERANCE = 12;
/** Show after this many accumulated px of upward scroll — near-instant. */
const UP_TOLERANCE = 4;
/** Fallback pin/hero offset when a measurement is unavailable. */
const DEFAULT_OFFSET = 88;
/** Never retract the header inside this top band (mirrors headerReveal). */
const HIDE_FLOOR = 240;

let _onLight = $state(false);
let _overContent = $state(false);
let _hidden = $state(false);

export const editorialHeader = {
  get onLight() {
    return _onLight;
  },
  get overContent() {
    return _overContent;
  },
  get hidden() {
    return _hidden;
  },

  /** Pin + reset the header (navigation, teardown). */
  show() {
    _hidden = false;
  }
};

/**
 * Attach the scroll/resize tracker for the editorial header.
 *
 * @param getHeroHeight current dark-hero height in px, or `null` for pages with
 *   no dark hero (nav is `onLight` from the top). A number tracks the live
 *   boundary across resize / mobile URL-bar collapse.
 * @returns teardown that removes listeners, clears the body class, and re-pins the header.
 */
export function initEditorialHeader(getHeroHeight: () => number | null): () => void {
  if (typeof window === 'undefined') return () => {};

  const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'));
  const offset = Number.isFinite(navH) ? navH : DEFAULT_OFFSET;

  let lastY = Math.max(window.scrollY, 0);
  let accumulated = 0;
  let lastDirection: 1 | -1 = 1;
  let ticking = false;

  // No hero → boundary at -∞ (onLight everywhere); a height flips the nav as the hero bottom passes under it.
  const heroBoundary = () => {
    const h = getHeroHeight();
    return h == null ? Number.NEGATIVE_INFINITY : h - offset;
  };

  const applyBodyClasses = () => {
    document.body.classList.toggle('over-content', _overContent);
  };

  const update = () => {
    ticking = false;

    // Never retract under a locked page (panel / mobile menu).
    if (
      document.body.hasAttribute('data-panel-open') ||
      document.body.hasAttribute('data-mobile-menu-open')
    ) {
      _hidden = false;
    }

    // Clamp iOS rubber-band negatives.
    const y = Math.max(window.scrollY, 0);
    const delta = y - lastY;
    lastY = y;

    const onlight = y > heroBoundary();
    _onLight = onlight;
    _overContent = onlight;

    if (delta !== 0) {
      // Always pinned inside the top zone.
      if (y <= offset) {
        _hidden = false;
        accumulated = 0;
      } else {
        // Hysteresis: accumulator resets on direction flip.
        const direction: 1 | -1 = delta > 0 ? 1 : -1;
        if (direction !== lastDirection) {
          lastDirection = direction;
          accumulated = 0;
        }
        accumulated += Math.abs(delta);

        if (direction === 1 && accumulated >= DOWN_TOLERANCE && y > HIDE_FLOOR) {
          _hidden = true;
        } else if (direction === -1 && accumulated >= UP_TOLERANCE) {
          _hidden = false;
        }
      }
    }

    applyBodyClasses();
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();

  return () => {
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
    _hidden = false;
    _onLight = false;
    _overContent = false;
    document.body.classList.remove('over-content');
  };
}
