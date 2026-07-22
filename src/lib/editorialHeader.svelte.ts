/**
 * Editorial header state — the transparent, contrast-adaptive nav.
 *
 * Mirrors the shape of headerReveal.svelte.ts (a rune module exposing reactive
 * getters + an init that attaches a scroll tracker and returns a teardown), but
 * carries the extra state the editorial header needs:
 *
 *   onLight      — the nav sits over the light content (past the hero, or on a
 *                  page with no dark hero at all). Text flips to black; logos
 *                  drop their white filter.
 *   overContent  — same boundary, surfaced separately so the component/body can
 *                  switch the language-dropdown scrim to its light variant.
 *   hidden       — the header is retracted (deliberate downward scroll).
 *
 * Direction detection reuses headerReveal's per-direction hysteresis so
 * trackpad jitter never flips the state, plus the same panel / mobile-menu
 * guards, rather than the mockup's naive `y > lastY`. The init sets the body
 * class `over-content` (the CSS keys off it). The language dropdown owns the
 * `lang-open` class itself, in the component.
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
 * @param getHeroHeight returns the current dark-hero height in px, or `null`
 *   when the page has no dark hero (index/content pages) — in which case the nav
 *   is `onLight` from the top. A number makes the light/dark boundary track that
 *   live height (the hero is full-viewport, but height changes on resize /
 *   mobile URL-bar collapse).
 * @returns teardown that removes listeners, clears the body class, and re-pins
 *   the header.
 */
export function initEditorialHeader(getHeroHeight: () => number | null): () => void {
  if (typeof window === 'undefined') return () => {};

  const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'));
  const offset = Number.isFinite(navH) ? navH : DEFAULT_OFFSET;

  let lastY = Math.max(window.scrollY, 0);
  let accumulated = 0;
  let lastDirection: 1 | -1 = 1;
  let ticking = false;

  // No hero → boundary at -∞ so the nav is onLight everywhere; a hero height
  // makes the flip happen as its bottom passes under the nav.
  const heroBoundary = () => {
    const h = getHeroHeight();
    return h == null ? Number.NEGATIVE_INFINITY : h - offset;
  };

  const applyBodyClasses = () => {
    document.body.classList.toggle('over-content', _overContent);
  };

  const update = () => {
    ticking = false;

    // Panel / mobile menu lock the page — never retract underneath them.
    if (
      document.body.hasAttribute('data-panel-open') ||
      document.body.hasAttribute('data-mobile-menu-open')
    ) {
      _hidden = false;
    }

    // Clamp away iOS rubber-band negatives.
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
        // Hysteresis: the accumulator resets whenever the direction flips.
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
