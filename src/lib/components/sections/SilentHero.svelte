<script lang="ts">
  import { asset } from '$app/paths';

  interface Props {
    /** Large silent poster word, e.g. "СҮМӨЛӨК". */
    word: string;
    subtitle?: string;
    image: string;
    imageAlt?: string;
  }

  let { word, subtitle = '', image, imageAlt = '' }: Props = $props();

  // Absolute URLs (CMS) pass through; root-relative (static) get the base prefix.
  const src = (s: string) => (s.startsWith('http') ? s : asset(s));
</script>

<div class="hero">
  <img class="hero-img" src={src(image)} alt={imageAlt} fetchpriority="high" />
  <span class="hero-ov" aria-hidden="true"></span>
  <span class="hero-scrim-top" aria-hidden="true"></span>
  <div class="hero-inner">
    <!-- Long poster words get a smaller fluid size to stay on one line down to 320px. -->
    <h1 class="hero-word" class:hero-word--long={word.length > 8}>{word}</h1>
    {#if subtitle}<p class="hero-sub">{subtitle}</p>{/if}
  </div>
</div>

<style>
  .hero {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: inherit;
    overflow: hidden;
    background: #12100e;
  }

  .hero-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .hero-ov {
    position: absolute;
    inset: 0;
    background: rgba(18, 16, 14, 0.4);
  }

  /* Darken the top band so the transparent white nav stays legible over any hero image. */
  .hero-scrim-top {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: clamp(160px, 22vh, 280px);
    background: linear-gradient(180deg, rgba(12, 10, 8, 0.55) 0%, rgba(12, 10, 8, 0) 100%);
    pointer-events: none;
  }

  .hero-inner {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 0 var(--gutter);
  }

  .hero-word {
    font-size: clamp(48px, 9vw, 132px);
    font-weight: 700;
    letter-spacing: 0.08em;
    line-height: 1;
    color: #f6f1e7;
  }

  .hero-word--long {
    font-size: clamp(20px, 6.6vw, 104px);
  }

  .hero-sub {
    margin-top: clamp(20px, 3vh, 40px);
    max-width: 42ch;
    font-size: clamp(15px, 1.6vw, 19px);
    line-height: 1.5;
    color: #d6cdbb;
  }
</style>
