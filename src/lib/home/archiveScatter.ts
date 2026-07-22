/**
 * Free-scatter positions for the editorial homepage archive block (desktop only).
 *
 * Each entry maps to one image slot, in order; the component applies them as CSS
 * custom properties, so fewer images just fill the first slots. Tablet/mobile
 * drops the absolute layout for a flat column flow (see ArchiveScatter.svelte).
 */

export interface ArchiveScatterPos {
  /** Left offset as a CSS percentage string (e.g. "2%"). */
  left: string;
  /** Top offset as a CSS percentage string. */
  top: string;
  /** Cell width as a CSS percentage string. */
  width: string;
  /** Fixed aspect ratio (`width / height`); a fixed box stops variable-height CMS assets from overlapping. */
  aspect: string;
  /** Reveal stagger delay (seconds) — fed to the `--d` reveal custom prop. */
  delay: string;
}

export const ARCHIVE_SCATTER: ArchiveScatterPos[] = [
  { left: '2%', top: '2%', width: '42%', aspect: '4 / 3', delay: '0s' },
  { left: '56%', top: '10%', width: '40%', aspect: '4 / 3', delay: '0.06s' },
  { left: '8%', top: '31%', width: '27%', aspect: '3 / 4', delay: '0.12s' },
  { left: '62%', top: '38%', width: '26%', aspect: '3 / 4', delay: '0.18s' },
  { left: '18%', top: '68%', width: '44%', aspect: '4 / 3', delay: '0.24s' }
];
