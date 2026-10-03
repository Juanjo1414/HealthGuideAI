import { describe, expect, it, vi } from "vitest";
import {
  applyPreferences,
  clearAllPreferences,
  loadAlias,
  loadCountry,
  loadFontScale,
  saveAlias,
  saveFontScale,
  saveReduceMotion,
} from "./preferences";

describe("preferences", () => {
  it("guarda y lee el alias, y lo borra con null", () => {
    saveAlias("Elena");
    expect(loadAlias()).toBe("Elena");
    saveAlias(null);
    expect(loadAlias()).toBeNull();
  });

  it("usa valores por defecto sensatos", () => {
    expect(loadFontScale()).toBe("16");
    expect(loadCountry()).toBe("CO");
  });

  it("aplica tamaño de letra y reducción de movimiento al documento", () => {
    saveFontScale("20");
    saveReduceMotion(true);
    applyPreferences();
    expect(document.documentElement.style.fontSize).toBe("20px");
    expect(document.documentElement.classList.contains("reduce-motion")).toBe(true);

    clearAllPreferences();
    applyPreferences();
    expect(document.documentElement.style.fontSize).toBe("16px");
    expect(document.documentElement.classList.contains("reduce-motion")).toBe(false);
  });

  it("no rompe la app si localStorage no está disponible (modo privado)", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("bloqueado");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("bloqueado");
    });
    expect(() => saveAlias("x")).not.toThrow();
    expect(loadAlias()).toBeNull();
    expect(loadFontScale()).toBe("16");
  });
});
