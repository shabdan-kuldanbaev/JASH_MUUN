import { datoRequest, DatoLocaleError } from '../client';
import { CMS_FALLBACK_LOCALE, resolveContentLocale } from '$lib/i18n';
import type { Locale } from '$lib/i18n';
import type { PracticeSection } from '$lib/content/sumolok';

/** Raw shapes returned by the modular `page_sections` query. */
interface DatoImage {
  url: string;
  alt: string | null;
}
interface DatoStageBlock {
  __typename: 'StageBlockRecord';
  title: string;
  body: string | null;
  checklistTitle: string | null;
  checklistIntro: string | null;
  /** One "icon|term|desc" row per line (flat text — DatoCMS forbids blocks this deep). */
  checklist: string | null;
  image: DatoImage | null;
}
type DatoItem =
  | DatoStageBlock
  | { __typename: 'StepBlockRecord'; time: string; label: string }
  | { __typename: 'IngredientBlockRecord'; name: string; qty: string };
interface DatoSection {
  __typename: 'SectionRecord';
  sectionType: string | null;
  kicker: string | null;
  title: string | null;
  body: string | null;
  caption: string | null;
  image: DatoImage | null;
  items: DatoItem[];
}

const QUERY = /* GraphQL */ `
  query PracticeSections($locale: SiteLocale!, $fallbackLocales: [SiteLocale!]!, $slug: String!) {
    practice(locale: $locale, fallbackLocales: $fallbackLocales, filter: { slug: { eq: $slug } }) {
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
          }
          items {
            __typename
            ... on StageBlockRecord {
              title
              body
              checklistTitle
              checklistIntro
              checklist
              image {
                url
                alt
              }
            }
            ... on StepBlockRecord {
              time
              label
            }
            ... on IngredientBlockRecord {
              name
              qty
            }
          }
        }
      }
    }
  }
`;

/** Split a multi-paragraph text field (paragraphs separated by blank lines). */
function paragraphs(body: string | null): string[] {
  return (body ?? '')
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/** Parse the flat "icon|term|desc" checklist text into rows (desc may contain `|`). */
function checklistRows(text: string | null): { icon: string; term: string; desc: string }[] {
  return (text ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const a = line.indexOf('|');
      const b = line.indexOf('|', a + 1);
      if (a === -1 || b === -1) return null;
      return {
        icon: line.slice(0, a).trim(),
        term: line.slice(a + 1, b).trim(),
        desc: line.slice(b + 1).trim()
      };
    })
    .filter((r): r is { icon: string; term: string; desc: string } => r !== null);
}

function normalize(sections: DatoSection[]): PracticeSection[] {
  const out: PracticeSection[] = [];
  for (const s of sections) {
    const items = s.items ?? [];
    switch (s.sectionType) {
      case 'hero':
        out.push({
          type: 'hero',
          word: s.title ?? '',
          subtitle: s.body ?? '',
          image: s.image?.url ?? '',
          imageAlt: s.image?.alt ?? ''
        });
        break;
      case 'timeline':
        out.push({
          type: 'timeline',
          title: s.title ?? '',
          steps: items
            .filter(
              (i): i is Extract<DatoItem, { __typename: 'StepBlockRecord' }> =>
                i.__typename === 'StepBlockRecord'
            )
            .map((i) => ({ time: i.time, label: i.label }))
        });
        break;
      case 'ritual':
        out.push({
          type: 'ritual',
          items: items
            .filter((i): i is DatoStageBlock => i.__typename === 'StageBlockRecord')
            .map((i) => ({
              title: i.title,
              narrative: paragraphs(i.body),
              checklistTitle: i.checklistTitle ?? undefined,
              checklistIntro: i.checklistIntro ?? undefined,
              checklist: checklistRows(i.checklist),
              image: i.image?.url ?? '',
              imageAlt: i.image?.alt ?? ''
            }))
        });
        break;
      case 'lede':
        out.push({ type: 'lede', kicker: s.kicker ?? '', body: s.body ?? '' });
        break;
      case 'quote':
        out.push({ type: 'quote', quote: s.body ?? '', attribution: s.caption ?? '' });
        break;
      case 'ingredients':
        out.push({
          type: 'ingredients',
          kicker: s.kicker ?? '',
          title: s.title ?? '',
          note: s.body ?? '',
          footnote: s.caption ?? '',
          items: items
            .filter(
              (i): i is Extract<DatoItem, { __typename: 'IngredientBlockRecord' }> =>
                i.__typename === 'IngredientBlockRecord'
            )
            .map((i) => ({ name: i.name, qty: i.qty }))
        });
        break;
    }
  }
  return out;
}

/**
 * Fetch a practice's modular `page_sections` from DatoCMS. Returns `null` when the
 * practice has no sections (caller renders the structured-text layout / static fallback),
 * and degrades to `null` on locale issues — never throws for missing content.
 */
export async function getPracticeSections(
  locale: Locale,
  slug: string
): Promise<PracticeSection[] | null> {
  const resolved = resolveContentLocale(locale);
  try {
    const data = await datoRequest<{ practice: { pageSections: DatoSection[] } | null }>(QUERY, {
      locale: resolved,
      fallbackLocales: [CMS_FALLBACK_LOCALE],
      slug
    });
    const sections = data.practice?.pageSections ?? [];
    if (sections.length === 0) return null;
    const normalized = normalize(sections);
    return normalized.length > 0 ? normalized : null;
  } catch (err) {
    if (!(err instanceof DatoLocaleError)) {
      console.warn(`[DatoCMS] getPracticeSections failed for "${slug}", falling back:`, err);
    }
    return null;
  }
}
