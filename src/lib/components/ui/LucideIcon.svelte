<script lang="ts">
  /**
   * Thin wrapper that resolves a lucide icon by string name, so content (static
   * or DatoCMS) can carry a plain icon name. Only the icons actually used by the
   * ritual checklists are imported, keeping the bundle tree-shaken.
   */
  import {
    Droplets,
    Droplet,
    Sprout,
    SprayCan,
    CircleCheck,
    TriangleAlert,
    Soup,
    RotateCw,
    Milk,
    Recycle,
    CookingPot,
    Mountain,
    Flame,
    Utensils,
    Hourglass,
    Palette
  } from '@lucide/svelte';

  const ICONS = {
    droplets: Droplets,
    droplet: Droplet,
    sprout: Sprout,
    'spray-can': SprayCan,
    'circle-check': CircleCheck,
    'triangle-alert': TriangleAlert,
    soup: Soup,
    'rotate-cw': RotateCw,
    milk: Milk,
    recycle: Recycle,
    'cooking-pot': CookingPot,
    mountain: Mountain,
    flame: Flame,
    utensils: Utensils,
    hourglass: Hourglass,
    palette: Palette
  };

  let { name, size = 20 }: { name: string; size?: number } = $props();

  const Icon = $derived(ICONS[name as keyof typeof ICONS]);
</script>

{#if Icon}
  <Icon {size} strokeWidth={1.75} aria-hidden="true" />
{/if}
