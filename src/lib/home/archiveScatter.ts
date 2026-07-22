/**
 * Free-scatter positions for the editorial homepage archive block.
 *
 * The archive shows five CMS images as a deliberately un-gridded scatter on
 * desktop — absolute percentage positions inside a tall relative stage. Each
 * entry maps to one image slot (in order); the component applies the values as
 * CSS custom properties so a reduced number of images just fills the first
 * slots and the rest are skipped. `delay` staggers the directional reveal.
 *
 * On tablet/mobile the component drops the absolute layout for a flat two-then-
 * one column flow (see ArchiveScatter.svelte), so these positions are
 * desktop-only.
 */

export interface ArchiveScatterPos {
  /** Left offset as a CSS percentage string (e.g. "2%"). */
  left: string;
  /** Top offset as a CSS percentage string. */
  top: string;
  /** Cell width as a CSS percentage string. */
  width: string;
  /**
   * Fixed aspect ratio (`width / height`) for the cell — the image fills it with
   * object-fit: cover. Fixing it (rather than letting the CMS image's own height
   * drive the box) is what keeps the scatter from overlapping: real CMS assets
   * have unpredictable heights. Album ≈ 4/3 (landscape), portrait ≈ 3/4.
   */
  aspect: string;
  /** Reveal stagger delay (seconds) — fed to the `--d` reveal custom prop. */
  delay: string;
}

// Row 1: album + album · Row 2: portrait + portrait · Row 3: album (scattered).
export const ARCHIVE_SCATTER: ArchiveScatterPos[] = [
  { left: '2%', top: '2%', width: '42%', aspect: '4 / 3', delay: '0s' },
  { left: '56%', top: '10%', width: '40%', aspect: '4 / 3', delay: '0.06s' },
  { left: '8%', top: '31%', width: '27%', aspect: '3 / 4', delay: '0.12s' },
  { left: '62%', top: '38%', width: '26%', aspect: '3 / 4', delay: '0.18s' },
  { left: '18%', top: '68%', width: '44%', aspect: '4 / 3', delay: '0.24s' }
];
