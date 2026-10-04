import { describe, expect, it } from "vitest";
import { splitCause, splitRecommendation } from "./triageText";

const DISCLAIMER =
  "Esta orientacion puede no ser exacta y no reemplaza una evaluacion medica profesional. Ante cualquier duda, o si los sintomas empeoran, consulta a un profesional de la salud.";

describe("splitCause", () => {
  it("separa la categoría de la explicación", () => {
    expect(splitCause("tension muscular: dolor que empeora con el esfuerzo")).toEqual({
      name: "tension muscular",
      reason: "dolor que empeora con el esfuerzo",
    });
  });

  it("acepta causas sin explicación (historial anterior al cambio de prompt)", () => {
    expect(splitCause("infeccion viral leve")).toEqual({ name: "infeccion viral leve", reason: null });
    expect(splitCause("algo:")).toEqual({ name: "algo:", reason: null });
  });

  it("una hora no parte la causa", () => {
    expect(splitCause("dolor que empezo a las 10:30 tras comer")).toEqual({
      name: "dolor que empezo a las 10:30 tras comer",
      reason: null,
    });
  });

  it("nunca devuelve un nombre vacío", () => {
    expect(splitCause("  : sin nombre")).toEqual({ name: "sin nombre", reason: null });
  });
});

describe("splitRecommendation", () => {
  it("separa los pasos del disclaimer, con o sin tildes", () => {
    expect(splitRecommendation(`Agenda una consulta esta semana. Lleva un registro del dolor. ${DISCLAIMER}`)).toEqual({
      steps: ["Agenda una consulta esta semana.", "Lleva un registro del dolor."],
      disclaimer: [
        "Esta orientacion puede no ser exacta y no reemplaza una evaluacion medica profesional.",
        "Ante cualquier duda, o si los sintomas empeoran, consulta a un profesional de la salud.",
      ],
    });
    expect(
      splitRecommendation("Descansa. Esta orientación puede no ser exacta y no reemplaza una evaluación médica profesional.")
        .disclaimer
    ).toHaveLength(1);
  });

  it("una instrucción de escalamiento que empieza parecido sigue siendo un paso", () => {
    const { steps, disclaimer } = splitRecommendation(
      `Ante cualquier duda sobre la herida o si aparece fiebre, ve a urgencias hoy. Esta orientacion puede no ser exacta: ve a urgencias si empeora. ${DISCLAIMER}`
    );

    expect(steps).toEqual([
      "Ante cualquier duda sobre la herida o si aparece fiebre, ve a urgencias hoy.",
      "Esta orientacion puede no ser exacta: ve a urgencias si empeora.",
    ]);
    expect(disclaimer).toHaveLength(2);
  });

  it("sin disclaimer, todo son pasos", () => {
    expect(splitRecommendation("Descansa. Hidrátate.")).toEqual({ steps: ["Descansa.", "Hidrátate."], disclaimer: [] });
  });
});
