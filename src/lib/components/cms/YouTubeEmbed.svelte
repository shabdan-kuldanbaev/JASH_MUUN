<script lang="ts">
  let {
    url,
    caption = null,
    title = 'YouTube video'
  }: {
    url: string;
    caption?: string | null;
    title?: string;
  } = $props();

  // Extract the video ID without importing the server-side module at runtime.
  // Duplicating the regex here keeps this component client-safe.
  function getYoutubeId(youtubeUrl: string): string | null {
    const match = youtubeUrl.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
    );
    return match?.[1] ?? null;
  }

  const videoId = $derived(getYoutubeId(url));
  const embedUrl = $derived(
    videoId ? `https://www.youtube-nocookie.com/embed/${videoId}?rel=0` : null
  );
</script>

{#if embedUrl}
  <figure class="yt-figure">
    <div class="yt-ratio">
      <iframe
        src={embedUrl}
        {title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
        loading="lazy"
      ></iframe>
    </div>
    {#if caption}
      <figcaption class="yt-caption">{caption}</figcaption>
    {/if}
  </figure>
{/if}

<style>
  .yt-figure {
    margin: 0;
  }

  .yt-ratio {
    position: relative;
    width: 100%;
    padding-bottom: 56.25%; /* 16:9 */
    background: var(--ink);
  }

  .yt-ratio iframe {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: none;
  }

  .yt-caption {
    margin-top: 10px;
    font-size: 13px;
    letter-spacing: 0.02em;
    color: var(--muted);
  }
</style>
