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
//   title, slug, excerpt, coverImage, page_sections, publishedDate, seo, featured
//
// The article DETAIL page renders strictly through `page_sections` (see
// queries/articleSections.ts), so `getArticleBySlug` fetches only what SeoHead
// needs. `ArticleSummary` still carries cover/date/featured for the index.

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

// The detail page needs only SEO-relevant fields; presentation comes from page_sections.
export type Article = Pick<ArticleSummary, 'id' | 'title' | 'slug' | 'excerpt' | 'seo'>;

// ── Article page sections (modular `page_sections`) ───────────────────────────
// The article detail page renders from these (mirrors the practice pipeline).
// DatoCMS `SectionRecord` blocks map here, discriminated by `type` (from the CMS
// `section_type` select). Presentation variants come from the `kicker` variant
// channel, parsed centrally in server/datocms/sectionVariants.ts (token
// registry documented there). Consecutive same-mood sections render as one
// band: `night` → dark band (dusk/dawn edges, grain, ember sparks), `dye` →
// warm dye-vat band (seamless gradient, felt grain, steam, simmer glow).

/** Mood of a section band — consecutive same-mood sections merge into one band. */
export type SectionMood = 'day' | 'night' | 'dye';

/** Margin petroglyph watermark, requested via the `petroglyph:<n>[:heritage]` token. */
export interface SectionPetroglyph {
  /** Numbered SVG in static/assets/petroglyphs/ (1–12). */
  id: number;
  /** Warm clay tint (`.petroglyph--heritage` in app.css). */
  heritage: boolean;
}

/**
 * Presentation variants shared by every article section (parsed from `kicker`).
 * Every flag is orthogonal and optional — the parser defaults to a plain day
 * section, so existing content is untouched by new tokens.
 */
export interface SectionVariants {
  mood: SectionMood;
  /** Media side for photo_text; margin side for petroglyphs. */
  side: 'left' | 'right';
  /** Consecutive strip photos collapse into one contact-sheet cluster. */
  strip: boolean;
  /** Diptych renders as equal 1fr/1fr columns (same-orientation pairs). */
  even: boolean;
  /** Closing envoi treatment for a text section. */
  coda: boolean;
  petroglyph: SectionPetroglyph | null;
}

export type ArticleSection = SectionVariants &
  (
    | { type: 'hero'; title: string; lede: string; image: DatoImage | null }
    | {
        type: 'photo';
        image: DatoImage | null;
        /** Second frame → the photo renders as a diptych with one shared caption. */
        imageSecondary: DatoImage | null;
        caption: string;
      }
    | { type: 'text'; heading: string; body: string }
    | { type: 'photoText'; image: DatoImage | null; heading: string; body: string }
    | { type: 'quote'; quote: string; attribution: string }
  );

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

/**
 * One data row of the shades table (`section_type: table`). Swatch stops are
 * parsed server-side into ready `#hex` values so the component never parses in
 * markup (centralization). Empty stops → the renderer skips the swatch span.
 */
export interface TableRow {
  raw: string; // Растительное сырьё
  color: string; // Цвет (named shade)
  swatchFrom: string; // "#c9962e" — gradient start ('' if none/malformed)
  swatchTo: string; // "#b3591f" — gradient end ('' if none/malformed)
  boil: string; // Кипячение отвара
  dye: string; // Окрашивание
}

/** One recommendation row inside a `note` (recs variant); icon is a lucide name. */
export interface RecRow {
  icon: string;
  text: string;
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
  /** Empty string → the pinned frame keeps a quiet paper placeholder. */
  image: string;
  imageAlt: string;
  /** Second frame — the pinned visual pages through the stage's photos by scroll progress. */
  imageSecondary?: string;
  imageSecondaryAlt?: string;
  /**
   * Zone mood (from the stage kicker) — the ritual background reflects the
   * ACTIVE stage's mood, so a zone can both start and end mid-ritual. Rendered
   * as `.ritual.is-<mood>`; registry lives in queries/practiceSections.ts +
   * ImmersivePractice CSS. Known: `silk` (pearl), `ember` (warm). Undefined → paper.
   */
  mood?: string;
}

