<script lang="ts">
  import { asset } from '$app/paths';

  export interface InterludeData {
    chapterLabel: string;
    image: string;
    imageCaption: string;
    heading: string;
    paragraphs: string[];
    pullQuote: string;
    pullCite: string;
  }

  let { data }: { data: InterludeData } = $props();
  const imageUrl = $derived(asset(data.image as `/${string}`));
</script>

<div class="panel panel--alt interlude" data-scroll-screen aria-label="Curator's Note">
  <div class="interlude-layout">
    <div class="interlude-img">
      <div class="img" style={`background-image: url('${imageUrl}')`}></div>
      <span class="tag">{data.imageCaption}</span>
    </div>
    <div class="interlude-text">
      <div class="chapter">{data.chapterLabel}</div>
      <h2>{data.heading}</h2>
      {#each data.paragraphs as para, index (`${index}-${para}`)}
        <p>{para}</p>
      {/each}
      <blockquote class="pull">
        {data.pullQuote}
        <cite>{data.pullCite}</cite>
      </blockquote>
    </div>
  </div>
</div>

<style>
  .panel {
    display: inline-flex;
    vertical-align: top;
    height: 100vh;
    position: relative;
    padding: var(--panel-pad);
    padding-top: calc(var(--nav-h) + 16px);
    padding-bottom: var(--ui-bottom);
    align-items: stretch;
    white-space: normal;
  }

  .panel--alt {
    background: var(--paper-2);
  }

  .interlude-layout {
    width: 100vw;
    display: grid;
    grid-template-columns: 1.35fr 1fr;
    gap: clamp(48px, 6vw, 100px);
    align-items: stretch;
    min-height: calc(100vh - var(--nav-h) - 16px - var(--ui-bottom));
  }

  .interlude-img {
    position: relative;
    border-radius: 6px;
    overflow: hidden;
    background: #000;
    box-shadow:
      0 24px 48px -24px rgba(30, 27, 20, 0.25),
      0 6px 16px -8px rgba(30, 27, 20, 0.12);
    align-self: stretch;
  }

  .img {
    position: absolute;
    inset: 0;
    background-size: cover;
    background-position: center;
  }

  .tag {
    position: absolute;
    left: 20px;
    bottom: 18px;
    color: #fff;
    font-size: 11px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    background: rgba(10, 8, 4, 0.4);
    backdrop-filter: blur(6px);
    padding: 10px 14px;
    border-radius: 2px;
  }

  .interlude-text {
    align-self: center;
    max-width: 460px;
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
    width: 32px;
    height: 1px;
    background: var(--ochre-2);
    flex-shrink: 0;
  }

  h2 {
    font-family: 'Noto Sans', sans-serif;
    font-weight: 700;
    font-size: clamp(40px, 3.8vw, 64px);
    line-height: 1.04;
    letter-spacing: -0.025em;
    margin-bottom: 24px;
    text-wrap: balance;
  }

  p {
    font-size: 16px;
    line-height: 1.65;
    color: var(--ink-2);
    margin-bottom: 14px;
    max-width: 44ch;
  }

  .pull {
    margin-top: 28px;
    padding-left: 20px;
    border-left: 2px solid var(--ochre-2);
    font-family: 'Noto Sans', sans-serif;
    font-style: italic;
    font-weight: 400;
    font-size: 19px;
    line-height: 1.5;
    color: var(--ink);
  }

  .pull cite {
    display: block;
    margin-top: 10px;
    font-style: normal;
    font-family: 'Noto Sans', sans-serif;
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--muted);
  }
</style>
