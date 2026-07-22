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
 * Momentum smooth-scroll for the vertical pages, backed by Lenis.
 *
 * Drives native window scroll (no transform wrapper), so fixed/sticky chrome and
 * the View Transition crossfade keep working. Bails under `prefers-reduced-motion`
 * and pauses while the SlidePanel or mobile menu lock the page. Returns a teardown
 * handle; call `destroy()` from the layout's onMount cleanup.
 */
export function initSmoothScroll(): SmoothScroll {
  if (typeof window === 'undefined') return NOOP;

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

  // Pause Lenis while the page is locked (panel / mobile menu), resume once both release.
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
