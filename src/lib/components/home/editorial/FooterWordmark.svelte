<script lang="ts">
  import { asset } from '$app/paths';
  import { m } from '$i18n';
  import { rise } from '$lib/actions/editorialReveal';

  // Content pages have no About block, so the footer carries the ALIPH support credit (homepage keeps it in AboutStatement).
  let { credit = false }: { credit?: boolean } = $props();
</script>

<footer class="content-footer">
  <img
    class="petroglyph petro-footer"
    src={asset('/assets/petroglyphs/2.svg')}
    alt=""
    aria-hidden="true"
  />
  <div class="footer-inner">
    {#if credit}
      <!-- footer_support_note — verbatim (ALIPH credit + provenance). -->
      <p class="support-note">{m.footer_support_note()}</p>
    {/if}
    <div class="colophon">
      <!-- footer_copyright — verbatim. -->
      <span>{m.footer_copyright()}</span>
    </div>
  </div>
  <!-- Full-width wordmark — masked rise on entry -->
  <div class="footer-word" data-rise use:rise aria-label="Jash Muun">
    <span class="rise-inner">JASH&nbsp;MUUN</span>
  </div>
</footer>

<style>
  .content-footer {
    position: relative;
    overflow: clip;
    background: var(--paper-2);
    padding-bottom: clamp(8px, 1.5vw, 24px);
  }

  .petro-footer {
    top: 12px;
    right: 6%;
    width: clamp(115px, 11vw, 170px);
    opacity: 0.06;
    transform: rotate(6deg);
  }

  .footer-inner {
    position: relative;
    z-index: 1;
    max-width: var(--home-w);
    margin: 0 auto;
    padding: clamp(40px, 5vw, 72px) var(--gutter) clamp(16px, 2vw, 28px);
  }

  .support-note {
    max-width: 62ch;
    margin-bottom: clamp(20px, 2.4vw, 34px);
    padding-bottom: clamp(16px, 2vw, 26px);
    border-bottom: 1px solid var(--line);
    font-size: 12.5px;
    line-height: 1.65;
    color: var(--muted);
    letter-spacing: 0.01em;
  }

  .colophon {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: var(--muted);
    letter-spacing: 0.04em;
  }

  .footer-word {
    font-family: Jost, sans-serif;
    font-weight: 600;
    font-size: clamp(40px, 16.4vw, 300px);
    line-height: 1;
    letter-spacing: -0.03em;
    color: var(--ink);
    text-align: center;
    white-space: nowrap;
    padding: 0.14em clamp(16px, 3vw, 48px) 0;
    user-select: none;
  }

  /* Extra room under the J descender so the rise mask never clips it. */
  .footer-word .rise-inner {
    padding-bottom: 0.22em;
  }

  @media (max-width: 640px) {
    .colophon {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
    }
  }
</style>
