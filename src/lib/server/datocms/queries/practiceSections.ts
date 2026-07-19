import { datoRequest, DatoLocaleError } from '../client';
import { CMS_FALLBACK_LOCALE, resolveContentLocale } from '$lib/i18n';
import type { Locale } from '$lib/i18n';
import type { PracticeSection } from '$lib/types/datocms';

/** Raw shapes returned by the modular `page_sections` query. */
interface DatoImage {
  url: string;
  alt: string | null;
}
interface DatoStageBlock {
  __typename: 'StageBlockRecord';
  /** Variant token channel (not rendered): `silk` marks the pearl-zone start. */
  kicker: string | null;
  title: string;
  body: string | null;
  checklistTitle: string | null;
  checklistIntro: string | null;
  /** One "icon|term|desc" row per line (flat text — DatoCMS forbids blocks this deep). */
  checklist: string | null;
  image: DatoImage | null;
  /** Second frame — the pinned visual pages through the stage's photos on scroll. */
  imageSecondary: DatoImage | null;
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
  image: (DatoImage & { width?: number | null; height?: number | null }) | null;
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
            width
            height
          }
          items {
            __typename
            ... on StageBlockRecord {
              kicker
              title
              body
              checklistTitle
              checklistIntro
              checklist
              image {
                url
                alt
              }
              imageSecondary {
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

/**
 * Practice kicker token channel (mirrors the article registry in
 * sectionVariants.ts, but practice-specific — see the note in types/datocms.ts):
 * - hero section kicker `duotone`  — themes the page (alternating steppe/shyrdak
 *   accents on ritual stages and timeline, lede ornament, numbered stages);
 * - ritual STAGE kicker `silk`     — the pearl zone starts at this stage (the
 *   section background soaks as it activates);
 * - photo section kicker `silk`    — the photo closes the pearl zone (spatial
 *   gradient back to paper).
 * The hero/photo section kickers and the stage kicker are not rendered as copy
 * anywhere in the practice pipeline, so the channel is free. Unknown tokens are
 * ignored — forward-compatible. (The lede/ingredients kickers stay display copy.)
 */
function tokens(kicker: string | null): Set<string> {
  return new Set(
    (kicker ?? '')
      .toLowerCase()
      .split(/[\s,]+/)
      .filter(Boolean)
  );
}

function normalize(sections: DatoSection[]): PracticeSection[] {
  const duotone = sections.some((s) => s.sectionType === 'hero' && tokens(s.kicker).has('duotone'));

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
          duotone,
          steps: items
            .filter(
              (i): i is Extract<DatoItem, { __typename: 'StepBlockRecord' }> =>
                i.__typename === 'StepBlockRecord'
            )
            .map((i) => ({ time: i.time, label: i.label }))
        });
        break;
      case 'ritual': {
        const stages = items.filter(
          (i): i is DatoStageBlock => i.__typename === 'StageBlockRecord'
        );
        const firstSilk = stages.findIndex((i) => tokens(i.kicker).has('silk'));
        out.push({
          type: 'ritual',
          duotone,
          silkFrom: firstSilk === -1 ? undefined : firstSilk,
          items: stages.map((i) => ({
            title: i.title,
            narrative: paragraphs(i.body),
            checklistTitle: i.checklistTitle ?? undefined,
            checklistIntro: i.checklistIntro ?? undefined,
            checklist: checklistRows(i.checklist),
            image: i.image?.url ?? '',
            imageAlt: i.image?.alt ?? '',
            imageSecondary: i.imageSecondary?.url ?? undefined,
            imageSecondaryAlt: i.imageSecondary?.alt ?? undefined
          }))
        });
        break;
      }
      case 'lede':
        out.push({ type: 'lede', kicker: s.kicker ?? '', body: s.body ?? '', ornament: duotone });
        break;
      case 'quote':
        out.push({ type: 'quote', quote: s.body ?? '', attribution: s.caption ?? '' });
        break;
      case 'photo':
        out.push({
          type: 'photo',
          image: s.image?.url ?? '',
          imageAlt: s.image?.alt ?? '',
          width: s.image?.width ?? undefined,
          height: s.image?.height ?? undefined,
          silk: tokens(s.kicker).has('silk')
        });
        break;
      case 'video':
        // Pending media: the record carries the source URL in `body`, but there is
        // no playable file yet — skipped until playback is wired.
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
