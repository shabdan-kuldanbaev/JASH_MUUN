<script lang="ts">
  import { resolve } from '$app/paths';
  import type { PageData } from './$types';
  import { LOCALES, m } from '$i18n';
  import Header from '$components/layout/Header.svelte';
  import HorizontalStage from '$components/home/HorizontalStage.svelte';
  import HeroSection from '$components/sections/HeroSection.svelte';
  import FooterSection from '$components/sections/FooterSection.svelte';

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>{m.home_meta_title()}</title>
  <meta name="description" content={m.home_meta_description()} />
  {#each LOCALES as locale (locale)}
    <link rel="alternate" hreflang={locale} href={resolve(`/${locale}/`)} />
  {/each}
</svelte:head>

<Header locale={data.locale} />

<HorizontalStage>
  <HeroSection practices={data.practices} locale={data.locale} />
  <FooterSection />
</HorizontalStage>
