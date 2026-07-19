import type { SectionMood, SectionPetroglyph, SectionVariants } from '$lib/types/datocms';

/**
 * The CMS `kicker` field is a presentation-variant channel: a whitespace/
 * comma-separated token list parsed here into `SectionVariants`. One parser for
 * every sections-driven surface — extend the registry below instead of
 * scattering per-page parsing.
 *
 * Token registry:
 * - `night` / `dye`            — band mood; consecutive same-mood sections merge
 *                                into one band (dark night / warm dye vat)
 * - `left` / `right`           — media side for photo_text, margin side for petroglyphs
 * - `strip`                    — consecutive strip photos collapse into one
 *                                contact-sheet cluster (tight gaps)
 * - `even`                     — diptych renders as equal 1fr/1fr columns
 *                                (for same-orientation pairs)
 * - `coda`                     — closing envoi treatment for a text section
 * - `petroglyph:<n>[:heritage]` — margin watermark from
 *                                static/assets/petroglyphs/<n>.svg, optional
 *                                warm heritage tint (wide viewports only)
 *
 * Unknown tokens are ignored — forward-compatible: content with new tokens can
 * be entered in DatoCMS before the matching frontend lands.
 */
const PETROGLYPH_TOKEN = /^petroglyph:(\d{1,2})(:heritage)?$/;

export function parseSectionVariants(kicker: string | null): SectionVariants {
  const tokens = (kicker ?? '')
    .toLowerCase()
    .split(/[\s,]+/)
    .filter(Boolean);
  const has = (t: string) => tokens.includes(t);

  let mood: SectionMood = 'day';
  if (has('night')) mood = 'night';
  else if (has('dye')) mood = 'dye';

  let petroglyph: SectionPetroglyph | null = null;
  for (const token of tokens) {
    const match = PETROGLYPH_TOKEN.exec(token);
    if (match) {
      petroglyph = { id: Number(match[1]), heritage: Boolean(match[2]) };
      break;
    }
  }

  return {
    mood,
    side: has('right') ? 'right' : 'left',
    strip: has('strip'),
    even: has('even'),
    coda: has('coda'),
    petroglyph
  };
}
