<script lang="ts">
  import { onMount } from 'svelte';
  import { afterNavigate } from '$app/navigation';
  import EditorialHeader from '$components/home/editorial/EditorialHeader.svelte';
  import FooterWordmark from '$components/home/editorial/FooterWordmark.svelte';
  import { initSmoothScroll, type SmoothScroll } from '$lib/smoothScroll';
  import { editorialHeader, initEditorialHeader } from '$lib/editorialHeader.svelte';

  let { children, data } = $props();

  let smooth: SmoothScroll | null = null;

  onMount(() => {
    // Enable normal vertical scrolling for content pages.
    // The homepage restores overflow: hidden in its own onMount/cleanup.
    document.body.style.overflow = 'auto';
    // Momentum smooth-scroll (Lenis) lives here, not on the horizontal homepage.
    smooth = initSmoothScroll();
    // The editorial nav in "always over light" mode: content pages have no dark
    // hero, so it renders black-on-paper and only auto-hides on scroll.
    const stopHeader = initEditorialHeader(() => null, { alwaysOnLight: true });
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
  });
</script>

<EditorialHeader locale={data.locale} onLight />

<div class="content-shell">
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

  /* The editorial nav stacks into two rows on mobile (logos over links), so it
     is taller than --nav-h — reserve more space or content tucks under it. */
  @media (max-width: 767px) {
    .content-shell {
      padding-top: 118px;
    }
  }
</style>
