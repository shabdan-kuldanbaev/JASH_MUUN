export type PanelId = 'language' | 'practices' | 'archive' | null;
export type TransitionDir = 'right' | 'left' | null;

const PANEL_ORDER: NonNullable<PanelId>[] = ['practices', 'archive', 'language'];

let _active = $state<PanelId>(null);
let _contentKey = $state(0); // increments only on switchTo — drives keyed transitions
let _direction = $state<TransitionDir>(null); // direction the NEW content enters from

export const panel = {
  get active() {
    return _active;
  },
  get contentKey() {
    return _contentKey;
  },
  get direction() {
    return _direction;
  },

  /** Open from closed state — no content transition, shell itself flies in. */
  open(id: NonNullable<PanelId>) {
    _direction = null;
    _active = id;
  },

  /**
   * Switch content while panel stays open.
   * Computes direction from PANEL_ORDER so the transition is spatially consistent.
   * No-op if already on the same panel.
   */
  switchTo(id: NonNullable<PanelId>) {
    if (_active === id) return;
    const fromIdx = _active !== null ? PANEL_ORDER.indexOf(_active) : -1;
    const toIdx = PANEL_ORDER.indexOf(id);
    _direction = toIdx > fromIdx ? 'right' : 'left';
    _contentKey += 1;
    _active = id;
  },

  close() {
    _direction = null;
    _active = null;
  }
};
