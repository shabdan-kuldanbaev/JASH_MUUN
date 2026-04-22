<script lang="ts">
  /**
   * StructuredTextRenderer
   *
   * Renders a DatoCMS Structured Text field (DAST document) into semantic HTML.
   * Supports all standard node types plus three custom block types:
   *   - ImageBlockRecord
   *   - QuoteBlockRecord
   *   - YoutubeEmbedBlockRecord
   *
   * Usage:
   *   <StructuredTextRenderer content={post.content} />
   */
  import type {
    StructuredTextContent,
    DastNode,
    DastSpan,
    CustomBlock,
    ImageBlock,
    QuoteBlock,
  } from '$lib/types/datocms';
  import CmsImage from './CmsImage.svelte';

  let { content }: { content: StructuredTextContent } = $props();

  // Build a lookup map from block id → block record for O(1) access.
  const blockMap = $derived(
    new Map<string, CustomBlock>((content.blocks ?? []).map((b) => [b.id, b]))
  );

  // ── Span mark rendering helpers ──────────────────────────────────────────────

  function markOpen(marks: DastSpan['marks']): string {
    if (!marks?.length) return '';
    return marks
      .map((m) => {
        switch (m) {
          case 'strong': return '<strong>';
          case 'emphasis': return '<em>';
          case 'underline': return '<u>';
          case 'strikethrough': return '<s>';
          case 'code': return '<code>';
          case 'highlight': return '<mark>';
          default: return '';
        }
      })
      .join('');
  }

  function markClose(marks: DastSpan['marks']): string {
    if (!marks?.length) return '';
    return [...marks]
      .reverse()
      .map((m) => {
        switch (m) {
          case 'strong': return '</strong>';
          case 'emphasis': return '</em>';
          case 'underline': return '</u>';
          case 'strikethrough': return '</s>';
          case 'code': return '</code>';
          case 'highlight': return '</mark>';
          default: return '';
        }
      })
      .join('');
  }

  // Render a span node to an HTML string (safe: no user-controllable HTML injection).
  function spanHtml(node: DastSpan): string {
    const escaped = node.value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return `${markOpen(node.marks)}${escaped}${markClose(node.marks)}`;
  }

  // Render inline children (spans and links) to an HTML string.
  function inlineHtml(children: DastNode[]): string {
    return children
      .map((child) => {
        if (child.type === 'span') return spanHtml(child);
        if (child.type === 'link') {
          const href = child.url.replace(/"/g, '&quot;');
          const inner = inlineHtml(child.children);
          return `<a href="${href}">${inner}</a>`;
        }
        return '';
      })
      .join('');
  }
</script>

<!--
  Recursive rendering: Svelte cannot import a component from within itself,
  but svelte:self handles recursion for list items and blockquotes.
  Block-level nodes (paragraph, heading, list, blockquote, code, block)
  are rendered here. Inline content uses the inlineHtml helper above.
-->

{#each content.value.document.children as node}
  {#if node.type === 'paragraph'}
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    <p>{@html inlineHtml(node.children)}</p>

  {:else if node.type === 'heading'}
    {#if node.level === 1}
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      <h1>{@html inlineHtml(node.children)}</h1>
    {:else if node.level === 2}
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      <h2>{@html inlineHtml(node.children)}</h2>
    {:else if node.level === 3}
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      <h3>{@html inlineHtml(node.children)}</h3>
    {:else if node.level === 4}
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      <h4>{@html inlineHtml(node.children)}</h4>
    {:else if node.level === 5}
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      <h5>{@html inlineHtml(node.children)}</h5>
    {:else}
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      <h6>{@html inlineHtml(node.children)}</h6>
    {/if}

  {:else if node.type === 'list'}
    {#if node.style === 'bulleted'}
      <ul>
        {#each node.children as item}
          {#if item.type === 'listItem'}
            <!-- eslint-disable-next-line svelte/no-at-html-tags -->
            <li>{@html inlineHtml(item.children)}</li>
          {/if}
        {/each}
      </ul>
    {:else}
      <ol>
        {#each node.children as item}
          {#if item.type === 'listItem'}
            <!-- eslint-disable-next-line svelte/no-at-html-tags -->
            <li>{@html inlineHtml(item.children)}</li>
          {/if}
        {/each}
      </ol>
    {/if}

  {:else if node.type === 'blockquote'}
    <blockquote>
      {#each node.children as child}
        {#if child.type === 'paragraph'}
          <!-- eslint-disable-next-line svelte/no-at-html-tags -->
          <p>{@html inlineHtml(child.children)}</p>
        {/if}
      {/each}
      {#if node.attribution}
        <cite>{node.attribution}</cite>
      {/if}
    </blockquote>

  {:else if node.type === 'code'}
    <pre><code class={node.language ? `language-${node.language}` : undefined}>{node.code}</code></pre>

  {:else if node.type === 'block'}
    {@const block = blockMap.get(node.item)}
    {#if block}
      {#if block.__typename === 'ImageBlockRecord'}
        {@const b = block as ImageBlock}
        <figure class="block-image">
          <CmsImage image={b.image} sizes="(min-width: 900px) 720px, 100vw" />
          {#if b.caption}
            <figcaption>{b.caption}</figcaption>
          {/if}
        </figure>

      {:else if block.__typename === 'QuoteBlockRecord'}
        {@const b = block as QuoteBlock}
        <blockquote class="block-quote">
          <p>{b.quote}</p>
          {#if b.attribution}
            <cite>{b.attribution}</cite>
          {/if}
        </blockquote>

      {/if}
    {/if}
  {/if}
{/each}

<style>
  /* All styles use :global to reach {@html} output and block components */

  :global(.structured-text p),
  p {
    font-size: clamp(16px, 1.8vw, 18px);
    line-height: 1.75;
    color: var(--ink-2);
    max-width: 68ch;
    margin: 0 0 1.4em;
  }

  :global(.structured-text h2),
  h2 {
    font-size: clamp(22px, 2.4vw, 30px);
    font-weight: 400;
    letter-spacing: -.01em;
    line-height: 1.25;
    color: var(--ink);
    margin: 2.4em 0 .8em;
  }

  :global(.structured-text h3),
  h3 {
    font-size: clamp(18px, 2vw, 24px);
    font-weight: 500;
    line-height: 1.3;
    color: var(--ink);
    margin: 2em 0 .6em;
  }

  :global(.structured-text h4),
  h4 {
    font-size: 17px;
    font-weight: 500;
    color: var(--ink);
    margin: 1.6em 0 .5em;
  }

  :global(.structured-text ul),
  ul,
  :global(.structured-text ol),
  ol {
    padding-left: 1.5em;
    margin: 0 0 1.4em;
  }

  :global(.structured-text li),
  li {
    font-size: clamp(16px, 1.8vw, 18px);
    line-height: 1.7;
    color: var(--ink-2);
    margin-bottom: .4em;
  }

  :global(.structured-text blockquote),
  blockquote {
    border-left: 2px solid var(--ochre-2);
    padding-left: clamp(20px, 2.5vw, 36px);
    margin: 2.4em 0;
    font-size: clamp(17px, 2vw, 21px);
    font-style: italic;
    color: var(--ink-2);
    line-height: 1.6;
  }

  :global(.structured-text blockquote cite),
  blockquote cite {
    display: block;
    margin-top: .8em;
    font-size: 13px;
    font-style: normal;
    letter-spacing: .04em;
    color: var(--muted);
  }

  :global(.structured-text pre),
  pre {
    background: var(--paper-2);
    border: 1px solid color-mix(in srgb, var(--ink) 12%, transparent);
    padding: 20px 24px;
    overflow-x: auto;
    margin: 0 0 1.4em;
  }

  :global(.structured-text code),
  code {
    font-family: 'Fira Code', 'Cascadia Code', monospace;
    font-size: .9em;
    color: var(--ochre-2);
    background: color-mix(in srgb, var(--ochre-2) 8%, transparent);
    padding: .1em .3em;
  }

  :global(.structured-text pre code),
  pre code {
    background: none;
    padding: 0;
    font-size: 14px;
    color: var(--ink);
  }

  :global(.structured-text a),
  :global(.structured-text-content a) {
    color: var(--ochre-2);
    border-bottom: 1px solid currentColor;
    transition: opacity .2s;
  }
  :global(.structured-text a:hover),
  :global(.structured-text-content a:hover) { opacity: .7; }

  .block-image { margin: 2.4em 0; }
  .block-image :global(img) { width: 100%; height: auto; display: block; }
  .block-image :global(figcaption) {
    margin-top: 10px;
    font-size: 13px;
    color: var(--muted);
    letter-spacing: .02em;
  }

  .block-quote {
    border-left: 2px solid var(--madder);
    padding-left: clamp(20px, 2.5vw, 36px);
    margin: 2.4em 0;
    font-size: clamp(18px, 2.2vw, 24px);
    font-style: italic;
    color: var(--ink-2);
    line-height: 1.6;
  }

  .block-video { margin: 2.4em 0; }
</style>
