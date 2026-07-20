<script lang="ts">
  import type { DatoImage } from '$lib/types/datocms';
  import { datoImg } from '$lib/imgix';

  let {
    image,
    sizes = '100vw',
    class: className = '',
    eager = false
  }: {
    image: DatoImage;
    sizes?: string;
    class?: string;
    eager?: boolean;
  } = $props();

  // Responsive srcset via the shared DatoCMS/Imgix URL builder ($lib/imgix).
  const widths = [320, 640, 960, 1280, 1920];
  const srcset = $derived(widths.map((w) => `${datoImg(image.url, { w })} ${w}w`).join(', '));
  const src = $derived(datoImg(image.url, { w: 960 }));
</script>

<img
  {src}
  {srcset}
  {sizes}
  alt={image.alt ?? ''}
  width={image.width}
  height={image.height}
  loading={eager ? 'eager' : 'lazy'}
  fetchpriority={eager ? 'high' : undefined}
  decoding="async"
  style={image.blurUpThumb
    ? `background-image: url('${image.blurUpThumb}'); background-size: cover;`
    : undefined}
  class={className}
/>
