import { datoRequest, DatoLocaleError } from '../client';
import { CMS_FALLBACK_LOCALE, resolveContentLocale } from '$lib/i18n';
import type { Locale } from '$lib/i18n';
import type { ArticleSection, DatoImage } from '$lib/types/datocms';

/** Raw shape returned by the modular `page_sections` query (reused SectionRecord). */
interface DatoSection {
  __typename: 'SectionRecord';
  sectionType: string | null;
  kicker: string | null;
  title: string | null;
  body: string | null;
  caption: string | null;
  image: DatoImage | null;
  imageSecondary: DatoImage | null;
}

const QUERY = /* GraphQL */ `
  query ArticleSections($locale: SiteLocale!, $fallbackLocales: [SiteLocale!]!, $slug: String!) {
    article(locale: $locale, fallbackLocales: $fallbackLocales, filter: { slug: { eq: $slug } }) {
      pageSections {
        __typename
        ... on SectionRecord {
          sectionType
          kicker
          title
          body
          caption
          image {
            url
            alt
            width
            height
            blurUpThumb
          }
          imageSecondary {
            url
            alt
            width
            height
            blurUpThumb
          }
        }
      }
    }
  }
`;

/**
 * `kicker` is a variant channel: a whitespace/comma-separated token list.
 * Known tokens: `night` (dark-band mood, any block), `right`/`left`
 * (photo_text side). Unknown tokens are ignored — forward-compatible.
 */
function variants(kicker: string | null): { night: boolean; side: 'left' | 'right' } {
  const tokens = new Set(
    (kicker ?? '')
      .toLowerCase()
      .split(/[\s,]+/)
      .filter(Boolean)
  );
  return { night: tokens.has('night'), side: tokens.has('right') ? 'right' : 'left' };
}

function normalize(sections: DatoSection[]): ArticleSection[] {
  const out: ArticleSection[] = [];
  for (const s of sections) {
    const { night, side } = variants(s.kicker);
    switch (s.sectionType) {
      case 'hero':
        out.push({ type: 'hero', night, title: s.title ?? '', lede: s.body ?? '', image: s.image });
        break;
      case 'photo':
        out.push({
          type: 'photo',
          night,
          image: s.image,
          imageSecondary: s.imageSecondary,
          caption: s.caption ?? ''
        });
        break;
      case 'text':
        out.push({ type: 'text', night, heading: s.title ?? '', body: s.body ?? '' });
        break;
      case 'photo_text':
        out.push({
          type: 'photoText',
          night,
          image: s.image,
          side,
          heading: s.title ?? '',
          body: s.body ?? ''
        });
        break;
      case 'quote':
        out.push({ type: 'quote', night, quote: s.body ?? '', attribution: s.caption ?? '' });
        break;
    }
  }
  return out;
}

/**
 * Fetch an article's modular `page_sections` from DatoCMS. Returns `null` when
 * the article has no sections (caller 404s — articles are sections-only), and
 * degrades to `null` on locale issues — never throws for missing content.
 * Mirrors getPracticeSections.
 */
export async function getArticleSections(
  locale: Locale,
  slug: string
): Promise<ArticleSection[] | null> {
  const resolved = resolveContentLocale(locale);
  try {
    const data = await datoRequest<{ article: { pageSections: DatoSection[] } | null }>(QUERY, {
      locale: resolved,
      fallbackLocales: [CMS_FALLBACK_LOCALE],
      slug
    });
    const sections = data.article?.pageSections ?? [];
    if (sections.length === 0) return null;
    const normalized = normalize(sections);
    return normalized.length > 0 ? normalized : null;
  } catch (err) {
    if (!(err instanceof DatoLocaleError)) {
      console.warn(`[DatoCMS] getArticleSections failed for "${slug}", falling back:`, err);
    }
    return null;
  }
}
