/**
 * Svelte action: reveals an element as it enters the viewport.
 * Cards slide in from right to left with a staggered delay.
 *
 * Usage:
 *   <div use:reveal={index * 80}>...</div>
 */
export function reveal(node: HTMLElement, delay = 0) {
  if (typeof window === 'undefined') return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;

  node.dataset.reveal = 'pending';
  node.style.transitionDelay = delay ? `${delay}ms` : '';

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        node.dataset.reveal = 'done';
        observer.disconnect();
      }
    },
    { threshold: 0.08 }
  );

  observer.observe(node);

  return {
    destroy() {
      observer.disconnect();
    }
  };
}
