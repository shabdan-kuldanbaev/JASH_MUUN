// Single source of truth for DatoCMS (Imgix) image URLs. All CDN transform
// policy lives here — change a param (e.g. add quality, switch auto mode) once
// and every surface follows: CmsImage srcset, the archive lightbox, and the
// archive de-dup key.

/** Strip query params → the canonical asset URL. Used as the de-dup key. */
export function datoKey(url: string): string {
  return url.split('?')[0];
}

interface DatoImgOptions {
  /** Target width in px (Imgix `w`). */
  w?: number;
  /** Resize fit mode (Imgix `fit`), e.g. `max` to avoid upscaling past source. */
  fit?: string;
}

/** Build a transformed DatoCMS image URL (`auto=format` always on). */
export function datoImg(url: string, { w, fit }: DatoImgOptions = {}): string {
  const params: string[] = [];
  if (w) params.push(`w=${w}`);
  params.push('auto=format');
  if (fit) params.push(`fit=${fit}`);
  return `${datoKey(url)}?${params.join('&')}`;
}
