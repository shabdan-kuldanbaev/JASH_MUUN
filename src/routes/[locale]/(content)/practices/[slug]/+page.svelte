<script lang="ts">
  import { resolve } from '$app/paths';
  import type { PageData } from './$types';
  import type { GalleryItem } from '$lib/types/datocms';
  import { m, LOCALES } from '$i18n';
  import SeoHead from '$cms/SeoHead.svelte';
  import CmsImage from '$cms/CmsImage.svelte';
  import StructuredTextRenderer from '$cms/StructuredTextRenderer.svelte';
  import GalleryGrid from '$cms/GalleryGrid.svelte';
  import YouTubeEmbed from '$cms/YouTubeEmbed.svelte';

  let { data }: { data: PageData } = $props();

  const date = $derived(
    data.practice.publishedDate
      ? new Date(data.practice.publishedDate).toLocaleDateString(data.locale, {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      : null
  );

  const galleryItems = $derived<GalleryItem[]>(
    (data.practice.gallery ?? []).map((img) => ({
      imageUrl: img.url,
      imageAlt: img.alt ?? data.practice.title,
      postTitle: data.practice.title,
      postSlug: data.practice.slug,
      locale: data.locale,
      publishedDate: data.practice.publishedDate ?? ''
    }))
  );
</script>

<SeoHead
  title={data.practice.seo?.title ?? `${data.practice.title} — Jash-Muun`}
  description={data.practice.seo?.description ?? data.practice.excerpt}
  seo={data.practice.seo}
  locale={data.locale}
  alternateLocales={LOCALES.map((locale) => ({
    locale,
    url: resolve(`/${locale}/practices/${data.practice.slug}/`)
  }))}
/>

<article class="article">
  <!-- Header -->
  <header class="article-header">
    <div class="article-meta">
      {#if data.practice.featured}
        <span class="article-featured">{m.common_featured()}</span>
        <span class="article-sep" aria-hidden="true">·</span>
      {/if}
      {#if date}
        <time datetime={data.practice.publishedDate ?? undefined}>{date}</time>
      {/if}
    </div>

    <h1 class="article-title">{data.practice.title}</h1>

    {#if data.practice.excerpt}
      <p class="article-excerpt">{data.practice.excerpt}</p>
    {/if}
  </header>

  <!-- Cover image -->
  {#if data.practice.coverImage}
    <div class="article-cover">
      <CmsImage image={data.practice.coverImage} sizes="100vw" eager={true} />
    </div>
  {/if}

  <!-- Body -->
  {#if data.practice.content}
    <div class="article-body">
      <StructuredTextRenderer content={data.practice.content} />
    </div>
  {/if}

  <!-- YouTube embed -->
  {#if data.practice.youtubeUrl}
    <section class="article-video" aria-label={m.detail_video_aria()}>
      <h2 class="section-label">{m.common_video()}</h2>
      <YouTubeEmbed url={data.practice.youtubeUrl} title={data.practice.title} />
    </section>
  {/if}

  <!-- Gallery -->
  {#if galleryItems.length > 0}
    <section class="article-gallery" aria-label={m.detail_photo_gallery_aria()}>
      <h2 class="section-label">{m.common_gallery()}</h2>
      <GalleryGrid items={galleryItems} locale={data.locale} />
    </section>
  {/if}

  <!-- Back link -->
  <nav class="article-nav" aria-label={m.detail_practice_navigation_aria()}>
    <a href={resolve(`/${data.locale}/practices/`)} class="back-link"
      >← {m.common_back_to_practices()}</a
    >
  </nav>
</article>

<style>
  .article {
    max-width: 900px;
    margin: 0 auto;
    padding: clamp(48px, 6vw, 80px) var(--gutter) clamp(80px, 10vw, 140px);
  }

  .article-header {
    margin-bottom: clamp(32px, 4vw, 56px);
  }

  .article-meta {
    font-size: 12px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--muted);
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 20px;
  }

  .article-featured {
    color: var(--ochre-2);
  }

  .article-sep {
    opacity: 0.5;
  }

  .article-title {
    font-size: clamp(28px, 4.5vw, 58px);
    font-weight: 300;
    letter-spacing: -0.02em;
    line-height: 1.15;
    color: var(--ink);
    margin-bottom: 20px;
    max-width: 22ch;
  }

  .article-excerpt {
    font-size: clamp(16px, 1.8vw, 20px);
    line-height: 1.6;
    color: var(--muted);
    max-width: 54ch;
  }

  .article-cover {
    margin: 0 calc(var(--gutter) * -1) clamp(40px, 5vw, 72px);
    overflow: hidden;
    max-height: 70vh;
  }

  .article-cover :global(img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .article-body {
    border-top: 1px solid color-mix(in srgb, var(--ink) 12%, transparent);
    padding-top: clamp(32px, 4vw, 56px);
    margin-bottom: clamp(56px, 7vw, 96px);
  }

  .article-video,
  .article-gallery {
    border-top: 1px solid color-mix(in srgb, var(--ink) 12%, transparent);
    padding-top: clamp(32px, 4vw, 56px);
    margin-bottom: clamp(56px, 7vw, 96px);
  }

  .section-label {
    font-size: 11px;
    letter-spacing: 0.24em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: clamp(24px, 3vw, 40px);
    font-weight: 400;
  }

  .article-nav {
    border-top: 1px solid color-mix(in srgb, var(--ink) 12%, transparent);
    padding-top: 32px;
  }

  .back-link {
    font-size: 13px;
    letter-spacing: 0.06em;
    color: var(--muted);
    transition: color 0.2s;
  }

  .back-link:hover {
    color: var(--ink);
  }
</style>
