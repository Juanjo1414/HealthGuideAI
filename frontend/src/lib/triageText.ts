/**
 * Cómo se presentan los textos libres del modelo. El prompt (backend
 * contract.CONTENT_GUIDE) pide las causas como "categoría: por qué encaja" y la
 * recomendación en frases cortas que terminan con el disclaimer obligatorio.
 */

export interface CauseParts {
  name: string;
  reason: string | null;
}

/**
 * "tension muscular: dolor que empeora con..." → { name, reason }.
 * Corta solo en ": " (dos puntos + espacio), así una hora como "10:30" no parte
 * la causa. Sin separador (historial anterior al cambio de prompt) o con el
 * nombre vacío, la causa completa queda como nombre.
 */
export function splitCause(cause: string): CauseParts {
  const text = cause.trim();
  const match = /:\s+/.exec(text);
  if (!match) return { name: text, reason: null };
  const name = text.slice(0, match.index).trim();
  const reason = text.slice(match.index + match[0].length).trim();
  if (!name) return { name: reason || text, reason: null };
  return { name, reason: reason || null };
}

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

// Las oraciones EXACTAS de contract.DISCLAIMER (backend). Comparar por prefijo
// no alcanza: "Ante cualquier duda sobre la herida, ve a urgencias hoy." es una
// instrucción de escalamiento y tiene que quedar como paso, no como letra chica.
const DISCLAIMER_SENTENCES = [
  "esta orientacion puede no ser exacta y no reemplaza una evaluacion medica profesional.",
  "ante cualquier duda, o si los sintomas empeoran, consulta a un profesional de la salud.",
];

export function splitRecommendation(text: string): { steps: string[]; disclaimer: string[] } {
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
  const steps: string[] = [];
  const disclaimer: string[] = [];
  for (const sentence of sentences) {
    (DISCLAIMER_SENTENCES.includes(normalize(sentence)) ? disclaimer : steps).push(sentence);
  }
  return { steps, disclaimer };
}
