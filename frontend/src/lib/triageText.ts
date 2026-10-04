/**
 * Cómo se presentan los textos libres del modelo. El prompt (backend
 * contract.CONTENT_GUIDE) pide las causas como "nombre: por qué encaja" y la
 * recomendación en frases cortas que terminan con el disclaimer obligatorio.
 */

export interface CauseParts {
  name: string;
  reason: string | null;
}

/** "cefalea tensional: dolor persistente..." → { name, reason }. Tolera causas sin explicación (historial viejo). */
export function splitCause(cause: string): CauseParts {
  const index = cause.indexOf(":");
  if (index <= 0) return { name: cause.trim(), reason: null };
  const reason = cause.slice(index + 1).trim();
  return { name: cause.slice(0, index).trim(), reason: reason || null };
}

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

// Frases del disclaimer del backend (contract.DISCLAIMER). Se muestran aparte,
// como aviso, no como un paso más de autocuidado.
const DISCLAIMER_STARTS = ["esta orientacion puede no ser exacta", "ante cualquier duda"];

export function splitRecommendation(text: string): { steps: string[]; disclaimer: string[] } {
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
  const steps: string[] = [];
  const disclaimer: string[] = [];
  for (const sentence of sentences) {
    const isDisclaimer = DISCLAIMER_STARTS.some((start) => normalize(sentence).startsWith(start));
    (isDisclaimer ? disclaimer : steps).push(sentence);
  }
  return { steps, disclaimer };
}
