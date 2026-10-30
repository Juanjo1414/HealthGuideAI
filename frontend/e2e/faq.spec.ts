import { expect, test } from "@playwright/test";

test.describe("FAQ de la portada", () => {
  test("se llega por ancla y cada pregunta abre su respuesta", async ({ page }) => {
    await page.goto("/#faq");

    await expect(page.getByRole("heading", { level: 2, name: /preguntas frecuentes/i })).toBeVisible();
    const question = page.getByText("¿Me da un diagnóstico?");
    await question.click();
    await expect(page.getByText(/nunca diagnostica una enfermedad/i)).toBeVisible();

    await question.click();
    await expect(page.getByText(/nunca diagnostica una enfermedad/i)).toBeHidden();
  });

  test("se maneja con teclado (Enter sobre la pregunta)", async ({ page }) => {
    await page.goto("/#faq");

    await page.locator("summary", { hasText: "¿Me recomienda medicamentos?" }).focus();
    await page.keyboard.press("Enter");

    await expect(page.getByText(/ni por nombre ni por tipo/i)).toBeVisible();
  });

  test("el encabezado tiene un enlace que lleva al FAQ", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "el menú del encabezado se oculta en móvil");
    await page.goto("/");

    await page.getByRole("link", { name: "FAQ", exact: true }).click();

    await expect(page).toHaveURL(/#faq$/);
    await expect(page.getByRole("heading", { level: 2, name: /preguntas frecuentes/i })).toBeInViewport();
  });
});