// Practice presentation is driven by two token registries (parsed in
// queries/practiceSections.ts from the kicker channel; unknown tokens ignored —
// forward-compatible):
//
//   THEME  — one token on the HERO section kicker, applied page-wide to
//            timeline / ritual / lede as `--theme-<name>`. Known: `duotone`
//            (two alternating wool accents + two-colour ornament), `ember`
//            (single clay accent + clay ornament), `dye` (single steppe/gold
//            accent + steppe ornament — natural-dye identity). Add a theme =
//            one CSS block per themed component, no component-logic change.
//   MOOD   — one token per ritual STAGE kicker (zone soak) and on a `photo`
//            section kicker (spatial close band), rendered as `is-<mood>` /
//            `photo--<mood>`. Known: `silk`, `ember`, `dye` (warm vat zone —
//            golden haze; placed on the single thermal stage so the zone lives
//            mid-ritual and never touches a section boundary).

export type PracticeSection =
  | {
      type: 'hero';
      /** The large silent poster word (e.g. "СҮМӨЛӨК"). */
      word: string;
      subtitle: string;
      image: string;
      imageAlt: string;
    }
  | { type: 'lede'; kicker: string; body: string; theme?: string }
  | { type: 'timeline'; title: string; steps: TimelineStep[]; theme?: string }
  | {
      type: 'ritual';
      items: RitualStep[];
      /** Page theme token — accent palette for stages (see the registry note above). */
      theme?: string;
    }
  | { type: 'quote'; quote: string; attribution: string }
  | {
      type: 'photo';
      image: string;
      imageAlt: string;
      width?: number;
      height?: number;
      /** Zone mood — renders the spatial close band `photo--<mood>` (e.g. `silk`). */
      mood?: string;
    }
  | {
      type: 'ingredients';
      kicker: string;
      title: string;
      note: string;
      footnote: string;
      items: IngredientRow[];
    }
  | {
      /** Shades table — specialized to the 4-column schema (raw|color|swatch|boil|dye). */
      type: 'table';
      title: string;
      intro: string;
      /** Column headers (localized), e.g. [Растительное сырьё, Цвет, Кипячение отвара, Окрашивание]. */
      columns: string[];
      rows: TableRow[];
    }
  | {
      /**
       * Variant-discriminated reference callout (kicker channel — like the article
       * `sectionVariants` registry). `warn` — titled «Важно» paragraph; `recs` —
       * icon+text checklist. A future variant (e.g. `info`/`tip`) is one kicker
       * token + one `normalize()` branch + CSS — no new section_type. The
       * discrimination stays in the server normalizer.
       */
      type: 'note';
      variant: 'warn' | 'recs';
      title: string;
      body: string; // warn: the paragraph; recs: unused
      items: RecRow[]; // recs: the rows; warn: []
    };

// ── Archive ─────────────────────────────────────────────────────────────────

// The archive (`/[locale]/gallery`) flattens EVERY image asset across all
// practices (coverImage + gallery + page_sections) and all articles (coverImage +
// sections) into one mixed wall. Each item carries the category of its source
// practice (null for articles) so the wall can filter by category — the same
// vocabulary as the practices index.
export interface ArchiveItem {
  /** Base image URL — stable, unique after de-dup; the keyed-each + lightbox key. */
  key: string;
  imageUrl: string;
  imageAlt: string;
  width: number;
  height: number;
  blurUpThumb: string | null;
  /** Source practice category; null when the asset comes from an article. */
  category: PracticeCategory | string | null;
}

// ── Site settings ─────────────────────────────────────────────────────────────

export interface SiteSettings {
  siteName: string;
  defaultSeo: DatoSeo | null;
}
