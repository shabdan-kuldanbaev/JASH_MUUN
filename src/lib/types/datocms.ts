// Shared TypeScript types for DatoCMS content.
// Safe to import from both server files and Svelte components (types are erased at runtime).

// ── Locales ───────────────────────────────────────────────────────────────────

// TARGET locales — add here once configured in DatoCMS Settings > Locales.
// Currently only 'ru' is active; 'ky'/'en'/'fr' queries are skipped gracefully.
export const LOCALES = ['ru', 'ky', 'en', 'fr'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'ru';

export function isValidLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** Returns the locale if it is configured in DatoCMS, otherwise falls back to 'ru'. */
export function resolveContentLocale(locale: string): string {
  const available = ['ru'];
  return available.includes(locale) ? locale : 'ru';
}

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
//   title, slug, excerpt, content, coverImage, gallery,
//   youtubeUrl, publishedDate, seo, featured

export interface PracticeSummary {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  coverImage?: DatoImage | null;
  publishedDate?: string | null;
  featured?: boolean | null;
  seo?: DatoSeo | null;
}

export interface Practice extends PracticeSummary {
  content: StructuredTextContent | null;
  gallery: DatoImage[];
  youtubeUrl?: string | null;
}

// ── Gallery ───────────────────────────────────────────────────────────────────

// Derived from gallery images on practice records.
export interface GalleryItem {
  imageUrl: string;
  imageAlt: string;
  postTitle: string;
  postSlug: string;
  locale: string;
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

export type CustomBlock = ImageBlock | QuoteBlock;

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
