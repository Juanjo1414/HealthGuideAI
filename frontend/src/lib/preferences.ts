/**
 * Preferencias que viven solo en este navegador (no son datos de salud):
 * alias de cortesía, tamaño de letra, reducción de movimiento y país para
 * los números de emergencia. Todo con try/catch: localStorage puede no
 * existir (modo privado, bloqueado) y la app tiene que funcionar igual.
 */
const KEYS = {
  alias: "hg_alias",
  fontScale: "hg_font_scale",
  reduceMotion: "hg_reduce_motion",
  country: "hg_country",
} as const;

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    // Sin storage disponible: la preferencia dura solo esta pestaña.
  }
}

export const loadAlias = () => read(KEYS.alias);
export const saveAlias = (alias: string | null) => write(KEYS.alias, alias);

export type FontScale = "16" | "18" | "20";
export const loadFontScale = (): FontScale => (read(KEYS.fontScale) as FontScale) || "16";
export const saveFontScale = (scale: FontScale) => write(KEYS.fontScale, scale);

export const loadReduceMotion = () => read(KEYS.reduceMotion) === "1";
export const saveReduceMotion = (on: boolean) => write(KEYS.reduceMotion, on ? "1" : null);

export const loadCountry = () => read(KEYS.country) || "CO";
export const saveCountry = (code: string) => write(KEYS.country, code);

/** Aplica tamaño de letra y reducción de movimiento al documento. */
export function applyPreferences() {
  const root = document.documentElement;
  root.style.fontSize = `${loadFontScale()}px`;
  root.classList.toggle("reduce-motion", loadReduceMotion());
}

export function clearAllPreferences() {
  Object.values(KEYS).forEach((key) => write(key, null));
}
