<script lang="ts">
  // shadcn-style skeleton, adapted to project tokens. Subtle shimmer, reduced-motion aware.
  interface Props {
    width?: string;
    height?: string;
    radius?: string;
    class?: string;
  }
  let { width = '100%', height = '1rem', radius = '12px', class: klass = '' }: Props = $props();
</script>

<span
  class="skeleton {klass}"
  style="width:{width};height:{height};border-radius:{radius};"
  aria-hidden="true"
></span>

<style>
  .skeleton {
    display: block;
    background: linear-gradient(
      100deg,
      var(--paper-2) 30%,
      color-mix(in srgb, var(--line) 55%, var(--paper-2)) 50%,
      var(--paper-2) 70%
    );
    background-size: 200% 100%;
    animation: shimmer 1.4s ease-in-out infinite;
  }
  @keyframes shimmer {
    from {
      background-position: 200% 0;
    }
    to {
      background-position: -200% 0;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .skeleton {
      animation: none;
      background: var(--paper-2);
    }
  }
</style>
