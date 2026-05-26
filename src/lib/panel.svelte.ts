export type PanelId = 'language' | null;

let _active = $state<PanelId>(null);

export const panel = {
  get active() {
    return _active;
  },

  /** Open the language panel. */
  open() {
    _active = 'language';
  },

  /** Close panel. */
  close() {
    _active = null;
  },

  /** Toggle language panel open/closed. */
  toggle() {
    _active = _active ? null : 'language';
  }
};
