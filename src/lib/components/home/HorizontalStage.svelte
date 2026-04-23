<script lang="ts">
  import type { Snippet } from 'svelte';
  import { onMount } from 'svelte';
  import ScrollProgress from '$components/layout/ScrollProgress.svelte';
  import { m } from '$i18n';

  let { children }: { children: Snippet } = $props();

  // ── DOM ref ────────────────────────────────────────────────────────────
  // $state so $effect reacts when the element mounts after `enabled` flips.
  let stage: HTMLElement | null = $state(null);

  // ── Mode ───────────────────────────────────────────────────────────────
  // false during SSR, on mobile (< 768px), and with prefers-reduced-motion.
  let enabled = $state(false);

  // ── Internal scroll state (imperative, not reactive) ───────────────────
  const EASE = 0.3;
  const SCREEN_SELECTOR = '[data-scroll-screen]';

  let screens: Element[] = [];
  let screenOffsets: number[] = [];
  let targetX = 0;
  let currentX = 0;
  let rafId: number | null = null;
  let internalScrollUntil = 0;

  // ── Reactive display state ─────────────────────────────────────────────
  let scrollProgress = $state(0);
  let currentScreen = $state(1);
  let totalScreens = $state(0);
  let showHint = $state(true);

  // ── Scroll math ────────────────────────────────────────────────────────
  function maxScroll(): number {
    return stage ? stage.scrollWidth - stage.clientWidth : 0;
  }

  function clampX(x: number): number {
    return Math.max(0, Math.min(maxScroll(), x));
  }

  function measureScreens(): void {
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    screens = [...stage.querySelectorAll(SCREEN_SELECTOR)];
    screenOffsets = screens.map(s => {
      const x = s.getBoundingClientRect().left - rect.left + stage!.scrollLeft;
      return clampX(x);
    });
    if (!screenOffsets.length) screenOffsets = [0];
    totalScreens = screenOffsets.length;
  }

  function nearestIndex(x: number): number {
    let idx = 0, min = Infinity;
    for (let i = 0; i < screenOffsets.length; i++) {
      const d = Math.abs(screenOffsets[i] - x);
      if (d < min) { min = d; idx = i; }
    }
    return idx;
  }

  function writeScroll(x: number): void {
    if (!stage) return;
    internalScrollUntil = performance.now() + 80;
    stage.scrollLeft = x;
  }

  function tick(): void {
    const dx = targetX - currentX;
    if (Math.abs(dx) < 0.4) {
      currentX = targetX;
      writeScroll(currentX);
      rafId = null;
      syncProgress();
      return;
    }
    currentX += dx * EASE;
    writeScroll(currentX);
    syncProgress();
    rafId = requestAnimationFrame(tick);
  }

  function scheduleRaf(): void {
    if (rafId == null) rafId = requestAnimationFrame(tick);
  }

  function setTarget(x: number): void {
    targetX = clampX(x);
    scheduleRaf();
  }

  function goTo(index: number): void {
    const i = Math.max(0, Math.min(screenOffsets.length - 1, index));
    setTarget(screenOffsets[i] ?? 0);
  }

  function activeIndex(): number {
    if (!stage) return 0;
    return nearestIndex(stage.scrollLeft + stage.clientWidth * 0.35);
  }

  function snapToNearest(): void {
    if (!stage) return;
    goTo(nearestIndex(stage.scrollLeft));
  }

  function syncProgress(): void {
    if (!stage) return;
    const max = maxScroll();
    scrollProgress = max > 0 ? stage.scrollLeft / max : 0;
    currentScreen = activeIndex() + 1;
    if (stage.scrollLeft > 40) showHint = false;
  }

  function checkEnabled(): void {
    const noMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    enabled = window.innerWidth >= 768 && !noMotion;
  }

  // ── Stage lifecycle ────────────────────────────────────────────────────
  // Runs when both `enabled` and `stage` are present.
  // Svelte 5 $effect: cleanup fires automatically before re-run or on destroy,
  // so switching from desktop → mobile tears everything down without extra code.
  $effect(() => {
    if (!enabled || !stage) return;

    // Capture a stable reference. `stage` ($state) may become null
    // when {#if enabled} removes the element during cleanup.
    const el = stage;

    document.body.style.overflow = 'hidden';

    // Wheel: translate vertical (and horizontal) delta to horizontal stage scroll.
    const onWheel = (e: WheelEvent) => {
      const axis = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (axis === 0) return;
      let step = axis;
      if (e.deltaMode === 1) step *= 56;
      else if (e.deltaMode === 2) step *= window.innerWidth;
      else step *= 1.6;
      setTarget(targetX + step);
      e.preventDefault();
    };

    // Touch: drive horizontal stage from any swipe direction.
    let tx0 = 0, ty0 = 0, sx0 = 0, touching = false;
    const onTouchStart = (e: TouchEvent) => {
      if (!e.touches[0]) return;
      tx0 = e.touches[0].clientX;
      ty0 = e.touches[0].clientY;
      sx0 = targetX;
      touching = true;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!touching || !e.touches[0]) return;
      const dx = e.touches[0].clientX - tx0;
      const dy = e.touches[0].clientY - ty0;
      setTarget(sx0 + (Math.abs(dy) >= Math.abs(dx) ? -dy : -dx));
      e.preventDefault();
    };
    const onTouchEnd = () => { touching = false; snapToNearest(); };

    // Keyboard: arrow keys, space, page keys, home/end.
    const onKeydown = (e: KeyboardEvent) => {
      if (['ArrowRight', 'PageDown', ' '].includes(e.key)) {
        e.preventDefault(); goTo(activeIndex() + 1);
      } else if (['ArrowLeft', 'PageUp'].includes(e.key)) {
        e.preventDefault(); goTo(activeIndex() - 1);
      } else if (e.key === 'Home') {
        e.preventDefault(); goTo(0);
      } else if (e.key === 'End') {
        e.preventDefault(); goTo(screenOffsets.length - 1);
      }
    };

    // Stage's own scroll event (momentum, scrollbar drag).
    const onScroll = () => {
      if (performance.now() < internalScrollUntil) return;
      if (rafId != null) { cancelAnimationFrame(rafId); rafId = null; }
      currentX = targetX = el.scrollLeft;
      syncProgress();
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('keydown', onKeydown);
    el.addEventListener('scroll', onScroll, { passive: true });

    targetX = currentX = 0;
    showHint = true;
    measureScreens();
    syncProgress();

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('keydown', onKeydown);
      el.removeEventListener('scroll', onScroll);
      if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
    };
  });

  // ── Responsive check ───────────────────────────────────────────────────
  onMount(() => {
    checkEnabled();

    const onResize = () => {
      const prev = enabled;
      checkEnabled();
      // Staying in horizontal mode — re-measure after layout shift.
      if (enabled && prev && stage) {
        measureScreens();
        currentX = targetX = clampX(stage.scrollLeft);
        syncProgress();
      }
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
    current={currentScreen}
    total={totalScreens}
    progress={scrollProgress}
    onPrev={() => goTo(currentScreen - 2)}
    onNext={() => goTo(currentScreen)}
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
    overflow-x: auto;
    overflow-y: hidden;
    scroll-behavior: auto;
    -ms-overflow-style: none;
    scrollbar-width: none;
    white-space: nowrap;
    font-size: 0; /* collapses inline-flex gaps between panels */
  }
  .stage > :global(*) { font-size: initial; }
  .stage::-webkit-scrollbar { display: none; }

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
    letter-spacing: .24em;
    text-transform: uppercase;
    color: var(--muted);
    pointer-events: none;
    transition: opacity .4s;
  }
  .scroll-hint.hide { opacity: 0; }

  .line {
    width: 44px;
    height: 1px;
    background: var(--ink);
    opacity: .5;
    animation: slide 2.4s ease-in-out infinite;
  }
  @keyframes slide {
    0%, 100% { transform: scaleX(1);   transform-origin: left; }
    50%       { transform: scaleX(1.6); transform-origin: left; }
  }
</style>
