<script lang="ts">
  import { resolve } from '$app/paths';
  import type { Locale } from '$lib/i18n';
  import type { PracticeSummary } from '$lib/types/datocms';

  const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI'];

  let { practice, locale, index, total }: {
    practice: PracticeSummary;
    locale: Locale;
    index: number;
    total: number;
  } = $props();

  const num = $derived(String(index + 1).padStart(2, '0'));
  const tot = $derived(String(total).padStart(2, '0'));
  const indexLabel = $derived(`${num} / ${tot}`);
  const room = $derived(`Room ${ROMAN[index] ?? String(index + 1)}`);
  const imageUrl = $derived(practice.coverImage?.url ?? '');
  const practiceHref = $derived(resolve(`/${locale}/practices/${practice.slug}/`));
</script>

<a href={practiceHref} class="p-card-link" aria-label={practice.title}>
  <article class="p-card">
    {#if imageUrl}
      <div class="img" style="background-image: url('{imageUrl}')"></div>
    {:else}
      <div class="img img--empty"></div>
    {/if}
    <div class="shade"></div>
    <div class="content">
      <div class="kicker">{room}</div>
      <h3>{practice.title}</h3>
      {#if practice.excerpt}
        <p>{practice.excerpt}</p>
      {/if}
      <div class="row">
        <span class="num">{indexLabel}</span>
        <span class="explore">Explore <span aria-hidden="true">→</span></span>
      </div>
    </div>
  </article>
</a>

<style>
  .p-card {
    flex: 0 0 auto;
    width: clamp(300px, 24vw, 360px);
    height: calc(100dvh - var(--nav-h) - var(--ui-bottom) - 48px);
    max-height: 620px;
    min-height: 440px;
    background: #000;
    border-radius: 4px;
    overflow: hidden;
    position: relative;
    box-shadow:
      0 1px 0 rgba(0,0,0,.04),
      0 24px 48px -24px rgba(30,27,20,.22),
      0 6px 16px -8px rgba(30,27,20,.1);
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    color: #fff;
    transition: box-shadow .5s;
  }
  .p-card:hover {
    box-shadow:
      0 1px 0 rgba(0,0,0,.04),
      0 36px 60px -28px rgba(30,27,20,.35),
      0 10px 20px -10px rgba(30,27,20,.18);
  }
  .img {
    position: absolute;
    inset: 0;
    background-size: cover;
    background-position: center;
    transition: transform 1.2s cubic-bezier(.2,.7,.2,1);
  }
  .p-card:hover .img { transform: scale(1.04); }
  .shade {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      180deg,
      rgba(15,12,6,0) 30%,
      rgba(15,12,6,.25) 55%,
      rgba(15,12,6,.85) 100%
    );
  }
  .content {
    position: relative;
    padding: 28px 28px 26px;
  }
  .kicker {
    font-size: 11px;
    letter-spacing: .22em;
    text-transform: uppercase;
    color: rgba(255,255,255,.78);
    margin-bottom: 12px;
    display: flex;
    gap: 10px;
    align-items: center;
  }
  .kicker::before {
    content: "";
    width: 18px;
    height: 1px;
    background: rgba(255,255,255,.6);
  }
  h3 {
    font-family: 'Noto Serif Display', serif;
    font-weight: 400;
    font-size: 30px;
    line-height: 1.05;
    letter-spacing: -.01em;
    margin-bottom: 12px;
    text-wrap: balance;
  }
  p {
    font-size: 13.5px;
    line-height: 1.5;
    color: rgba(255,255,255,.8);
    max-width: 32ch;
  }
  .row {
    margin-top: 22px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    letter-spacing: .08em;
  }
  .p-card-link {
    display: contents;
  }
  .img--empty {
    background: rgba(15,12,6,.4);
  }
  .num { color: rgba(255,255,255,.55); letter-spacing: .18em; }
  .explore {
    color: rgba(255,255,255,.7);
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    letter-spacing: .08em;
  }

  /* ── Mobile (< 768px) — compact card for horizontal strip ─────────── */
  @media (max-width: 767px) {
    .p-card {
      width: 240px;
      height: 320px;
      min-height: auto;
      max-height: none;
    }
  }
</style>
