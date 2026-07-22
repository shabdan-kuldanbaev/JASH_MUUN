/**
 * Editorial reveal actions — scroll-triggered entrance animations for the
 * editorial homepage. Two Svelte actions, one shared IntersectionObserver:
 *
 *   use:rise  — masked "rise from below". The element must carry `data-rise`
 *               and wrap its content in a `.rise-inner` span IN MARKUP (Svelte
 *               owns the DOM — the action never mutates children). The CSS in
 *               app.css does the masking; the action only toggles `.is-in`.
 *   use:rv    — directional slide/scale. Pass the direction as the argument
 *               (`up` | `left` | `right` | `zoom`); the action sets the matching
 *               `data-rv` attribute and toggles `.is-in`. CSS lives in app.css.
 *
 * Coexists with $lib/actions/reveal.ts (that one is unchanged and drives the
 * content-page card reveals). Both early-return under prefers-reduced-motion,
 * so the reduced-motion CSS block simply pins everything to its rest state.
 *
 * One observer is shared across every element that uses either action, so a
 * page full of reveals costs a single observer, not one per node.
 */

type RvDirection = 'up' | 'left' | 'right' | 'zoom';

let observer: IntersectionObserver | null = null;

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function getObserver(): IntersectionObserver {
  if (observer) return observer;
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          observer?.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
  );
  return observer;
}

/**
 * Masked rise reveal. The element must already carry `data-rise` and contain a
 * `.rise-inner` wrapper in its markup — this action only observes it and adds
 * `.is-in` on entry.
 */
export function rise(node: HTMLElement) {
  if (typeof window === 'undefined') return;

  if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
    node.classList.add('is-in');
    return;
  }

  const io = getObserver();
  io.observe(node);

  return {
    destroy() {
      io.unobserve(node);
    }
  };
}

/**
 * Directional reveal. `direction` sets the `data-rv` attribute (defaults to
 * `up`); the shared observer adds `.is-in` when the element enters the viewport.
 */
export function rv(node: HTMLElement, direction: RvDirection = 'up') {
  if (typeof window === 'undefined') return;

  node.setAttribute('data-rv', direction);

  if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
    node.classList.add('is-in');
    return;
  }

  const io = getObserver();
  io.observe(node);

  return {
    destroy() {
      io.unobserve(node);
    }
  };
}
