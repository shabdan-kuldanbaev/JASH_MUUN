<script lang="ts">
  import type { PageData } from './$types';
  import PracticesIndex from '$components/content/PracticesIndex.svelte';

  let { data }: { data: PageData } = $props();
</script>

<PracticesIndex practices={data.practices} page={data.page} locale={data.locale} />
