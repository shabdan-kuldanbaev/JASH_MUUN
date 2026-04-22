<script lang="ts">
  import { onMount } from 'svelte';
  import type { PageData } from './$types';
  import Header from '$components/layout/Header.svelte';
  import ScrollProgress from '$components/layout/ScrollProgress.svelte';
  import HeroSection from '$components/sections/HeroSection.svelte';
  import FooterSection from '$components/sections/FooterSection.svelte';

  let { data }: { data: PageData } = $props();

  // ── Horizontal scroll state ──────────────────────────────────────────
  const EASE = 0.3;
  const SCREEN_SELECTOR = '[data-scroll-screen]';

  let stage: HTMLElement;
  let screens: Element[] = [];
  let screenOffsets: number[] = [];

  let targetX = 0;
  let currentX = 0;
  let rafId: number | null = null;
  let internalScrollUntil = 0;

  // Progress bar & nav state
  let scrollProgress = $state(0);
  let currentScreen = $state(1);
  let totalScreens = $state(4);
  let showHint = $state(true);

  function maxScroll() {
    return stage ? stage.scrollWidth - stage.clientWidth : 0;
  }

  function clampX(x: number) {
    return Math.max(0, Math.min(maxScroll(), x));
  }

  function measureScreens() {
    const rect = stage.getBoundingClientRect();
    screens = [...stage.querySelectorAll(SCREEN_SELECTOR)];
    screenOffsets = screens.map(s => {
      const x = s.getBoundingClientRect().left - rect.left + stage.scrollLeft;
      return clampX(x);
    });
    if (!screenOffsets.length) screenOffsets = [0];
    totalScreens = screenOffsets.length;
  }

  function nearestIndex(x: number) {
    let idx = 0, min = Infinity;
    for (let i = 0; i < screenOffsets.length; i++) {
      const d = Math.abs(screenOffsets[i] - x);
      if (d < min) { min = d; idx = i; }
    }
    return idx;
  }

  function writeStageScroll(x: number) {
    internalScrollUntil = performance.now() + 80;
    stage.scrollLeft = x;
  }

  function tick() {
    const dx = targetX - currentX;
    if (Math.abs(dx) < 0.4) {
      currentX = targetX;
      writeStageScroll(currentX);
      rafId = null;
      update();
      return;
    }
    currentX += dx * EASE;
    writeStageScroll(currentX);
    update();
    rafId = requestAnimationFrame(tick);
  }

  function ensureRaf() {
    if (rafId == null) rafId = requestAnimationFrame(tick);
  }

  function setTarget(x: number) {
    targetX = clampX(x);
    ensureRaf();
  }

  function goTo(i: number) {
    const idx = Math.max(0, Math.min(screenOffsets.length - 1, i));
    setTarget(screenOffsets[idx] ?? 0);
  }

  function currentIndex() {
    return nearestIndex(stage.scrollLeft + stage.clientWidth * 0.35);
  }

  function snapToNearest() {
    goTo(nearestIndex(stage.scrollLeft));
  }

  function update() {
    const max = maxScroll();
    const pct = max > 0 ? stage.scrollLeft / max : 0;
    scrollProgress = pct;
    currentScreen = currentIndex() + 1;
    if (stage.scrollLeft > 40) showHint = false;
  }

  onMount(() => {
    // Ensure body overflow is hidden for the horizontal scroll experience.
    // This overrides the reset applied by content-page layouts on navigation back to homepage.
    document.body.style.overflow = 'hidden';

    // Wheel: vertical → horizontal
    const handleWheel = (e: WheelEvent) => {
      const dy = e.deltaY, dx = e.deltaX;
      const delta = Math.abs(dy) > Math.abs(dx) ? dy : dx;
      if (delta === 0) return;
      let step = delta;
      if (e.deltaMode === 1) step *= 56;
      else if (e.deltaMode === 2) step *= window.innerWidth;
      else step *= 1.6;
      setTarget(targetX + step);
      e.preventDefault();
    };

    // Touch
    let touchStartX = 0, touchStartY = 0, touchScrollStart = 0, touchActive = false;
    const handleTouchStart = (e: TouchEvent) => {
      if (!e.touches[0]) return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchScrollStart = targetX;
      touchActive = true;
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (!touchActive || !e.touches[0]) return;
      const dx = e.touches[0].clientX - touchStartX;
      const dy = e.touches[0].clientY - touchStartY;
      const drive = Math.abs(dy) > Math.abs(dx) ? -dy : -dx;
      setTarget(touchScrollStart + drive);
      e.preventDefault();
    };
    const handleTouchEnd = () => { touchActive = false; snapToNearest(); };

    // Keyboard
    const handleKeydown = (e: KeyboardEvent) => {
      if (['ArrowRight', 'PageDown', ' '].includes(e.key)) {
        e.preventDefault(); goTo(currentIndex() + 1);
      } else if (['ArrowLeft', 'PageUp'].includes(e.key)) {
        e.preventDefault(); goTo(currentIndex() - 1);
      } else if (e.key === 'Home') goTo(0);
      else if (e.key === 'End') goTo(screenOffsets.length - 1);
    };

    const handleScroll = () => {
      if (performance.now() < internalScrollUntil) return;
      if (rafId != null) { cancelAnimationFrame(rafId); rafId = null; }
      currentX = targetX = stage.scrollLeft;
      update();
    };

    const handleResize = () => {
      measureScreens();
      currentX = targetX = clampX(stage.scrollLeft);
      update();
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('keydown', handleKeydown);
    window.addEventListener('resize', handleResize);
    stage.addEventListener('scroll', handleScroll, { passive: true });

    measureScreens();
    targetX = currentX = stage.scrollLeft;
    update();

    return () => {
      // Restore scrolling when navigating away from the homepage.
      document.body.style.overflow = '';

      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('keydown', handleKeydown);
      window.removeEventListener('resize', handleResize);
      stage.removeEventListener('scroll', handleScroll);
    };
  });
</script>

<svelte:head>
  <title>Jash-Muun · Living Heritage</title>
  <meta name="description" content="A digital exhibition of intangible cultural heritage from Kyrgyz mountain communities." />
</svelte:head>

<Header locale={data.locale} />

<!-- Horizontal scroll stage -->
<main class="stage" bind:this={stage} id="stage">
  <HeroSection practices={data.practices} locale={data.locale} />
  <FooterSection />
</main>

<!-- Scroll hint -->
<div class="scroll-hint" class:hide={!showHint} aria-hidden="true">
  <span class="line"></span>
  Scroll to explore
</div>

<ScrollProgress
  current={currentScreen}
  total={totalScreens}
  progress={scrollProgress}
  onPrev={() => goTo(currentScreen - 2)}
  onNext={() => goTo(currentScreen)}
/>

<style>
  .stage {
    position: fixed;
    inset: 0;
    width: 100vw; height: 100vh;
    overflow-x: auto; overflow-y: hidden;
    scroll-behavior: auto;
    -ms-overflow-style: none;
    scrollbar-width: none;
    white-space: nowrap;
    font-size: 0;
  }
  .stage > :global(*) { font-size: initial; }
  .stage::-webkit-scrollbar { display: none; }

  .scroll-hint {
    position: fixed;
    left: var(--gutter);
    bottom: 32px;
    z-index: 45;
    font-size: 11px;
    letter-spacing: .24em;
    text-transform: uppercase;
    color: var(--muted);
    display: flex;
    align-items: center;
    gap: 14px;
    transition: opacity .4s;
  }
  .scroll-hint.hide { opacity: 0; pointer-events: none; }
  .line {
    width: 44px; height: 1px;
    background: var(--ink);
    opacity: .5;
    animation: slide 2.4s ease-in-out infinite;
  }
  @keyframes slide {
    0%   { transform: scaleX(1); transform-origin: left; }
    50%  { transform: scaleX(1.6); transform-origin: left; }
    100% { transform: scaleX(1); transform-origin: left; }
  }
</style>
