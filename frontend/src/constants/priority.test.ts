import { describe, expect, it } from "vitest";
import { getPriorityMeta, PRIORITY_META } from "./priority";

describe("priority meta", () => {
  it("ordena los 4 niveles de menor a mayor severidad", () => {
    const levels = (["BAJA", "MEDIA", "ALTA", "EMERGENCIA"] as const).map((p) => PRIORITY_META[p].level);
    expect(levels).toEqual([1, 2, 3, 4]);
  });

  it("EMERGENCIA es la única con fondo sólido y texto blanco (se lee como la más grave)", () => {
    expect(PRIORITY_META.EMERGENCIA.badgeClass).toContain("bg-priority-emergencia-bg");
    expect(PRIORITY_META.EMERGENCIA.badgeClass).toContain("text-priority-emergencia-text");
  });

  it("nunca usa solo color: cada nivel tiene ícono y etiqueta de texto", () => {
    for (const meta of Object.values(PRIORITY_META)) {
      expect(meta.icon).toBeTruthy();
      expect(meta.label).toBeTruthy();
    }
  });

  it("cae en MEDIA ante un valor desconocido o nulo, nunca en BAJA", () => {
    expect(getPriorityMeta(null)).toBe(PRIORITY_META.MEDIA);
    expect(getPriorityMeta(undefined)).toBe(PRIORITY_META.MEDIA);
  });
});
