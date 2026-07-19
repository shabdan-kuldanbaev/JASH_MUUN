<script lang="ts">
  import { onMount } from 'svelte';
  import { afterNavigate } from '$app/navigation';
  import Header from '$components/layout/Header.svelte';
  import ContentFooter from '$components/layout/ContentFooter.svelte';
  import { initSmoothScroll, type SmoothScroll } from '$lib/smoothScroll';
  import { headerReveal, initHeaderReveal } from '$lib/headerReveal.svelte';

  let { children, data } = $props();

  let smooth: SmoothScroll | null = null;

  onMount(() => {
    // Enable normal vertical scrolling for content pages.
    // The homepage restores overflow: hidden in its own onMount/cleanup.
    document.body.style.overflow = 'auto';
    // Momentum smooth-scroll (Lenis) lives here, not on the horizontal homepage.
    smooth = initSmoothScroll();
    // Auto-hide header follows the vertical scroll (content pages only).
    const stopHeaderReveal = initHeaderReveal();
    return () => {
      smooth?.destroy();
      smooth = null;
      stopHeaderReveal();
      document.body.style.overflow = '';
    };
  });

  // This layout persists across content→content navigation, so Lenis keeps its
  // offset — jump instantly to the top instead of smooth-scrolling up through
  // the whole previous page. (afterNavigate must be registered at init time.)
  afterNavigate(() => {
    smooth?.scrollToTop();
    headerReveal.show();
  });
</script>

<Header locale={data.locale} />

<div class="content-shell">
  {@render children()}
  <ContentFooter />
</div>

<style>
  .content-shell {
    padding-top: var(--nav-h);
    min-height: 100vh;
    background: var(--paper);
    /* `clip` (not `hidden`) so it doesn't become a scroll container — keeps
       horizontal full-bleed contained while letting `position: sticky` work. */
    overflow-x: clip;
  }
</style>
