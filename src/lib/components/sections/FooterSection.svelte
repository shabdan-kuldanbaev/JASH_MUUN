<script lang="ts">
  import { asset } from '$app/paths';
  import { m } from '$i18n';

  let email = $state('');
  let submitted = $state(false);
  const mainLogoSrc = asset('/assets/main-logo.svg');
  const supportingLogoSrc = asset('/assets/supporting-logo.svg');

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    submitted = true;
    email = '';
  }
</script>

<section
  class="panel panel--w-full footer-wrap"
  data-scroll-screen
  aria-label={m.footer_aria_section()}
>
  <div class="footer-inner">
    <div class="footer-grid">
      <div class="footer-left">
        <div class="chapter">{m.footer_chapter()}</div>
        <h2>{m.footer_title_line_1()}<br />{m.footer_title_line_2()}</h2>
        <p>{m.footer_body()}</p>
        <form class="news" onsubmit={handleSubmit}>
          <input
            type="email"
            placeholder={m.footer_email_placeholder()}
            aria-label={m.footer_email_label()}
            bind:value={email}
            required
          />
          <button type="submit">
            {submitted ? m.footer_thank_you() : m.footer_subscribe()}
          </button>
        </form>
      </div>

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
    display: grid;
    grid-template-columns: 1.15fr 1fr;
    gap: clamp(48px, 6vw, 120px);
    align-items: start;
    padding-bottom: 16px;
  }

  .chapter {
    font-size: 11px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--ochre-2);
    display: flex;
    gap: 14px;
    align-items: center;
    margin-bottom: 20px;
  }

  .chapter::before {
    content: '';
    display: inline-block;
    width: 32px;
    height: 1px;
    background: var(--ochre-2);
  }

  h2 {
    font-family: 'Noto Sans', sans-serif;
    font-weight: 700;
    font-size: clamp(44px, 4vw, 68px);
    line-height: 1.02;
    letter-spacing: -0.025em;
    margin-bottom: 24px;
    text-wrap: balance;
  }

  p {
    font-size: 15px;
    line-height: 1.65;
    color: var(--ink-2);
    max-width: 46ch;
    margin-bottom: 22px;
  }

  .news {
    display: flex;
    align-items: center;
    border-bottom: 1px solid var(--ink);
    padding-bottom: 8px;
    max-width: 420px;
    gap: 0;
  }

  .news input {
    flex: 1;
    border: 0;
    background: transparent;
    outline: 0;
    font-family: inherit;
    font-size: 15px;
    color: var(--ink);
    padding: 8px 4px;
  }

  .news input::placeholder {
    color: var(--muted);
  }

  .news button {
    border: 0;
    background: transparent;
    font-family: inherit;
    font-size: 13px;
    letter-spacing: 0.08em;
    color: var(--ink);
    cursor: pointer;
    text-transform: uppercase;
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

    .footer-grid {
      grid-template-columns: 1fr;
      gap: 40px;
    }

    h2 {
      font-size: clamp(32px, 9vw, 48px);
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
