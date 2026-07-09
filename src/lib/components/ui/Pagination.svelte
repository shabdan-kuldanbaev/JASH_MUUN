<script lang="ts">
  import { m } from '$i18n';

  interface Props {
    page: number;
    totalPages: number;
    ariaLabel: string;
    /** 'link' → route <a href> (SEO/no-JS); 'button' → client callback (filtered view). */
    mode?: 'link' | 'button';
    /** Required for mode='link': build the ALREADY-RESOLVED href for a page number. */
    hrefFor?: (n: number) => string;
    /** Required for mode='button'. */
    onnavigate?: (n: number) => void;
  }
  let { page, totalPages, ariaLabel, mode = 'link', hrefFor, onnavigate }: Props = $props();

  const pages = $derived(Array.from({ length: totalPages }, (_, i) => i + 1));
  const clamp = (n: number) => Math.min(totalPages, Math.max(1, n));
</script>

{#if totalPages > 1}
  <nav class="pagination" aria-label={ariaLabel}>
    {#snippet cell(
      n: number,
      label: string,
      extraClass: string,
      current: boolean,
      disabled: boolean
    )}
      {#if mode === 'link' && hrefFor && !disabled}
        <!-- eslint-disable svelte/no-navigation-without-resolve -- hrefFor returns an already-resolved path (see PracticesIndex/ArticlesIndex pageHref) -->
        <a
          class="pg {extraClass}"
          class:active={current}
          href={hrefFor(n)}
          aria-current={current ? 'page' : undefined}
          aria-label="{m.pagination_page_aria()} {n}"
        >
          {label}
        </a>
        <!-- eslint-enable svelte/no-navigation-without-resolve -->
      {:else}
        <button
          class="pg {extraClass}"
          class:active={current}
          type="button"
          {disabled}
          aria-current={current ? 'page' : undefined}
          aria-label="{m.pagination_page_aria()} {n}"
          onclick={() => onnavigate?.(clamp(n))}
        >
          {label}
        </button>
      {/if}
    {/snippet}

    {@render cell(page - 1, `← ${m.pagination_prev()}`, 'pg--edge', false, page === 1)}
    {#each pages as n (n)}
      {@render cell(n, String(n), '', n === page, false)}
    {/each}
    {@render cell(page + 1, `${m.pagination_next()} →`, 'pg--edge', false, page === totalPages)}
  </nav>
{/if}

<style>
  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    padding: clamp(36px, 5vw, 52px) 0 clamp(8px, 1vw, 16px);
  }
  .pg {
    min-width: 40px;
    height: 40px;
    padding: 0 12px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--line);
    border-radius: 8px;
    background: transparent;
    color: var(--ink);
    font-family: inherit;
    font-size: 14px;
    font-weight: 500;
    text-decoration: none;
    cursor: pointer;
    transition:
      background 0.2s ease,
      color 0.2s ease,
      border-color 0.2s ease;
  }
  .pg:hover:not(:disabled):not(.active) {
    border-color: var(--ink);
  }
  .pg.active {
    background: var(--ink);
    color: var(--paper);
    border-color: var(--ink);
  }
  .pg--edge {
    border-color: transparent;
    color: var(--ink-2);
  }
  .pg:disabled {
    opacity: 0.4;
    cursor: default;
  }
</style>
