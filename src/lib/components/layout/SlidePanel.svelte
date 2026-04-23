<script lang="ts">
  import { panel } from '$lib/panel.svelte';
  import { cubicOut, cubicIn, cubicInOut } from 'svelte/easing';
  import { browser } from '$app/environment';
  import type { Snippet } from 'svelte';

  let {
    language,
    practices,
    archive
  }: {
    language?: Snippet;
    practices?: Snippet;
    archive?: Snippet;
  } = $props();

  const isOpen = $derived(panel.active !== null);

  const activeSnippet = $derived(
    panel.active === 'language'
      ? language
      : panel.active === 'practices'
        ? practices
        : panel.active === 'archive'
          ? archive
          : null
  );

  const inX = $derived(
    panel.direction === 'right' ? '100%' : panel.direction === 'left' ? '-100%' : '0'
  );
  const outX = $derived(
    panel.direction === 'right' ? '-100%' : panel.direction === 'left' ? '100%' : '0'
  );
  const duration = $derived(panel.direction !== null ? 320 : 0);

  function slideX(
    _node: Element,
    params: { x: string; duration?: number; easing?: (t: number) => number }
  ) {
    return {
      duration: params.duration ?? 300,
      easing: params.easing ?? cubicOut,
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
      <!-- Content area: position:relative + overflow:hidden clips the sliding content elements -->
      <div class="shell-body">
        {#key panel.contentKey}
          <div
            class="content-slide"
            in:slideX={{ x: inX, duration, easing: cubicOut }}
            out:slideX={{ x: outX, duration, easing: cubicIn }}
          >
            {#if activeSnippet}
              {@render activeSnippet()}
            {/if}
          </div>
        {/key}
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

  /* Clipping container — overflow:hidden creates the wipe effect during transitions */
  .shell-body {
    flex: 1;
    position: relative;
    overflow: hidden;
  }

  /* Absolute positioning allows old and new content to coexist during the transition */
  .content-slide {
    position: absolute;
    inset: 0;
    overflow-y: auto;
    padding: clamp(1.5rem, 3vw, 2.5rem) var(--gutter) var(--gutter);
    display: flex;
    flex-direction: column;
  }
</style>
