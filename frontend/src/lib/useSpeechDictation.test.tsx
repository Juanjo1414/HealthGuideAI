import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useSpeechDictation } from "./useSpeechDictation";

type Listener = (event?: unknown) => void;

class FakeRecognition {
  static last: FakeRecognition | null = null;
  lang = "";
  continuous = false;
  interimResults = true;
  listeners: Record<string, Listener[]> = {};
  start = vi.fn();
  stop = vi.fn(() => this.emit("end"));
  constructor() {
    FakeRecognition.last = this;
  }
  addEventListener(type: string, listener: Listener) {
    (this.listeners[type] ??= []).push(listener);
  }
  emit(type: string, event?: unknown) {
    for (const listener of this.listeners[type] ?? []) listener(event);
  }
}

afterEach(() => {
  delete (window as unknown as Record<string, unknown>).webkitSpeechRecognition;
});

function startDictation() {
  (window as unknown as Record<string, unknown>).webkitSpeechRecognition = FakeRecognition;
  const hook = renderHook(() => useSpeechDictation(() => {}));
  act(() => hook.result.current.toggle());
  return { hook, rec: FakeRecognition.last! };
}



describe("useSpeechDictation", () => {
  it("sin soporte del navegador no ofrece el botón", () => {
    const { result } = renderHook(() => useSpeechDictation(() => {}));
    expect(result.current.supported).toBe(false);
  });

  it("dicta en español y entrega solo los resultados finales", () => {
    (window as unknown as Record<string, unknown>).webkitSpeechRecognition = FakeRecognition;
    const onText = vi.fn();
    const { result } = renderHook(() => useSpeechDictation(onText));

    act(() => result.current.toggle());
    const rec = FakeRecognition.last!;
    expect(rec.lang).toBe("es-ES");
    expect(result.current.listening).toBe(true);

    act(() =>
      rec.emit("result", {
        resultIndex: 0,
        results: [
          { isFinal: false, 0: { transcript: "parcial" } },
          { isFinal: true, 0: { transcript: " me duele la cabeza " } },
        ],
      })
    );
    expect(onText).toHaveBeenCalledTimes(1);
    expect(onText).toHaveBeenCalledWith("me duele la cabeza");

    act(() => result.current.toggle());
    expect(rec.stop).toHaveBeenCalled();
    expect(result.current.listening).toBe(false);
  });

  it.each([
    ["not-allowed", /permiso para usar el micrófono/i],
    ["no-speech", /no se escuchó nada/i],
    ["audio-capture", /no se encontró un micrófono/i],
    ["network", /conexión a internet/i],
    ["algo-raro", /error del navegador/i],
  ])("si el navegador falla con '%s' lo dice, en vez de volver a 'Hablar' en silencio", (code, message) => {
    const { hook, rec } = startDictation();

    act(() => {
      rec.emit("error", { error: code });
      rec.emit("end");
    });

    expect(hook.result.current.listening).toBe(false);
    expect(hook.result.current.error).toMatch(message);
  });

  it("detener a propósito ('aborted') no se muestra como error", () => {
    const { hook, rec } = startDictation();

    act(() => rec.emit("error", { error: "aborted" }));

    expect(hook.result.current.error).toBeNull();
  });

  it("el error se limpia al volver a intentar", () => {
    const { hook, rec } = startDictation();
    act(() => rec.emit("error", { error: "no-speech" }));
    expect(hook.result.current.error).not.toBeNull();

    act(() => hook.result.current.toggle());

    expect(hook.result.current.error).toBeNull();
    expect(hook.result.current.listening).toBe(true);
  });

  it("si start() lanza (ya hay una sesión abierta) no queda escuchando y avisa", () => {
    (window as unknown as Record<string, unknown>).webkitSpeechRecognition = class extends FakeRecognition {
      start = vi.fn(() => {
        throw new Error("InvalidStateError");
      });
    };
    const { result } = renderHook(() => useSpeechDictation(() => {}));

    act(() => result.current.toggle());

    expect(result.current.listening).toBe(false);
    expect(result.current.error).toMatch(/error del navegador/i);
  });
});
