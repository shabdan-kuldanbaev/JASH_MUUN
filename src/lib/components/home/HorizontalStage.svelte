<script lang="ts">
  import type { Snippet } from 'svelte';
  import { onMount } from 'svelte';
  import ScrollProgress from '$components/layout/ScrollProgress.svelte';
  import { m } from '$i18n';

  let {
    children,
    scrollStep = 500
  }: {
    children: Snippet;
    /** Pixels scrolled per button press or keyboard step. */
    scrollStep?: number;
  } = $props();

  // ── DOM ref ────────────────────────────────────────────────────────────
  let stage: HTMLElement | null = $state(null);

  // ── Mode ───────────────────────────────────────────────────────────────
  let enabled = $state(false);

  // ── Reactive display state ─────────────────────────────────────────────
  let scrollProgress = $state(0);
  let showHint = $state(true);

  // ── Scroll helpers ─────────────────────────────────────────────────────
  function maxScroll(): number {
    return stage ? stage.scrollWidth - stage.clientWidth : 0;
  }

  function clampX(x: number): number {
    return Math.max(0, Math.min(maxScroll(), x));
  }

  /**
   * Scroll to an absolute position.
   * smooth=true  → native browser ease-out animation (buttons, keyboard)
   * smooth=false → instant, no animation (wheel, touch drag)
   */
  function scrollToX(x: number, smooth: boolean): void {
    stage?.scrollTo({ left: clampX(x), behavior: smooth ? 'smooth' : 'instant' });
  }

  function scrollBy(delta: number, smooth: boolean): void {
    if (!stage) return;
    scrollToX(stage.scrollLeft + delta, smooth);
  }

  function syncProgress(): void {
    if (!stage) return;
    const max = maxScroll();
    scrollProgress = max > 0 ? stage.scrollLeft / max : 0;
    if (stage.scrollLeft > 40) showHint = false;
  }

  function checkEnabled(): void {
    const noMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    enabled = window.innerWidth >= 768 && !noMotion;
  }

  // ── Stage lifecycle ────────────────────────────────────────────────────
  $effect(() => {
    if (!enabled || !stage) return;

    const el = stage;
    document.body.style.overflow = 'hidden';

    // Wheel: instant so the stage follows the cursor without lag.
    const onWheel = (e: WheelEvent) => {
      const axis = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (axis === 0) return;
      let step = axis;
      if (e.deltaMode === 1) step *= 56;
      else if (e.deltaMode === 2) step *= window.innerWidth;
      scrollBy(step, false);
      e.preventDefault();
    };

    // Touch: free drag, instant, no snap on release.
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

    // Keyboard: smooth scroll by scrollStep per keypress.
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

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('keydown', onKeydown);
    el.addEventListener('scroll', onScroll, { passive: true });

    showHint = true;
    syncProgress();

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('wheel', onWheel);
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
    {@render children()}
  </main>

  <div class="scroll-hint" class:hide={!showHint} aria-hidden="true">
    <span class="line"></span>
    {m.home_scroll_hint()}
  </div>

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
    scroll-behavior: smooth;
    -ms-overflow-style: none;
    scrollbar-width: none;
    white-space: nowrap;
    font-size: 0; /* collapses inline-flex gaps between panels */
  }

  .stage > :global(*) {
    font-size: initial;
  }

  .stage::-webkit-scrollbar {
    display: none;
  }

  /* ── Vertical fallback ────────────────────────────────────────────── */
  .page-vertical {
    background: var(--paper);
  }

  /* ── Scroll hint ──────────────────────────────────────────────────── */
  .scroll-hint {
    position: fixed;
    left: var(--gutter);
    bottom: 32px;
    z-index: 45;
    display: flex;
    align-items: center;
    gap: 14px;
    font-size: 11px;
    letter-spacing: 0.24em;
    text-transform: uppercase;
    color: var(--muted);
    pointer-events: none;
    transition: opacity 0.4s;
  }

  .scroll-hint.hide {
    opacity: 0;
  }

  .line {
    width: 44px;
    height: 1px;
    background: var(--ink);
    opacity: 0.5;
    animation: slide 2.4s ease-in-out infinite;
  }

  @keyframes slide {
    0%,
    100% {
      transform: scaleX(1);
      transform-origin: left;
    }

    50% {
      transform: scaleX(1.6);
      transform-origin: left;
    }
  }
</style>
