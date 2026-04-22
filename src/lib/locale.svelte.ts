// Module-level reactive locale state (Svelte 5 runes).
// Using a class so that localeState.current is mutable from outside the module.
// When getLocale() reads this $state inside a Svelte template, the component
// tracks it as a dependency and re-renders automatically on locale change.

class LocaleState {
  current = $state<string>('ru');
}

export const localeState = new LocaleState();
