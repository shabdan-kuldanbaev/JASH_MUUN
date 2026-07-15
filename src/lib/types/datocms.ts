import type { Locale } from '$lib/i18n';

// Shared TypeScript types for DatoCMS content.
// Safe to import from both server files and Svelte components (types are erased at runtime).
// Locale constants and helpers live in $i18n, not here.

// ── Shared field shapes ───────────────────────────────────────────────────────

export interface DatoImage {
  url: string;
  alt: string | null;
  width: number;
  height: number;
  blurUpThumb: string | null;
}

export interface DatoSeo {
  title: string | null;
  description: string | null;
  image: Pick<DatoImage, 'url' | 'alt' | 'width' | 'height'> | null;
}

// ── Practice ──────────────────────────────────────────────────────────────────

// Fields that exist on the DatoCMS practice model:
//   title, slug, excerpt, category, coverImage, gallery,
//   page_sections, publishedDate, seo, featured
//
// The practice DETAIL page renders strictly through `page_sections` (see
// queries/practiceSections.ts), so `getPracticeBySlug` fetches only what SeoHead
// needs. `PracticeSummary` still carries cover/date/featured for the index.

export type PracticeCategory = 'crafts' | 'music' | 'rituals' | 'cuisine' | 'games';

export interface PracticeSummary {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  coverImage?: DatoImage | null;
  publishedDate?: string | null;
  featured?: boolean | null;
  // Single-select category (DatoCMS). `string` tolerated: CMS may hold an unknown value.
  category?: PracticeCategory | string | null;
  seo?: DatoSeo | null;
}

// The detail page needs only SEO-relevant fields; presentation comes from page_sections.
export type Practice = Pick<PracticeSummary, 'id' | 'title' | 'slug' | 'excerpt' | 'seo'>;

// ── Article ───────────────────────────────────────────────────────────────────

// Fields that exist on the DatoCMS article model:
//   title, slug, excerpt, coverImage, content, publishedDate, seo, featured

export interface ArticleSummary {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  coverImage?: DatoImage | null;
  publishedDate?: string | null;
  featured?: boolean | null;
  seo?: DatoSeo | null;
}

export interface Article extends ArticleSummary {
  content: StructuredTextContent | null;
}

// ── Practice page sections (modular `page_sections`) ──────────────────────────
// Normalized section model the immersive practice page renders from. DatoCMS
// `page_sections` map to it, discriminated by `type` (mirrors the CMS
// `section_type` select). See server/datocms/queries/practiceSections.ts.

export interface TimelineStep {
  time: string;
  label: string;
}

export interface IngredientRow {
  name: string;
  qty: string;
}

/** One checklist row inside a ritual step (icon is a lucide icon name). */
export interface ChecklistItem {
  icon: string;
  term: string;
  desc: string;
}

/** A single ritual step rendered in the sticky-scroll block. */
export interface RitualStep {
  /** Step heading — the "Шаг N" prefix is intentionally dropped. */
  title: string;
  /** Full narrative, one entry per paragraph. */
  narrative: string[];
  /** Heading for the how-to checklist (e.g. "Проращивание пшеницы (3–5 дней)"). */
  checklistTitle?: string;
  /** Optional intro line under the checklist heading. */
  checklistIntro?: string;
  /** How-to rows with lucide icons. */
  checklist?: ChecklistItem[];
  image: string;
  imageAlt: string;
}

export type PracticeSection =
  | {
      type: 'hero';
      /** The large silent poster word (e.g. "СҮМӨЛӨК"). */
      word: string;
      subtitle: string;
      image: string;
      imageAlt: string;
    }
  | { type: 'lede'; kicker: string; body: string }
  | { type: 'timeline'; title: string; steps: TimelineStep[] }
  | { type: 'ritual'; items: RitualStep[] }
  | { type: 'quote'; quote: string; attribution: string }
  | {
      type: 'ingredients';
      kicker: string;
      title: string;
      note: string;
      footnote: string;
      items: IngredientRow[];
    };

// ── Gallery ───────────────────────────────────────────────────────────────────

// Derived from gallery images on practice records.
export interface GalleryItem {
  imageUrl: string;
  imageAlt: string;
  postTitle: string;
  postSlug: string;
  locale: Locale;
  publishedDate: string;
}

// ── Site settings ─────────────────────────────────────────────────────────────

export interface SiteSettings {
  siteName: string;
  defaultSeo: DatoSeo | null;
}

// ── Structured Text (DAST) ────────────────────────────────────────────────────
// DatoCMS Structured Text fields return: { value: DastDocument, blocks: [...], links: [...] }

export interface StructuredTextContent {
  value: DastDocument;
  blocks?: CustomBlock[];
  links?: LinkedRecord[];
}

export interface DastDocument {
  schema: 'dast';
  document: DastRoot;
}

export type DastNode =
  | DastRoot
  | DastParagraph
  | DastHeading
  | DastList
  | DastListItem
  | DastLink
  | DastBlockquote
  | DastCode
  | DastSpan
  | DastInlineItem
  | DastBlock;

export interface DastRoot {
  type: 'root';
  children: DastNode[];
}

export interface DastParagraph {
  type: 'paragraph';
  children: DastNode[];
}

export interface DastHeading {
  type: 'heading';
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: DastNode[];
}

export interface DastList {
  type: 'list';
  style: 'bulleted' | 'numbered';
  children: DastNode[];
}

export interface DastListItem {
  type: 'listItem';
  children: DastNode[];
}

export interface DastLink {
  type: 'link';
  url: string;
  meta?: { id: string; value: string }[];
  children: DastNode[];
}

export interface DastBlockquote {
  type: 'blockquote';
  attribution?: string;
  children: DastNode[];
}

export interface DastCode {
  type: 'code';
  language?: string;
  code: string;
}

export interface DastSpan {
  type: 'span';
  value: string;
  marks?: ('strong' | 'emphasis' | 'underline' | 'strikethrough' | 'code' | 'highlight')[];
}

export interface DastInlineItem {
  type: 'inlineItem';
  item: string;
}

export interface DastBlock {
  type: 'block';
  item: string;
}

// ── Custom blocks inside Structured Text ──────────────────────────────────────
// These types exist for when DatoCMS has block types configured on the content field.
// Currently no blocks are configured — content.blocks will be undefined at runtime.

export type CustomBlock = ImageBlock | QuoteBlock | AssetBlock;

// DatoCMS "Asset" block (api key `asset` → __typename `AssetRecord`).
// Used inside Structured Text to embed images. `image` is a single optional
// image; `images` is a gallery (pack) of images. Either or both may be present.
export interface AssetBlock {
  __typename: 'AssetRecord';
  id: string;
  image: DatoImage | null;
  images: DatoImage[];
}

export interface ImageBlock {
  __typename: 'ImageBlockRecord';
  id: string;
  image: DatoImage;
  caption: string | null;
}

export interface QuoteBlock {
  __typename: 'QuoteBlockRecord';
  id: string;
  quote: string;
  attribution: string | null;
}

export interface LinkedRecord {
  __typename: string;
  id: string;
  [key: string]: unknown;
}
