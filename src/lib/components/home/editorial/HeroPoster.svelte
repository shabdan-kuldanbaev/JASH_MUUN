<script lang="ts">
  import { asset } from '$app/paths';
  import { m } from '$i18n';

  // The parent binds this element so the header can measure the hero height
  // (the light/dark boundary tracks the live hero, which is full-viewport but
  // resizes with the mobile URL bar).
  let { heroEl = $bindable(null) }: { heroEl?: HTMLElement | null } = $props();
</script>

<section class="hero" bind:this={heroEl}>
  <div class="hero-media">
    <img class="hero-img" src={asset('/assets/home/hero.jpg')} alt={m.home_hero_image_alt()} />
    <div class="hero-veil"></div>
    <div class="hero-scrim-top"></div>
    <div class="hero-scrim-bottom"></div>
  </div>

  <div class="hero-content">
    <div class="hero-bottom">
      <!-- Condensed two-line title — per-line masked slide-up on load. -->
      <h1 class="hero-title">
        <span class="ht-mask"><span class="ht-line">{m.home_hero_title_line_1()}</span></span>
        <span class="ht-mask"><span class="ht-line">{m.home_hero_title_line_2()}</span></span>
      </h1>
    </div>
  </div>
</section>

<style>
  .hero {
    position: relative;
    height: 100vh;
    height: 100svh;
    min-height: 600px;
    overflow: clip;
    display: flex;
  }

  .hero-media {
    position: absolute;
    inset: 0;
    z-index: 0;
    overflow: clip;
  }

  .hero-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center 42%;
  }

  /* Rest state once loaded — the pre-state + transition live in the
     prefers-reduced-motion: no-preference block below. */
  :global(body.is-loaded) .hero-img {
    transform: scale(1);
    opacity: 1;
  }

  /* Dark scrims under the white text: top for the header, bottom for the title. */
  .hero-scrim-top {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 240px;
    background: linear-gradient(180deg, rgba(15, 12, 10, 0.5) 0%, rgba(15, 12, 10, 0) 100%);
    z-index: 1;
    pointer-events: none;
  }

  .hero-scrim-bottom {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 62%;
    background: linear-gradient(
      0deg,
      rgba(15, 12, 10, 0.72) 0%,
      rgba(15, 12, 10, 0.34) 44%,
      rgba(15, 12, 10, 0) 100%
    );
    z-index: 1;
    pointer-events: none;
  }

  .hero-veil {
    position: absolute;
    inset: 0;
    background: rgba(12, 10, 8, 0.14);
    z-index: 1;
    pointer-events: none;
  }

  .hero-content {
    position: relative;
    z-index: 3;
    width: 100%;
    max-width: var(--home-w);
    margin: 0 auto;
    padding: var(--nav-h) var(--gutter) clamp(40px, 6vh, 80px);
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
  }

  .hero-bottom {
    /* Wide enough that the longest localized title (Kyrgyz line 2) is never
       clipped by the mask's overflow — the lines are nowrap, so this only sets
       the clip boundary, not the visual width. */
    max-width: min(96%, 1100px);
  }

  .hero-title {
    font-family: Jost, sans-serif;
    font-weight: 400;
    font-size: clamp(30px, 4.4vw, 66px);
    line-height: 0.98;
    letter-spacing: -0.02em;
    color: #fff;
    white-space: nowrap;
    text-shadow: 0 2px 20px rgba(0, 0, 0, 0.32);
  }

  .hero-title .ht-mask {
    display: block;
    overflow: hidden;
    /* Room for Cyrillic descenders (р, д, ц, у) below the tight 0.98 line box —
       the negative margin keeps the inter-line gap unchanged. */
    padding-bottom: 0.22em;
    margin-bottom: -0.16em;
  }

  .hero-title .ht-line {
    display: block;
  }

  :global(body.is-loaded) .hero-title .ht-line {
    transform: translateY(0);
  }

  /* The entrance (and its pre-animation offset) only exists when motion is
     allowed — so under reduced motion there is nothing to neutralize and no
     !important is needed. */
  @media (prefers-reduced-motion: no-preference) {
    .hero-img {
      transform: scale(1.14);
      opacity: 0;
      transition:
        transform 2s var(--ease),
        opacity 1.2s ease;
      will-change: transform;
    }

    .hero-title .ht-line {
      /* 125% (not 110%) so the taller descender-padded mask still fully hides
         the line before it slides up. */
      transform: translateY(125%);
      transition: transform 0.95s var(--ease);
      will-change: transform;
    }

    .hero-title .ht-mask:nth-child(1) .ht-line {
      transition-delay: 0.45s;
    }

    .hero-title .ht-mask:nth-child(2) .ht-line {
      transition-delay: 0.6s;
    }
  }
</style>
