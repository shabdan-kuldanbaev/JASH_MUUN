<script lang="ts">
  import { onMount } from 'svelte';
  import { afterNavigate } from '$app/navigation';
  import { page } from '$app/state';
  import EditorialHeader from '$components/home/editorial/EditorialHeader.svelte';
  import FooterWordmark from '$components/home/editorial/FooterWordmark.svelte';
  import { initSmoothScroll, type SmoothScroll } from '$lib/smoothScroll';
  import { editorialHeader, initEditorialHeader } from '$lib/editorialHeader.svelte';

  let { children, data } = $props();

  // Practice detail opens on a full-viewport dark hero (nav flips like the homepage, no reserved band);
  // every other content page is light paper from the top → onLight nav + padding.
  const isPracticeDetail = $derived(page.route.id?.endsWith('practices/[slug]') ?? false);

  let smooth: SmoothScroll | null = null;

  onMount(() => {
    // Enable normal vertical scrolling for content pages (app.css locks body overflow globally).
    document.body.style.overflow = 'auto';
    smooth = initSmoothScroll();
    // Dark-hero pages report their viewport height so the nav flips at the hero edge; others → null (onLight).
    const stopHeader = initEditorialHeader(() =>
      page.route.id?.endsWith('practices/[slug]') ? window.innerHeight : null
    );
    // Nav/logo entrance masks key off `body.is-loaded` — without it they stay hidden below their masks.
    const raf = requestAnimationFrame(() => document.body.classList.add('is-loaded'));
    return () => {
      cancelAnimationFrame(raf);
      smooth?.destroy();
      smooth = null;
      stopHeader();
      document.body.classList.remove('is-loaded');
      document.body.style.overflow = '';
    };
  });

  // Layout persists across content→content nav, so jump instantly to the top instead of smooth-scrolling up.
  afterNavigate(() => {
    smooth?.scrollToTop();
    editorialHeader.show();
    // Recompute the light/dark nav state for the new route without waiting for a scroll.
    requestAnimationFrame(() => window.dispatchEvent(new Event('scroll')));
  });
</script>

<EditorialHeader locale={data.locale} onLight={!isPracticeDetail} />

<div class="content-shell" class:flush={isPracticeDetail}>
  {@render children()}
</div>
<FooterWordmark credit />

<style>
  /* Sits above the fixed footer and reserves its height below — the content
     lifts off to reveal the footer as you reach the bottom. */
  .content-shell {
    position: relative;
    z-index: 1;
    padding-top: var(--nav-h);
    margin-bottom: var(--footer-h, 0px);
    min-height: 100vh;
    background: var(--paper);
    overflow-x: clip;
  }

  /* Dark-hero pages bleed under the transparent nav — no band. Beats the mobile padding below. */
  .content-shell.flush {
    padding-top: 0;
  }

  @media (max-width: 767px) {
    .content-shell {
      padding-top: 84px;
    }
  }
</style>
