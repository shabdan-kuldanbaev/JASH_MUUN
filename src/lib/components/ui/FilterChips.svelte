<script lang="ts">
  // Shared category-filter chip row (Material pill style). Used by the practices
  // index and the archive so the chip markup + styling lives in one place.
  interface Option {
    value: string;
    label: string;
  }

  let {
    options,
    active,
    allLabel,
    ariaLabel,
    onselect
  }: {
    /** Category chips (excluding the leading "all" chip). */
    options: Option[];
    /** Currently active value — `'all'` or one of the option values. */
    active: string;
    /** Label for the leading "all" chip. */
    allLabel: string;
    ariaLabel: string;
    onselect: (value: string) => void;
  } = $props();
</script>

<div class="filter" role="group" aria-label={ariaLabel}>
  <button
    type="button"
    class="chip"
    class:active={active === 'all'}
    aria-pressed={active === 'all'}
    onclick={() => onselect('all')}
  >
    {allLabel}
  </button>
  {#each options as o (o.value)}
    <button
      type="button"
      class="chip"
      class:active={active === o.value}
      aria-pressed={active === o.value}
      onclick={() => onselect(o.value)}
    >
      {o.label}
    </button>
  {/each}
</div>

<style>
  .filter {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 28px;
  }
  .chip {
    height: 36px;
    padding: 0 19px;
    border-radius: 999px;
    border: 1px solid var(--line);
    background: transparent;
    color: var(--ink-2);
    font-family: inherit;
    font-size: 13px;
    letter-spacing: 0.2px;
    cursor: pointer;
    transition:
      background 0.2s ease,
      color 0.2s ease,
      border-color 0.2s ease;
  }
  .chip:hover:not(.active) {
    border-color: var(--ink);
    color: var(--ink);
  }
  .chip.active {
    background: var(--ink);
    border-color: var(--ink);
    color: var(--paper);
  }
</style>
