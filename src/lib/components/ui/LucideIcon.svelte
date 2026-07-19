<script lang="ts">
  /**
   * Thin wrapper that resolves a lucide icon by string name, so content (static
   * or DatoCMS) can carry a plain icon name. Only the icons actually used by the
   * ritual checklists are imported, keeping the bundle tree-shaken.
   */
  import {
    Blend,
    CircleCheck,
    CookingPot,
    Droplet,
    Droplets,
    Flame,
    Hand,
    Hourglass,
    Layers,
    Milk,
    Mountain,
    Palette,
    Pencil,
    Recycle,
    RotateCw,
    Scissors,
    Shapes,
    Soup,
    SprayCan,
    Sprout,
    TriangleAlert,
    Utensils,
    Waves
  } from '@lucide/svelte';

  const ICONS = {
    blend: Blend,
    'circle-check': CircleCheck,
    'cooking-pot': CookingPot,
    droplet: Droplet,
    droplets: Droplets,
    flame: Flame,
    hand: Hand,
    hourglass: Hourglass,
    layers: Layers,
    milk: Milk,
    mountain: Mountain,
    palette: Palette,
    pencil: Pencil,
    recycle: Recycle,
    'rotate-cw': RotateCw,
    scissors: Scissors,
    shapes: Shapes,
    soup: Soup,
    'spray-can': SprayCan,
    sprout: Sprout,
    'triangle-alert': TriangleAlert,
    utensils: Utensils,
    waves: Waves
  };

  let { name, size = 20 }: { name: string; size?: number } = $props();

  const Icon = $derived(ICONS[name as keyof typeof ICONS]);
</script>

{#if Icon}
  <Icon {size} strokeWidth={1.75} aria-hidden="true" />
{/if}
