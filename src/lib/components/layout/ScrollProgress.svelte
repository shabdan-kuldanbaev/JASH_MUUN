<script lang="ts">
  import { m } from '$i18n';

  let {
    current = 1,
    total = 4,
    progress = 0,
    onPrev,
    onNext
  }: {
    current?: number;
    total?: number;
    progress?: number;
    onPrev?: () => void;
    onNext?: () => void;
  } = $props();
</script>

<div class="scroll-status" role="navigation" aria-label={m.scroll_progress()}>
  <button
    class="ss-btn"
    onclick={onPrev}
    disabled={current <= 1}
    aria-label={m.scroll_previous()}
  >
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8">
      <path d="M10 3L5 8l5 5"/>
    </svg>
  </button>

  <div class="ss-track" aria-hidden="true">
    <div class="ss-dots-line"></div>
    <div class="ss-fill" style="width: {progress * 100}%"></div>
  </div>

  <div class="ss-index">
    <b>{String(current).padStart(2, '0')}</b>
    <span>/</span>
    <span>{String(total).padStart(2, '0')}</span>
  </div>

  <button
    class="ss-btn"
    onclick={onNext}
    disabled={current >= total}
    aria-label={m.scroll_next()}
  >
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8">
      <path d="M6 3l5 5-5 5"/>
    </svg>
  </button>
</div>

<style>
  .scroll-status {
    position: fixed;
    right: var(--gutter);
    bottom: 32px;
    z-index: 80;
    display: flex;
    align-items: center;
    gap: 16px;
    font-size: 13px;
    letter-spacing: .01em;
    color: var(--ink);
    font-weight: 500;
    background: rgba(241,235,224,.82);
    backdrop-filter: blur(10px) saturate(1.1);
    -webkit-backdrop-filter: blur(10px) saturate(1.1);
    padding: 10px 16px;
    border-radius: 999px;
    box-shadow:
      0 1px 0 rgba(29,27,22,.06),
      0 8px 24px -12px rgba(29,27,22,.18);
  }
  .ss-btn {
    width: 28px; height: 28px;
    border-radius: 50%;
    border: 0;
    background: transparent;
    display: grid;
    place-items: center;
    cursor: pointer;
    color: var(--ink);
    transition: background .2s, color .2s;
  }
  .ss-btn:hover { background: var(--ink); color: var(--paper); }
  .ss-btn svg { width: 14px; height: 14px; }
  .ss-btn:disabled { opacity: .28; cursor: default; }
  .ss-btn:disabled:hover { background: transparent; color: var(--ink); }

  .ss-track {
    position: relative;
    width: 220px; height: 14px;
    display: flex;
    align-items: center;
  }
  .ss-dots-line {
    position: absolute;
    left: 0; right: 0; top: 50%;
    transform: translateY(-50%);
    height: 2px;
    background-image: radial-gradient(circle, rgba(29,27,22,.4) 1px, transparent 1.2px);
    background-size: 8px 2px;
    background-repeat: repeat-x;
  }
  .ss-fill {
    position: absolute;
    left: 0; top: 50%;
    transform: translateY(-50%);
    height: 2px;
    background-image: radial-gradient(circle, var(--ink) 1px, transparent 1.2px);
    background-size: 8px 2px;
    background-repeat: repeat-x;
    transition: width .2s;
  }
  .ss-index {
    font-variant-numeric: tabular-nums;
    color: var(--muted);
    font-size: 12px;
    letter-spacing: .12em;
  }
  .ss-index b { color: var(--ink); font-weight: 500; }
</style>
