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

  let { data }: { data: PageData } = $props();

  // The hero element — bound so the header can measure its live height for the
  // light/dark boundary.
  let heroEl = $state<HTMLElement | null>(null);

  onMount(() => {
    // This route lives outside the (content) group, so restore vertical scroll
    // here (app.css locks body overflow globally for the horizontal homepage).
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'auto';

    // Load gate for the hero/header entrance — paint the pre-state one frame,
    // then flip `is-loaded` so the CSS transitions run.
    let raf1 = 0;
    let raf2 = 0;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => document.body.classList.add('is-loaded'));
    });
    // Safety net if the page was restored past first paint.
    const onLoad = () => document.body.classList.add('is-loaded');
    window.addEventListener('load', onLoad);

    const stopHeader = initEditorialHeader(() => heroEl);

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      window.removeEventListener('load', onLoad);
      stopHeader();
      document.body.classList.remove('is-loaded');
      document.body.style.overflow = prevOverflow;
    };
  });
</script>

<SeoHead title={m.home_meta_title()} description={m.home_meta_description()} locale={data.locale} />

<EditorialHeader locale={data.locale} />

<main>
  <HeroPoster bind:heroEl />
  <AboutStatement />
  <EditorialPractices practices={data.practices} locale={data.locale} />
  <ArchiveScatter archive={data.archive} locale={data.locale} />
</main>

<FooterWordmark />
