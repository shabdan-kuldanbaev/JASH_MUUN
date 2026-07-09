<script lang="ts">
  import type { PageData } from './$types';
  import ArticlesIndex from '$components/content/ArticlesIndex.svelte';

  let { data }: { data: PageData } = $props();
</script>

<ArticlesIndex articles={data.articles} page={data.page} locale={data.locale} />
