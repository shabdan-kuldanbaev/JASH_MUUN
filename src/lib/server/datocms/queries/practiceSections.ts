import { datoRequest, DatoLocaleError } from '../client';
import { LOCALIZED_ALT } from '../fragments';
import { CMS_FALLBACK_LOCALE, resolveContentLocale } from '$lib/i18n';
import type { Locale } from '$lib/i18n';
import type { PracticeSection, TableRow, RecRow } from '$lib/types/datocms';

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
            ${LOCALIZED_ALT}
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
                ${LOCALIZED_ALT}
              }
              imageSecondary {
                url
                ${LOCALIZED_ALT}
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
 * Shades table (`section_type: table`): first body line = headers (4 cols); the
 * rest are `raw|color|hexA-hexB|boil|dye`. Specialized to the 4-column shades
 * schema — a differently-shaped table needs a parser change, not just CMS content.
 * Swatch stops are split + `#`-prefixed HERE (server) so the component never parses
 * in markup; a missing/malformed swatch (no `-`) degrades to empty stops → the
 * renderer skips the swatch span.
 */
function tableParse(body: string | null): { columns: string[]; rows: TableRow[] } {
  const lines = (body ?? '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  const columns = (lines[0] ?? '').split('|').map((c) => c.trim());
  const rows = lines
    .slice(1)
    .map((l) => l.split('|').map((c) => c.trim()))
    .filter((c) => c.length >= 5)
    .map((c) => {
      const [from, to] = c[2].includes('-') ? c[2].split('-') : ['', ''];
      return {
        raw: c[0],
        color: c[1],
        swatchFrom: from ? `#${from}` : '',
        swatchTo: to ? `#${to}` : '',
        boil: c[3],
        dye: c[4]
      };
    });
  return { columns, rows };
}

/** Recommendations (`note` recs variant): one row per line `icon|text`. */
function recRows(body: string | null): RecRow[] {
  return (body ?? '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const a = l.indexOf('|');
      if (a === -1) return null;
      return { icon: l.slice(0, a).trim(), text: l.slice(a + 1).trim() };
    })
    .filter((r): r is RecRow => r !== null);
}

/**
 * Practice kicker token channel — two registries (see the note in
 * types/datocms.ts). One token per kicker; unknown tokens are simply passed
 * through and stay inert until a matching CSS class exists (forward-compatible).
 * The hero/photo section kickers and the ritual STAGE kicker are token channels
 * (not rendered as copy); the lede/ingredients kickers stay display copy.
 *
 * - THEME: the first token of the HERO section kicker (e.g. `duotone`, `ember`).
 * - MOOD:  the first token of each ritual STAGE kicker (zone soak) and of a
 *   `photo` section kicker (spatial close band) — e.g. `silk`, `ember`.
 */
function firstToken(kicker: string | null): string | undefined {
  return (kicker ?? '')
    .toLowerCase()
    .split(/[\s,]+/)
    .filter(Boolean)[0];
}

function normalize(sections: DatoSection[]): PracticeSection[] {
  const theme = firstToken(sections.find((s) => s.sectionType === 'hero')?.kicker ?? null);

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
          // Fall back to the poster word so the hero photo is never announced with an empty alt.
          imageAlt: s.image?.alt || s.title || ''
        });
        break;
      case 'timeline':
        out.push({
          type: 'timeline',
          title: s.title ?? '',
          theme,
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
        out.push({
          type: 'ritual',
          theme,
          items: stages.map((i) => ({
            title: i.title,
            narrative: paragraphs(i.body),
            checklistTitle: i.checklistTitle ?? undefined,
            checklistIntro: i.checklistIntro ?? undefined,
            checklist: checklistRows(i.checklist),
            image: i.image?.url ?? '',
            imageAlt: i.image?.alt || i.title || '',
            imageSecondary: i.imageSecondary?.url ?? undefined,
            imageSecondaryAlt: i.imageSecondary ? i.imageSecondary.alt || i.title : undefined,
            mood: firstToken(i.kicker)
          }))
        });
        break;
      }
      case 'lede':
        out.push({ type: 'lede', kicker: s.kicker ?? '', body: s.body ?? '', theme });
        break;
      case 'quote':
        out.push({ type: 'quote', quote: s.body ?? '', attribution: s.caption ?? '' });
        break;
      case 'photo':
        out.push({
          type: 'photo',
          image: s.image?.url ?? '',
          // Caption describes the plate when the asset carries no alt of its own.
          imageAlt: s.image?.alt || s.caption || '',
          width: s.image?.width ?? undefined,
          height: s.image?.height ?? undefined,
          mood: firstToken(s.kicker)
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
      case 'table': {
        const { columns, rows } = tableParse(s.body);
        out.push({
          type: 'table',
          title: s.title ?? '',
          intro: s.caption ?? '',
          columns,
          rows
        });
        break;
      }
      case 'note': {
        const variant = firstToken(s.kicker) === 'recs' ? 'recs' : 'warn';
        out.push({
          type: 'note',
          variant,
          title: s.title ?? '',
          body: variant === 'warn' ? (s.body ?? '') : '',
          items: variant === 'recs' ? recRows(s.body) : []
        });
        break;
      }
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
