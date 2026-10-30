import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Dictado por voz con la Web Speech API del navegador (Chrome/Edge/Safari).
 * Todo ocurre en el navegador — no hay backend de voz. Si el navegador no
 * la soporta, `supported` es false y el botón "Hablar" de Stitch no se muestra.
 */
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  addEventListener(type: "result", listener: (event: RecognitionResultEvent) => void): void;
  addEventListener(type: "error", listener: (event: { error?: string }) => void): void;
  addEventListener(type: "end", listener: () => void): void;
}

interface RecognitionResultEvent {
  resultIndex: number;
  results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>;
}

type RecognitionCtor = new () => SpeechRecognitionLike;

/**
 * Por qué el navegador cortó el dictado. Antes el error se tragaba en silencio
 * y el botón volvía a "Hablar" sin explicación, que se leía como "no funciona".
 * "aborted" es el que dispara stop() a propósito: no es un error para el usuario.
 */
const ERROR_MESSAGES: Record<string, string> = {
  "not-allowed": "El navegador no tiene permiso para usar el micrófono. Permítelo en el candado de la barra de direcciones y vuelve a intentar.",
  "service-not-allowed": "El navegador no tiene permiso para usar el dictado por voz. Revisa los permisos del sitio y vuelve a intentar.",
  "no-speech": "No se escuchó nada. Acércate al micrófono y vuelve a intentar, o escribe tus síntomas.",
  "audio-capture": "No se encontró un micrófono disponible. Conéctalo o escribe tus síntomas.",
  network: "El dictado necesita conexión a internet: el navegador envía el audio a su servicio de voz. Revisa tu conexión o escribe tus síntomas.",
  "language-not-supported": "Tu navegador no soporta el dictado en español. Escribe tus síntomas.",
};
const GENERIC_ERROR = "El dictado se detuvo por un error del navegador. Vuelve a intentar o escribe tus síntomas.";

function messageFor(code: string | undefined): string | null {
  if (code === "aborted") return null;
  return (code && ERROR_MESSAGES[code]) || GENERIC_ERROR;
}

function getRecognitionCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function useSpeechDictation(onTranscript: (text: string) => void) {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const callbackRef = useRef(onTranscript);
  const supported = getRecognitionCtor() !== null;

  useEffect(() => {
    callbackRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => () => recognitionRef.current?.stop(), []);

  const toggle = useCallback(() => {
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;
    setError(null);
    const recognition = new Ctor();
    recognition.lang = "es-ES";
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.addEventListener("result", (event) => {
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (result.isFinal) callbackRef.current(result[0].transcript.trim());
      }
    });
    recognition.addEventListener("end", () => setListening(false));
    recognition.addEventListener("error", (event) => {
      setError(messageFor(event.error));
      setListening(false);
    });
    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      // start() lanza si el navegador ya tiene una sesión de dictado abierta.
      setError(GENERIC_ERROR);
      return;
    }
    setListening(true);
  }, [listening]);

  return { supported, listening, error, toggle };
}
