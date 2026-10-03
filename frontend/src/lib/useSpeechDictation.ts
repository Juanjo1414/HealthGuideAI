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
  addEventListener(type: "end" | "error", listener: () => void): void;
}

interface RecognitionResultEvent {
  resultIndex: number;
  results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>;
}

type RecognitionCtor = new () => SpeechRecognitionLike;

function getRecognitionCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function useSpeechDictation(onTranscript: (text: string) => void) {
  const [listening, setListening] = useState(false);
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
    recognition.addEventListener("error", () => setListening(false));
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [listening]);

  return { supported, listening, toggle };
}
