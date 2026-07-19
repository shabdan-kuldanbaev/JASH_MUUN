<script lang="ts">
  import type { Snippet } from 'svelte';
  import { onMount } from 'svelte';
  import Lenis from 'lenis';
  import ScrollProgress from '$components/layout/ScrollProgress.svelte';

  let {
    children,
    scrollStep = 500
  }: {
    children: Snippet;
    /** Pixels scrolled per button press or keyboard step. */
    scrollStep?: number;
  } = $props();

  // ── DOM refs ───────────────────────────────────────────────────────────
  let stage: HTMLElement | null = $state(null);
  let track: HTMLElement | null = $state(null);

  // ── Mode ───────────────────────────────────────────────────────────────
  let enabled = $state(false);

  // ── Reactive display state ─────────────────────────────────────────────
  let scrollProgress = $state(0);

  // ── Smooth-scroll engine ───────────────────────────────────────────────
  let lenis: Lenis | null = null;

  // ── Scroll helpers ─────────────────────────────────────────────────────
  function maxScroll(): number {
    return stage ? stage.scrollWidth - stage.clientWidth : 0;
  }

  function clampX(x: number): number {
    return Math.max(0, Math.min(maxScroll(), x));
  }

  /**
   * Scroll to an absolute position.
   * Routed through Lenis when it owns the stage:
   * smooth=true  → Lenis eased glide (buttons, keyboard)
   * smooth=false → instant jump (touch drag)
   */
  function scrollToX(x: number, smooth: boolean): void {
    const target = clampX(x);
    if (lenis) lenis.scrollTo(target, { immediate: !smooth });
    else stage?.scrollTo({ left: target, behavior: smooth ? 'smooth' : 'instant' });
  }

  function scrollBy(delta: number, smooth: boolean): void {
    if (!stage) return;
    scrollToX(stage.scrollLeft + delta, smooth);
  }

  function syncProgress(): void {
    if (!stage) return;
    const max = maxScroll();
    scrollProgress = max > 0 ? stage.scrollLeft / max : 0;
  }

  function checkEnabled(): void {
    const noMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    enabled = window.innerWidth >= 768 && !noMotion;
  }

  // ── Stage lifecycle ────────────────────────────────────────────────────
  $effect(() => {
    if (!enabled || !stage || !track) return;

    const el = stage;
    document.body.style.overflow = 'hidden';

    // Lenis owns wheel scrolling. Horizontal orientation maps a vertical mouse
    // wheel onto horizontal movement (its default `gestureOrientation: 'both'`
    // picks the larger of deltaY/deltaX — the same axis choice as before, now
    // eased). Duration is kept short so the exhibition still lands precisely on
    // a screen instead of drifting. Touch stays native to Lenis (`syncTouch`
    // off) — the manual 1:1 drag below routes through `scrollToX` instead.
    lenis = new Lenis({
      wrapper: el,
      content: track,
      orientation: 'horizontal',
      duration: 0.7,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      syncTouch: false
    });
    const engine = lenis;

    let frame = requestAnimationFrame(function raf(time) {
      engine.raf(time);
      frame = requestAnimationFrame(raf);
    });

    // Touch: free drag, instant, no snap on release. Vertical swipes map onto
    // horizontal movement (mirrors the wheel). Driven through Lenis so the two
    // don't fight over the scroll position.
    let tx0 = 0,
      ty0 = 0,
      sx0 = 0,
      touching = false;
    const onTouchStart = (e: TouchEvent) => {
      if (!e.touches[0]) return;
      tx0 = e.touches[0].clientX;
      ty0 = e.touches[0].clientY;
      sx0 = el.scrollLeft;
      touching = true;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!touching || !e.touches[0]) return;
      const dx = e.touches[0].clientX - tx0;
      const dy = e.touches[0].clientY - ty0;
      scrollToX(sx0 + (Math.abs(dy) >= Math.abs(dx) ? -dy : -dx), false);
      e.preventDefault();
    };
    const onTouchEnd = () => {
      touching = false;
    };

    // Keyboard: eased scroll by scrollStep per keypress.
    const onKeydown = (e: KeyboardEvent) => {
      if (['ArrowRight', 'PageDown', ' '].includes(e.key)) {
        e.preventDefault();
        scrollBy(+scrollStep, true);
      } else if (['ArrowLeft', 'PageUp'].includes(e.key)) {
        e.preventDefault();
        scrollBy(-scrollStep, true);
      } else if (e.key === 'Home') {
        e.preventDefault();
        scrollToX(0, true);
      } else if (e.key === 'End') {
        e.preventDefault();
        scrollToX(maxScroll(), true);
      }
    };

    const onScroll = () => syncProgress();

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('keydown', onKeydown);
    el.addEventListener('scroll', onScroll, { passive: true });

    syncProgress();

    return () => {
      document.body.style.overflow = '';
      cancelAnimationFrame(frame);
      engine.destroy();
      lenis = null;
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('keydown', onKeydown);
      el.removeEventListener('scroll', onScroll);
    };
  });

  // ── Responsive check ───────────────────────────────────────────────────
  onMount(() => {
    checkEnabled();

    const onResize = () => {
      const prev = enabled;
      checkEnabled();
      if (enabled && prev) syncProgress();
    };

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  });
</script>

{#if enabled}
  <!-- Horizontal exhibition stage (desktop / large tablet) -->
  <main class="stage" bind:this={stage} id="stage">
    <div class="stage-track" bind:this={track}>
      {@render children()}
    </div>
  </main>

  <ScrollProgress
    progress={scrollProgress}
    atStart={scrollProgress <= 0}
    atEnd={scrollProgress >= 1}
    onPrev={() => scrollBy(-scrollStep, true)}
    onNext={() => scrollBy(+scrollStep, true)}
  />
{:else}
  <!-- Vertical fallback: mobile, reduced-motion, SSR -->
  <main class="page-vertical">
    {@render children()}
  </main>
{/if}

<style>
  /* ── Horizontal stage ─────────────────────────────────────────────── */
  .stage {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    overflow: auto hidden;
    scroll-behavior: auto; /* Lenis owns the wheel easing */
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .stage::-webkit-scrollbar {
    display: none;
  }

  /* Inline track: the single `content` element Lenis measures for scroll
     width. Panels lay out in one nowrap row; font-size:0 collapses the
     inline gaps between them. */
  .stage-track {
    display: block;
    width: max-content;
    height: 100%;
    white-space: nowrap;
    font-size: 0;
  }

  .stage-track > :global(*) {
    font-size: initial;
  }

  /* ── Vertical fallback ────────────────────────────────────────────── */
  .page-vertical {
    background: var(--paper);
  }
</style>
