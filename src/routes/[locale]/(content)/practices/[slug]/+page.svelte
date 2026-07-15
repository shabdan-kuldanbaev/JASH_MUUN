<script lang="ts">
  import { resolve } from '$app/paths';
  import type { PageData } from './$types';
  import { LOCALES } from '$i18n';
  import SeoHead from '$cms/SeoHead.svelte';
  import ImmersivePractice from '$components/sections/ImmersivePractice.svelte';

  let { data }: { data: PageData } = $props();
</script>

<SeoHead
  title={data.practice.seo?.title ?? `${data.practice.title} — Jash-Muun`}
  description={data.practice.seo?.description ?? data.practice.excerpt}
  seo={data.practice.seo}
  locale={data.locale}
  alternateLocales={LOCALES.map((locale) => ({
    locale,
    url: resolve(`/${locale}/practices/${data.practice.slug}/`)
  }))}
/>

<ImmersivePractice sections={data.sections} />
