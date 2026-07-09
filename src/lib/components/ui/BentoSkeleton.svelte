<script lang="ts">
  import { m } from '$i18n';
  import Skeleton from './Skeleton.svelte';

  // Variant mirrors the real bento rhythm so the layout does not jump on content swap.
  interface Props {
    variant?: 'practices' | 'articles';
  }
  let { variant = 'practices' }: Props = $props();

  const count = $derived(variant === 'practices' ? 6 : 4);
  const cells = $derived(Array.from({ length: count }, (_, i) => i + 1));
</script>

<div class="skel skel--{variant}" role="status" aria-label={m.skeleton_loading_aria()}>
  {#each cells as c (c)}
    <div class="cell cell-{c}">
      <Skeleton width="100%" height="100%" radius="12px" />
    </div>
  {/each}
</div>

<style>
  .skel {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: clamp(12px, 1.5vw, 24px);
  }
  .cell {
    min-height: 0;
  }

  /* ── Practices variant — mirrors PracticesIndex .card:nth-child(6n+k) ── */
  .skel--practices {
    grid-auto-rows: 150px;
  }
  .skel--practices .cell-1 {
    grid-column: span 2;
    grid-row: span 2;
  }
  .skel--practices .cell-2 {
    grid-row: span 1;
  }
  .skel--practices .cell-3 {
    grid-row: span 1;
  }
  .skel--practices .cell-4 {
    grid-column: span 1;
    grid-row: span 2;
  }
  .skel--practices .cell-5 {
    grid-column: span 2;
    grid-row: span 2;
  }
  .skel--practices .cell-6 {
    grid-column: span 3;
    grid-row: span 2;
  }

  /* ── Articles variant — mirrors ArticlesIndex .card:nth-child(4n+k) ── */
  .skel--articles {
    grid-auto-rows: clamp(240px, 26vw, 360px);
  }
  .skel--articles .cell-1 {
    grid-column: span 2;
  }
  .skel--articles .cell-2 {
    grid-column: span 1;
  }
  .skel--articles .cell-3 {
    grid-column: span 1;
  }
  .skel--articles .cell-4 {
    grid-column: span 2;
  }

  @media (max-width: 900px) {
    .skel--articles {
      grid-template-columns: repeat(2, 1fr);
    }
    .skel--articles .cell {
      grid-column: span 1 !important;
    }
  }
  @media (max-width: 600px) {
    .skel {
      grid-template-columns: 1fr;
    }
    .skel--practices {
      grid-auto-rows: 220px;
    }
    .skel--practices .cell,
    .skel--articles .cell {
      grid-column: span 1 !important;
      grid-row: span 1 !important;
    }
    .skel--articles {
      grid-auto-rows: 210px;
    }
  }
</style>
