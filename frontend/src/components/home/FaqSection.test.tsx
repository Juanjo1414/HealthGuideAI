import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import FaqSection from "./FaqSection";
import { renderAt } from "../../test/utils";

describe("FaqSection", () => {
  it("tiene un título y todas las preguntas cerradas al inicio", () => {
    const { container } = renderAt(<FaqSection />);

    expect(screen.getByRole("heading", { level: 2, name: /preguntas frecuentes/i })).toBeInTheDocument();
    const items = container.querySelectorAll("details");
    expect(items.length).toBeGreaterThanOrEqual(8);
    items.forEach((item) => expect(item).not.toHaveAttribute("open"));
  });

  it("cada pregunta se abre y se cierra con su resumen", async () => {
    const { container } = renderAt(<FaqSection />);
    const first = container.querySelector("details") as HTMLDetailsElement;

    await userEvent.click(within(first).getByText(/qué es healthguide ai/i));
    expect(first).toHaveAttribute("open");

    await userEvent.click(within(first).getByText(/qué es healthguide ai/i));
    expect(first).not.toHaveAttribute("open");
  });

  it("las reglas de seguridad del producto aparecen y no se contradicen", () => {
    const { container } = renderAt(<FaqSection />);
    const text = container.textContent ?? "";

    expect(text).toMatch(/nunca diagnostica/i);
    expect(text).toMatch(/no, ni por nombre ni por tipo/i);
    expect(text).toMatch(/puede equivocarse/i);
    expect(text).toMatch(/llama al 123/i);
    // No promete lo que el producto no hace.
    expect(text).not.toMatch(/garantiza|100 ?% (seguro|preciso)|certificad/i);
  });

  it("enlaza a Términos y Privacidad para el detalle de los datos", () => {
    renderAt(<FaqSection />);

    expect(screen.getByRole("link", { name: /términos y privacidad/i })).toHaveAttribute("href", "/terminos");
  });
});
