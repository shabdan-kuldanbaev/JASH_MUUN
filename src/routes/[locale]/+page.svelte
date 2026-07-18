<script lang="ts">
  import type { PageData } from './$types';
  import { m } from '$i18n';
  import SeoHead from '$cms/SeoHead.svelte';
  import Header from '$components/layout/Header.svelte';
  import HorizontalStage from '$components/home/HorizontalStage.svelte';
  import HeroSection from '$components/sections/HeroSection.svelte';
  import FooterSection from '$components/sections/FooterSection.svelte';

  let { data }: { data: PageData } = $props();
</script>

<SeoHead title={m.home_meta_title()} description={m.home_meta_description()} locale={data.locale} />

<Header locale={data.locale} />

<HorizontalStage>
  <HeroSection practices={data.practices} locale={data.locale} />
  <FooterSection />
</HorizontalStage>
