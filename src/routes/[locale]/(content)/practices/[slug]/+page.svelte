<script lang="ts">
  import type { PageData } from './$types';
  import SeoHead from '$cms/SeoHead.svelte';
  import ImmersivePractice from '$components/sections/ImmersivePractice.svelte';

  let { data }: { data: PageData } = $props();
</script>

<SeoHead
  title={data.practice.seo?.title ?? `${data.practice.title} — Jash-Muun`}
  description={data.practice.seo?.description ?? data.practice.excerpt}
  seo={data.practice.seo}
  locale={data.locale}
  type="article"
/>

<ImmersivePractice sections={data.sections} />
