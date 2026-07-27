<script lang="ts">
  import { m } from '$i18n';
  import Skeleton from './Skeleton.svelte';

  // Variant mirrors the real bento rhythm so the layout does not jump on content swap.
  interface Props {
    variant?: 'practices' | 'articles';
  }
  let { variant = 'practices' }: Props = $props();

  const count = $derived(variant === 'practices' ? 6 : 7);
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
    grid-auto-rows: clamp(165px, 17vw, 280px);
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

  /* ── Articles variant — mirrors the ArticlesIndex card grid (4 cols, lead spans 2) ── */
  .skel--articles {
    grid-template-columns: repeat(4, 1fr);
    grid-auto-rows: clamp(190px, 17vw, 260px);
    gap: clamp(44px, 4.5vw, 76px) clamp(20px, 2.4vw, 40px);
  }
  .skel--articles .cell-1 {
    grid-column: span 2;
  }

  /* Articles: 4 → 3 → 2 → 1, mirroring ArticlesIndex. */
  @media (max-width: 1280px) {
    .skel--articles {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  @media (max-width: 620px) {
    .skel--articles {
      grid-template-columns: 1fr;
      grid-auto-rows: clamp(200px, 52vw, 260px);
    }
    .skel--articles .cell-1 {
      grid-column: span 1;
    }
  }

  @media (max-width: 900px) {
    .skel--articles {
      grid-template-columns: repeat(2, 1fr);
      gap: clamp(40px, 5vw, 64px) clamp(24px, 3vw, 44px);
    }
    .skel--practices {
      grid-template-columns: repeat(2, 1fr);
      grid-auto-rows: clamp(190px, 26vw, 250px);
    }
    .skel--practices .cell {
      grid-column: span 1;
      grid-row: span 1;
    }
    .skel--practices .cell-1,
    .skel--practices .cell-6 {
      grid-column: span 2;
      grid-row: span 2;
    }
  }
  @media (max-width: 600px) {
    .skel--practices {
      grid-template-columns: 1fr;
      grid-auto-rows: clamp(200px, 52vw, 290px);
    }
    .skel--practices .cell {
      grid-column: span 1 !important;
      grid-row: span 1 !important;
    }
  }
</style>
