<script lang="ts">
  import { panel } from '$lib/panel.svelte';
  import { cubicInOut } from 'svelte/easing';
  import { browser } from '$app/environment';
  import type { Snippet } from 'svelte';

  let { language }: { language?: Snippet } = $props();

  const isOpen = $derived(panel.active !== null);

  function slideX(
    _node: Element,
    params: { x: string; duration?: number; easing?: (t: number) => number }
  ) {
    return {
      duration: params.duration ?? 300,
      easing: params.easing ?? cubicInOut,
      css: (t: number) => `transform: translateX(calc(${params.x} * ${1 - t})); opacity: ${t}`
    };
  }

  $effect(() => {
    if (!browser) return;
    if (isOpen) {
      document.body.dataset.panelOpen = 'true';
    } else {
      delete document.body.dataset.panelOpen;
    }
  });

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && isOpen) panel.close();
  }
</script>

<svelte:window onkeydown={onKeydown} />

{#if isOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="backdrop" onclick={(e) => e.target === e.currentTarget && panel.close()}>
    <div
      class="shell"
      role="dialog"
      aria-modal="true"
      in:slideX={{ x: '-100%', duration: 380, easing: cubicInOut }}
      out:slideX={{ x: '-100%', duration: 320, easing: cubicInOut }}
    >
      <div class="shell-body">
        {#if language}
          {@render language()}
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .backdrop {
    position: fixed;
    inset: var(--nav-h) 0 0 0;
    z-index: 39;
  }

  .shell {
    position: absolute;
    inset: 0;
    opacity: 1;
    background: var(--paper);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .shell-body {
    flex: 1;
    overflow-y: auto;
    padding-top: clamp(1.5rem, 3vw, 2.5rem);
    padding-bottom: var(--gutter);
    display: flex;
    flex-direction: column;
  }

  /* Mirror header's .nav-inner container for symmetric alignment */
  .shell-body > :global(*) {
    max-width: var(--content-w);
    margin-inline: auto;
    width: 100%;
    padding-inline: var(--gutter);
  }
</style>
