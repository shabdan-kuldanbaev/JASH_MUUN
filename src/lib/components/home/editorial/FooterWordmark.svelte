<script lang="ts">
  import { onMount } from 'svelte';
  import { asset } from '$app/paths';
  import { m } from '$i18n';

  let footerEl = $state<HTMLElement | null>(null);

  onMount(() => {
    if (!footerEl) return;
    const root = document.documentElement;
    // Report the footer height so the page reserves the reveal gap below itself.
    // NOTE: `--footer-h` is intentionally NOT cleared on unmount. Homepage and
    // content pages each render their own FooterWordmark, so on a homepage↔content
    // navigation the outgoing instance's teardown could wipe the value the incoming
    // one just set — collapsing the reserve gap to 0 and hiding the fixed footer
    // behind the content (only draggable into view via overscroll). Every page has a
    // footer that overwrites this on mount, so leaving the last value is safe.
    const setH = () => root.style.setProperty('--footer-h', `${footerEl!.offsetHeight}px`);
    const ro = new ResizeObserver(setH);
    ro.observe(footerEl);
    setH();

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      footerEl.style.setProperty('--reveal', '1');
      return () => {
        ro.disconnect();
      };
    }

    // `--reveal` (0→1) tracks how much of the fixed footer the page has uncovered
    // in its last footer-height of scroll; the wordmark rides it up, hides down.
    let raf = 0;
    let lastP = -1;
    const update = () => {
      raf = 0;
      const h = footerEl!.offsetHeight || 1;
      const max = root.scrollHeight - window.innerHeight;
      const p = Math.min(1, Math.max(0, (window.scrollY - (max - h)) / h));
      // Skip redundant style writes (transform on a fixed layer) while the footer
      // is off-screen and p stays pinned at 0 — cuts compositor churn on iOS momentum.
      if (p === lastP) return;
      lastP = p;
      footerEl!.style.setProperty('--reveal', String(p));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
    return () => {
      ro.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
      // `--footer-h` deliberately left in place (see note above) — the next page's
      // footer overwrites it; clearing it here can collapse the reveal gap mid-nav.
    };
  });
</script>

<footer class="content-footer" bind:this={footerEl}>
  <img
    class="petroglyph petro-footer"
    src={asset('/assets/petroglyphs/2.svg')}
    alt=""
    aria-hidden="true"
  />
  <div class="footer-inner">
    <!-- Funder visibility is contractual, so it renders unconditionally: every page
         carries this footer, so every page carries the lockups and the credit line. -->
    <div class="credit">
      <div class="credit-logos">
        <span class="credit-logo credit-logo--mark"
          ><img src={asset('/assets/main-logo.svg')} alt="Jash-Muun" /></span
        >
        <!-- Donor lockups: official ALIPH + EU artwork, brand colour, heights tuned so
             the ALIPH square and the EU flag read at the same optical size. -->
        <a
          class="credit-logo credit-logo--aliph"
          href="https://www.aliph-foundation.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src={asset('/assets/aliph-supported-by.svg')}
            alt="Supported by ALIPH — International alliance for the protection of heritage"
          />
        </a>
        <span class="credit-logo credit-logo--eu"
          ><img
            src={asset('/assets/eu-cofunded.png')}
            alt="Co-funded by the European Union"
          /></span
        >
      </div>
      <div class="credit-text">
        <!-- footer_funding_statement — ALIPH grant agreement art. 15 credit line, verbatim. -->
        <p class="funding-statement">{m.footer_funding_statement()}</p>
        <!-- footer_provenance_note — verbatim. -->
        <p class="support-note">{m.footer_provenance_note()}</p>
      </div>
    </div>
    <div class="colophon">
      <!-- footer_copyright — verbatim. -->
      <span>{m.footer_copyright()}</span>
    </div>
  </div>
  <!-- Full-width wordmark — rides the reveal, hides down when the footer leaves view -->
  <div class="footer-word" aria-label="Jash Muun">
    <span class="fw-inner">JASH&nbsp;MUUN</span>
  </div>
</footer>

<style>
  .content-footer {
    position: fixed;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 0;
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

  /* Logos above, credit line below at every width — side by side would cap how
     large the lockups can get before crowding the statement off the line. */
  .credit {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: clamp(22px, 2.6vw, 34px);
    max-width: 1180px;
    margin-bottom: clamp(24px, 3vw, 40px);
    padding-bottom: clamp(20px, 2.4vw, 32px);
    border-bottom: 1px solid var(--line);
  }

  .credit-logos {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: clamp(22px, 3vw, 48px);
    row-gap: clamp(20px, 2.4vw, 32px);
    max-width: 100%;
  }

  .credit-logo {
    display: flex;
    align-items: center;
    max-width: 100%;
  }

  /* Each lockup gets its own height so the ALIPH square and the EU flag —
     which sit at different fractions of their artwork — match optically.
     The 0.764 ratio between --aliph and --eu holds across the whole clamp
     range, so they stay matched at every viewport. */
  .credit-logo--mark {
    height: clamp(56px, 6vw, 88px);
  }

  /* The floors are set by the narrowest phone: at 320px the EU lockup is the
     widest of the three (4.48:1), and 55px of height is what still fits inside
     the gutters. Everything else follows from the 0.764 ratio. */
  .credit-logo--aliph {
    height: clamp(72px, 7.6vw, 112px);
  }

  .credit-logo--eu {
    height: clamp(55px, 5.8vw, 86px);
  }

  /* max-width + contain is the overflow guard: on a screen too narrow for a
     lockup at its floor height, the artwork scales down inside the box instead
     of pushing the page sideways. */
  .credit-logo img {
    height: 100%;
    width: auto;
    max-width: 100%;
    object-fit: contain;
    object-position: left center;
    display: block;
  }

  .credit-text {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .funding-statement {
    max-width: 52ch;
    font-size: 13px;
    line-height: 1.6;
    color: var(--ink-2);
    letter-spacing: 0.01em;
  }

  .support-note {
    max-width: 52ch;
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
    overflow: hidden; /* mask for the wordmark's slide */
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

  .footer-word .fw-inner {
    display: inline-block;
    padding-bottom: 0.22em; /* room for the J descender inside the mask */
    transform: translateY(calc((1 - var(--reveal, 1)) * 100%));
    will-change: transform;
  }

  /* Below this the three lockups stop fitting on one line and wrap to two;
     tightening the gaps keeps the second row reading as part of the same block.
     Heights stay on the clamp — no override, so there is no size jump here. */
  @media (max-width: 760px) {
    .credit-logos {
      gap: 20px;
      row-gap: 22px;
    }
  }

  @media (max-width: 640px) {
    .colophon {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
    }
  }
</style>
