<script lang="ts">
  import { asset } from '$app/paths';
  import { m } from '$i18n';

  const mainLogoSrc = asset('/assets/main-logo.svg');
  const supportingLogoSrc = asset('/assets/supporting-logo.svg');
</script>

<section
  class="panel panel--w-full footer-wrap"
  data-scroll-screen
  aria-label={m.footer_aria_section()}
>
  <div class="footer-inner">
    <div class="footer-grid">
      <aside class="partners" aria-label="Supporters">
        <span class="label">{m.footer_supported_by()}</span>
        <div class="logos">
          <span class="plogo main" aria-label="Jash-Muun">
            <img src={mainLogoSrc} alt="Jash-Muun" style="height:72px;width:auto;display:block;" />
          </span>
          <span class="plogo support" aria-label="ALIPH">
            <img
              src={supportingLogoSrc}
              alt="ALIPH"
              style="height:72px;width:auto;display:block;"
            />
          </span>
        </div>
        <p class="note">{m.footer_support_note()}</p>
      </aside>
    </div>

    <footer class="colophon">
      <div>
        <span>{m.footer_copyright()}</span>
      </div>
      <div class="links" aria-label="Footer links">
        <span>{m.footer_link_about()}</span>
        <span>{m.footer_link_contact()}</span>
        <span>{m.footer_link_privacy()}</span>
      </div>
      <span class="mark">Jash-Muun</span>
    </footer>
  </div>
</section>

<style>
  .panel {
    display: inline-flex;
    vertical-align: top;
    height: 100dvh;
    position: relative;
    padding: var(--panel-pad);
    padding-top: calc(var(--nav-h) + 16px);
    padding-bottom: var(--ui-bottom);
    align-items: stretch;
    background: var(--paper);
    white-space: normal;
  }

  .panel--w-full {
    width: 100vw;
  }

  .footer-inner {
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
    display: grid;
    grid-template-rows: 1fr auto;
    gap: 28px;
    min-height: calc(100dvh - var(--nav-h) - 16px - var(--ui-bottom));
  }

  .footer-grid {
    padding-bottom: 16px;
  }

  .partners {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .label {
    font-size: 10.5px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--muted);
  }

  .logos {
    display: flex;
    gap: 48px;
    align-items: center;
    padding: 8px 0;
  }

  .plogo {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 72px;
  }

  .plogo.main {
    color: var(--moss);
  }

  .plogo.support {
    color: var(--ink);
  }

  .note {
    font-size: 12px;
    line-height: 1.55;
    color: var(--muted);
    max-width: 52ch;
    margin-bottom: 0;
  }

  .colophon {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    padding-top: 28px;
    border-top: 1px solid rgba(29, 27, 22, 0.15);
    font-size: 12px;
    color: var(--muted);
    letter-spacing: 0.04em;
  }

  .links {
    display: flex;
    gap: 24px;
  }

  .mark {
    font-family: 'Noto Sans', sans-serif;
    font-size: 13px;
    color: var(--ink);
    font-weight: 600;
    letter-spacing: 0.02em;
  }

  /* ── Mobile (< 768px) — vertical stacked layout ───────────────────── */
  @media (max-width: 767px) {
    .panel {
      display: flex;
      flex-direction: column;
      height: auto;
      width: 100%;
    }

    .footer-inner {
      min-height: auto;
    }

    .logos {
      gap: 28px;
    }

    .colophon {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }
  }
</style>
