<script lang="ts">
  import { onMount } from 'svelte';
  import { afterNavigate } from '$app/navigation';
  import { page } from '$app/state';
  import EditorialHeader from '$components/home/editorial/EditorialHeader.svelte';
  import FooterWordmark from '$components/home/editorial/FooterWordmark.svelte';
  import { initSmoothScroll, type SmoothScroll } from '$lib/smoothScroll';
  import { editorialHeader, initEditorialHeader } from '$lib/editorialHeader.svelte';

  let { children, data } = $props();

  // The practice detail page opens on a full-viewport dark hero (SilentHero), so
  // the nav must behave like the homepage there — white over the hero, flipping
  // to black past it — and the hero must bleed to the top (no reserved nav band).
  // Every other content page is light paper from the top → onLight nav + padding.
  const isPracticeDetail = $derived(page.route.id?.endsWith('practices/[slug]') ?? false);

  let smooth: SmoothScroll | null = null;

  onMount(() => {
    // Enable normal vertical scrolling for content pages.
    // The homepage restores overflow: hidden in its own onMount/cleanup.
    document.body.style.overflow = 'auto';
    // Momentum smooth-scroll (Lenis) lives here, not on the horizontal homepage.
    smooth = initSmoothScroll();
    // A dark-hero page reports its (viewport) hero height so the nav flips at the
    // hero's edge; every other page reports null → onLight from the top.
    const stopHeader = initEditorialHeader(() =>
      page.route.id?.endsWith('practices/[slug]') ? window.innerHeight : null
    );
    // The nav/logo entrance masks key off `body.is-loaded` (the homepage sets
    // it too) — without it the logos and links stay hidden below their masks.
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

  // This layout persists across content→content navigation, so Lenis keeps its
  // offset — jump instantly to the top instead of smooth-scrolling up through
  // the whole previous page. (afterNavigate must be registered at init time.)
  afterNavigate(() => {
    smooth?.scrollToTop();
    editorialHeader.show();
    // Recompute the light/dark nav state for the new route without waiting for a
    // scroll — index ↔ detail flips the hero boundary.
    requestAnimationFrame(() => window.dispatchEvent(new Event('scroll')));
  });
</script>

<EditorialHeader locale={data.locale} onLight={!isPracticeDetail} />

<div class="content-shell" class:flush={isPracticeDetail}>
  {@render children()}
  <FooterWordmark credit />
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

  /* Dark-hero pages (practice detail) bleed under the transparent nav — no band,
     matching the homepage. Higher specificity beats the mobile padding below. */
  .content-shell.flush {
    padding-top: 0;
  }

  /* The editorial nav stacks into two rows on mobile (logos over links), so it
     is taller than --nav-h — reserve more space or content tucks under it. */
  @media (max-width: 767px) {
    .content-shell {
      padding-top: 118px;
    }
  }
</style>
