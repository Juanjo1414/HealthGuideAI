import { describe, expect, it } from "vitest";
import { splitCause, splitRecommendation } from "./triageText";

describe("splitCause", () => {
  it("separa el nombre de la explicación", () => {
    expect(splitCause("cefalea tensional: dolor persistente sin fiebre")).toEqual({
      name: "cefalea tensional",
      reason: "dolor persistente sin fiebre",
    });
  });

  it("acepta causas sin explicación (historial anterior al cambio de prompt)", () => {
    expect(splitCause("infeccion viral leve")).toEqual({ name: "infeccion viral leve", reason: null });
    expect(splitCause("algo:")).toEqual({ name: "algo", reason: null });
  });
});

describe("splitRecommendation", () => {
  it("separa los pasos del disclaimer, con o sin tildes", () => {
    const text =
      "Agenda una consulta esta semana. Lleva un registro del dolor. Esta orientacion puede no ser exacta y no reemplaza una evaluacion. Ante cualquier duda, consulta a un profesional.";

    expect(splitRecommendation(text)).toEqual({
      steps: ["Agenda una consulta esta semana.", "Lleva un registro del dolor."],
      disclaimer: [
        "Esta orientacion puede no ser exacta y no reemplaza una evaluacion.",
        "Ante cualquier duda, consulta a un profesional.",
      ],
    });
    expect(splitRecommendation("Descansa. Esta orientación puede no ser exacta.").disclaimer).toHaveLength(1);
  });

  it("sin disclaimer, todo son pasos", () => {
    expect(splitRecommendation("Descansa. Hidrátate.")).toEqual({ steps: ["Descansa.", "Hidrátate."], disclaimer: [] });
  });
});
