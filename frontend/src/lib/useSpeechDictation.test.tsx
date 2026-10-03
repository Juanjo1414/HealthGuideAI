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
});
