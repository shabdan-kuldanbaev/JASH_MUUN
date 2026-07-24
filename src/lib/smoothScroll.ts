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

// Touch fallback: no Lenis, but keep the instant scroll-to-top on navigation
// (SvelteKit's own reset can't be relied on across the persistent content layout).
const NATIVE: SmoothScroll = {
  destroy() {},
  scrollToTop() {
    window.scrollTo(0, 0);
  }
};

/**
 * Momentum smooth-scroll for the vertical pages, backed by Lenis.
 *
 * Drives native window scroll (no transform wrapper), so fixed/sticky chrome and
 * the View Transition crossfade keep working. Bails under `prefers-reduced-motion`
 * and pauses while the SlidePanel or mobile menu lock the page. Returns a teardown
 * handle; call `destroy()` from the layout's onMount cleanup.
 */
export function initSmoothScroll(): SmoothScroll {
  if (typeof window === 'undefined') return NOOP;

  // Skip Lenis on touch devices (phones/tablets). Its per-frame scroll
  // reconciliation fights iOS Safari's native momentum and makes the pinned
  // hero (position: sticky) jitter. Native scroll is smoother and Safari-friendly;
  // we keep only the instant scroll-to-top used on content→content navigation.
  // Tag <html> so the footer's trailing margin-bottom reveal gap stays scrollable
  // (height:auto) — the job Lenis's own `lenis` class used to do here.
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  if (coarse) {
    document.documentElement.classList.add('native-scroll');
    return NATIVE;
  }

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return NOOP;

  const lenis = new Lenis({
    // Frame-based smoothing: each frame moves this fraction toward the target (1 = instant).
    lerp: 0.2,
    // Applies to programmatic scrollTo only (wheel uses lerp above).
    easing: (t) => 1 - Math.pow(1 - t, 3),
    smoothWheel: true
    // smoothTouch defaults off so mobile keeps OS momentum.
  });

  let frame = requestAnimationFrame(function raf(time) {
    lenis.raf(time);
    frame = requestAnimationFrame(raf);
  });

  // Pause Lenis while the page is locked (panel / mobile menu / archive lightbox),
  // resume once all release. Freezing Lenis stops the background scrolling under the
  // lightbox and keeps the header's scroll tracker from re-showing it.
  const syncLock = () => {
    const locked =
      document.body.hasAttribute('data-panel-open') ||
      document.body.hasAttribute('data-mobile-menu-open') ||
      document.body.classList.contains('archive-lightbox-open');
    if (locked) lenis.stop();
    else lenis.start();
  };
  const lockObserver = new MutationObserver(syncLock);
  lockObserver.observe(document.body, {
    attributes: true,
    attributeFilter: ['data-panel-open', 'data-mobile-menu-open', 'class']
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
