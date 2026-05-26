<script lang="ts">
  import { asset } from '$app/paths';
  import { m } from '$i18n';

  const logos = [
    { src: asset('/assets/main-logo.svg'), alt: 'Jash-Muun' },
    { src: asset('/assets/supporting-logo.svg'), alt: 'ALIPH' },
    { src: asset('/assets/eu-logo.svg'), alt: 'European Union' }
  ];
</script>

<footer class="content-footer" aria-label={m.footer_aria_section()}>
  <div class="footer-inner">
    <div class="partners">
      <span class="label">{m.footer_supported_by()}</span>
      <div class="logos">
        {#each logos as logo (logo.alt)}
          <span class="logo" aria-label={logo.alt}>
            <img src={logo.src} alt={logo.alt} />
          </span>
        {/each}
      </div>
      <p class="note">{m.footer_support_note()}</p>
    </div>

    <div class="colophon">
      <span>{m.footer_copyright()}</span>
      <span class="mark">Jash-Muun</span>
    </div>
  </div>
</footer>

<style>
  .content-footer {
    border-top: 1px solid color-mix(in srgb, var(--ink) 10%, transparent);
    margin-top: clamp(64px, 8vw, 120px);
  }

  .footer-inner {
    max-width: var(--content-w);
    margin: 0 auto;
    padding: clamp(40px, 5vw, 64px) var(--gutter) clamp(32px, 4vw, 48px);
  }

  .partners {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: clamp(32px, 4vw, 48px);
  }

  .label {
    font-size: 11px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--muted);
  }

  .logos {
    display: flex;
    gap: 40px;
    align-items: center;
    flex-wrap: wrap;
  }

  .logo {
    display: flex;
    align-items: center;
    height: 48px;
  }

  .logo img {
    height: 100%;
    width: auto;
    display: block;
    opacity: 0.7;
    transition: opacity 0.3s ease;
  }

  .logo:hover img {
    opacity: 1;
  }

  .note {
    font-size: 12px;
    line-height: 1.6;
    color: var(--muted);
    max-width: 56ch;
  }

  .colophon {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 20px;
    border-top: 1px solid color-mix(in srgb, var(--ink) 8%, transparent);
    font-size: 12px;
    color: var(--muted);
    letter-spacing: 0.04em;
  }

  .mark {
    font-family: 'Figtree', sans-serif;
    font-size: 13px;
    color: var(--ink);
    font-weight: 600;
    letter-spacing: 0.02em;
  }

  @media (max-width: 600px) {
    .logos {
      gap: 24px;
    }

    .logo {
      height: 36px;
    }

    .colophon {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }
  }
</style>
