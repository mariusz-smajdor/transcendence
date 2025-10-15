// Simple language service to manage current language across the app

const LANG_STORAGE_KEY = 'lang';
const DEFAULT_LANG = 'en';

export type LanguageCode = 'en' | 'pl' | 'es' | string;

function readStoredLang(): LanguageCode {
	try {
		return (
			(localStorage.getItem(LANG_STORAGE_KEY) as LanguageCode) || DEFAULT_LANG
		);
	} catch {
		return DEFAULT_LANG;
	}
}

function writeStoredLang(lang: LanguageCode) {
	try {
		localStorage.setItem(LANG_STORAGE_KEY, lang);
	} catch {}
}

export function getCurrentLang(): LanguageCode {
	// Prefer documentElement.lang if set; fallback to storage; finally default
	const docLang = document.documentElement.getAttribute(
		'lang'
	) as LanguageCode | null;
	if (docLang && docLang.length > 0) return docLang;
	return readStoredLang();
}

export function initLanguage() {
	// Initialize document lang from storage (no event dispatch)
	const lang = readStoredLang();
	document.documentElement.setAttribute('lang', lang);
}

export function setCurrentLang(
	lang: LanguageCode,
	opts?: { silent?: boolean }
) {
	writeStoredLang(lang);
	document.documentElement.setAttribute('lang', lang);
	if (!opts?.silent) {
		window.dispatchEvent(
			new CustomEvent('languageChange', { detail: { lang } })
		);
	}
}

export function onLanguageChange(
	cb: (lang: LanguageCode, ev: CustomEvent) => void
) {
	const handler = (ev: Event) => {
		const ce = ev as CustomEvent;
		cb(ce.detail?.lang ?? getCurrentLang(), ce);
	};
	window.addEventListener('languageChange', handler as EventListener);
	return () =>
		window.removeEventListener('languageChange', handler as EventListener);
}
