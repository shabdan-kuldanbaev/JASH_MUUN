<script lang="ts">
  import { onMount } from 'svelte';
  import Header from '$components/layout/Header.svelte';
  import ContentFooter from '$components/layout/ContentFooter.svelte';

  let { children, data } = $props();

  onMount(() => {
    // Enable normal vertical scrolling for content pages.
    // The homepage restores overflow: hidden in its own onMount/cleanup.
    document.body.style.overflow = 'auto';
    return () => {
      document.body.style.overflow = '';
    };
  });
</script>

<Header locale={data.locale} />

<div class="content-shell">
  {@render children()}
  <ContentFooter />
</div>

<style>
  .content-shell {
    padding-top: var(--nav-h);
    min-height: 100vh;
    background: var(--paper);
    /* `clip` (not `hidden`) so it doesn't become a scroll container — keeps
       horizontal full-bleed contained while letting `position: sticky` work. */
    overflow-x: clip;
  }
</style>
