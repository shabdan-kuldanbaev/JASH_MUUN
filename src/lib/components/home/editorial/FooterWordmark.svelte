<script lang="ts">
  import { onMount } from 'svelte';
  import { asset } from '$app/paths';
  import { m } from '$i18n';

  // Content pages have no About block, so the footer carries the ALIPH support credit (homepage keeps it in AboutStatement).
  let { credit = false }: { credit?: boolean } = $props();

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
    {#if credit}
      <div class="credit">
        <div class="credit-logos">
          <span class="credit-logo"
            ><img src={asset('/assets/main-logo.svg')} alt="Jash-Muun" /></span
          >
          <span class="credit-logo"
            ><img src={asset('/assets/supporting-logo.svg')} alt="ALIPH" /></span
          >
          <span class="credit-logo"
            ><img src={asset('/assets/eu-logo.svg')} alt="European Union" /></span
          >
        </div>
        <!-- footer_support_note — verbatim (ALIPH credit + provenance). -->
        <p class="support-note">{m.footer_support_note()}</p>
      </div>
    {/if}
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

  .credit {
    display: flex;
    align-items: center;
    max-width: 960px;
    margin-bottom: clamp(24px, 3vw, 40px);
    padding-bottom: clamp(20px, 2.4vw, 32px);
    border-bottom: 1px solid var(--line);
  }

  .credit-logos {
    display: flex;
    align-items: center;
    gap: clamp(22px, 2.6vw, 40px);
    flex-shrink: 0;
    padding-right: clamp(26px, 3.5vw, 48px);
    margin-right: clamp(26px, 3.5vw, 48px);
    border-right: 1px solid var(--line);
  }

  .credit-logo {
    display: flex;
    align-items: center;
    height: clamp(38px, 4vw, 52px);
  }

  .credit-logo img {
    height: 100%;
    width: auto;
    display: block;
  }

  .support-note {
    max-width: 60ch;
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

  @media (max-width: 760px) {
    .credit {
      flex-direction: column;
      align-items: flex-start;
      gap: 20px;
    }

    .credit-logos {
      padding-right: 0;
      margin-right: 0;
      border-right: none;
      gap: 26px;
    }

    .credit-logo {
      height: 40px;
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
