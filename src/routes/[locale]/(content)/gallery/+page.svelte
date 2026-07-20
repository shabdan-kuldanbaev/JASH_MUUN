<script lang="ts">
  import type { PageData } from './$types';
  import ArchiveWall from '$components/content/ArchiveWall.svelte';

  let { data }: { data: PageData } = $props();
</script>

<ArchiveWall items={data.items} locale={data.locale} />
