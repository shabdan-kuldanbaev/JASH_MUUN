import { datoRequest, DatoLocaleError } from '../client';
import { LOCALIZED_ALT } from '../fragments';
import { parseSectionVariants } from '../sectionVariants';
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
            ${LOCALIZED_ALT}
            width
            height
            blurUpThumb
          }
          imageSecondary {
            url
            ${LOCALIZED_ALT}
            width
            height
            blurUpThumb
          }
        }
      }
    }
  }
`;

// `kicker` parsing is centralized in ../sectionVariants.ts (token registry
// documented there). Every normalized section carries the full SectionVariants.
function normalize(sections: DatoSection[]): ArticleSection[] {
  const out: ArticleSection[] = [];
  for (const s of sections) {
    const variants = parseSectionVariants(s.kicker);
    switch (s.sectionType) {
      case 'hero':
        out.push({
          ...variants,
          type: 'hero',
          title: s.title ?? '',
          lede: s.body ?? '',
          image: s.image
        });
        break;
      case 'photo':
        out.push({
          ...variants,
          type: 'photo',
          image: s.image,
          imageSecondary: s.imageSecondary,
          caption: s.caption ?? ''
        });
        break;
      case 'text':
        out.push({ ...variants, type: 'text', heading: s.title ?? '', body: s.body ?? '' });
        break;
      case 'photo_text':
        out.push({
          ...variants,
          type: 'photoText',
          image: s.image,
          heading: s.title ?? '',
          body: s.body ?? ''
        });
        break;
      case 'quote':
        out.push({
          ...variants,
          type: 'quote',
          quote: s.body ?? '',
          attribution: s.caption ?? ''
        });
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
