<script lang="ts">
  import { onMount } from 'svelte';
  import type { PageData } from './$types';
  import { m } from '$i18n';
  import SeoHead from '$cms/SeoHead.svelte';
  import EditorialHeader from '$components/home/editorial/EditorialHeader.svelte';
  import HeroPoster from '$components/home/editorial/HeroPoster.svelte';
  import AboutStatement from '$components/home/editorial/AboutStatement.svelte';
  import EditorialPractices from '$components/home/editorial/EditorialPractices.svelte';
  import ArchiveScatter from '$components/home/editorial/ArchiveScatter.svelte';
  import FooterWordmark from '$components/home/editorial/FooterWordmark.svelte';
  import { initEditorialHeader } from '$lib/editorialHeader.svelte';
  import { initSmoothScroll } from '$lib/smoothScroll';

  let { data }: { data: PageData } = $props();

  // Bound so the header can measure the live hero height for the light/dark boundary.
  let heroEl = $state<HTMLElement | null>(null);

  onMount(() => {
    // Restore vertical scroll (app.css locks body overflow globally).
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'auto';

    // Load gate: paint the pre-state one frame, then flip `is-loaded` so the transitions run.
    let raf1 = 0;
    let raf2 = 0;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => document.body.classList.add('is-loaded'));
    });
    // Safety net if the page was restored past first paint.
    const onLoad = () => document.body.classList.add('is-loaded');
    window.addEventListener('load', onLoad);

    const stopHeader = initEditorialHeader(() => heroEl?.offsetHeight ?? null);
    // Momentum smooth-scroll on the homepage too (drives native scroll so the header tracker still fires).
    const smooth = initSmoothScroll();

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      window.removeEventListener('load', onLoad);
      stopHeader();
      smooth.destroy();
      document.body.classList.remove('is-loaded');
      document.body.style.overflow = prevOverflow;
    };
  });
</script>

<SeoHead title={m.home_meta_title()} description={m.home_meta_description()} locale={data.locale} />

<EditorialHeader locale={data.locale} />

<main class="home-main">
  <HeroPoster bind:heroEl />
  <AboutStatement />
  <EditorialPractices practices={data.practices} locale={data.locale} />
  <ArchiveScatter archive={data.archive} locale={data.locale} />
</main>

<FooterWordmark />

<style>
  /* Sits above the fixed footer and reserves its height — the page lifts off to
     reveal the footer at the bottom. */
  .home-main {
    position: relative;
    z-index: 1;
    margin-bottom: var(--footer-h, 0px);
    background: var(--paper);
  }
</style>
