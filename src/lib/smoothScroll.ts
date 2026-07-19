import Lenis from 'lenis';

export interface SmoothScroll {
  /** Tear down the rAF loop, lock observer, and Lenis instance. */
  destroy(): void;
  /** Jump instantly to the top (used on content→content navigation). */
  scrollToTop(): void;
}

const NOOP: SmoothScroll = {
  destroy() {},
  scrollToTop() {}
};

/**
 * Momentum smooth-scroll for the vertical content pages, backed by Lenis.
 *
 * Scoped to the `(content)` layout only — the horizontal homepage stage owns its
 * own scroll and must never be wrapped. Lenis drives the native window scroll
 * (no transform wrapper), so the `position: fixed`/`sticky` chrome and the View
 * Transition crossfade keep working untouched.
 *
 * Bails out entirely under `prefers-reduced-motion`, and pauses while the
 * SlidePanel or mobile menu lock the page (`body[data-panel-open]` /
 * `body[data-mobile-menu-open]`).
 *
 * Returns a teardown handle; call `destroy()` from the layout's onMount cleanup.
 */
export function initSmoothScroll(): SmoothScroll {
  if (typeof window === 'undefined') return NOOP;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return NOOP;

  const lenis = new Lenis({
    duration: 1.1,
    // cubic-out: softer, longer tail than expo-out — a more fluid glide.
    easing: (t) => 1 - Math.pow(1 - t, 3),
    smoothWheel: true
    // Touch left native: smoothTouch defaults off so mobile keeps OS momentum.
  });

  let frame = requestAnimationFrame(function raf(time) {
    lenis.raf(time);
    frame = requestAnimationFrame(raf);
  });

  // Pause Lenis whenever the page is locked (panel / mobile menu open) and
  // resume once both release. The body data-attributes are the single source
  // of truth — SlidePanel and Header toggle them independently.
  const syncLock = () => {
    const locked =
      document.body.hasAttribute('data-panel-open') ||
      document.body.hasAttribute('data-mobile-menu-open');
    if (locked) lenis.stop();
    else lenis.start();
  };
  const lockObserver = new MutationObserver(syncLock);
  lockObserver.observe(document.body, {
    attributes: true,
    attributeFilter: ['data-panel-open', 'data-mobile-menu-open']
  });

  return {
    destroy() {
      cancelAnimationFrame(frame);
      lockObserver.disconnect();
      lenis.destroy();
    },
    scrollToTop() {
      lenis.scrollTo(0, { immediate: true, force: true });
    }
  };
}
