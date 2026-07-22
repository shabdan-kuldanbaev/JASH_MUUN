<script lang="ts">
  import '../app.css';
  import Preloader from '$components/layout/Preloader.svelte';
  let { children } = $props();
</script>

<Preloader />
{@render children()}
