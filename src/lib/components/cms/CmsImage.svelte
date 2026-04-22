<script lang="ts">
  import type { DatoImage } from '$lib/types/datocms';

  let {
    image,
    sizes = '100vw',
    class: className = '',
    eager = false,
  }: {
    image: DatoImage;
    sizes?: string;
    class?: string;
    eager?: boolean;
  } = $props();

  // DatoCMS image transformation parameters for responsive srcset.
  // Uses DatoCMS Imgix integration — append params to the URL.
  function imgUrl(url: string, width: number): string {
    const base = url.split('?')[0];
    return `${base}?w=${width}&auto=format`;
  }

  const widths = [320, 640, 960, 1280, 1920];
  const srcset = $derived(widths.map((w) => `${imgUrl(image.url, w)} ${w}w`).join(', '));
  const src = $derived(imgUrl(image.url, 960));
</script>

<img
  {src}
  {srcset}
  {sizes}
  alt={image.alt ?? ''}
  width={image.width}
  height={image.height}
  loading={eager ? 'eager' : 'lazy'}
  decoding="async"
  style={image.blurUpThumb ? `background-image: url('${image.blurUpThumb}'); background-size: cover;` : undefined}
  class={className}
/>
