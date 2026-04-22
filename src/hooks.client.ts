import { overwriteGetLocale } from '$lib/paraglide/runtime.js';
import { localeState } from '$lib/locale.svelte.js';
import { DEFAULT_LOCALE, isValidLocale } from '$lib/i18n';

// Initialize from the current URL before any rendering occurs.
const initialSegment = window.location.pathname.split('/').filter(Boolean)[0] ?? '';
localeState.current = isValidLocale(initialSegment) ? initialSegment : DEFAULT_LOCALE;

// Override paraglide's getLocale() to return the reactive $state value.
// When m.*() calls getLocale() inside a Svelte template, Svelte 5's signal
// system tracks localeState.current as a dependency — components re-render
// automatically whenever localeState.current changes.
overwriteGetLocale((): any => localeState.current);
