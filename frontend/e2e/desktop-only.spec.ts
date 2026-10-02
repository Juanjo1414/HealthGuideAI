import { expect, test } from "@playwright/test";
import { expectNoHorizontalOverflow, mockTriage, submitSymptoms, triageBody } from "./fixtures";

// Solo corre en el proyecto "desktop" (playwright.config.ts): fija sus propios
// anchos y prueba navegación por teclado, que no aplica a un emulador táctil.
test.describe("teclado", () => {
  test("el triaje se completa solo con teclado", async ({ page }) => {
    await mockTriage(page, 200, triageBody("BAJA"));
    await page.goto("/");

    await page.getByLabel(/describe tus síntomas/i).focus();
    await page.keyboard.type("Tengo tos seca y congestión desde hace dos días, sin fiebre.");
    await page.keyboard.press("Tab");
    while (!(await page.evaluate(() => document.activeElement?.textContent?.includes("Iniciar Evaluación")))) {
      await page.keyboard.press("Tab");
    }
    await page.keyboard.press("Enter");

    await expect(page).toHaveURL(/\/resultado$/);
    await expect(page.locator(":focus")).toContainText(/evaluación de triaje finalizada/i);
  });
});

test.describe("viewports del inventario (375 / 768 / 1024 / 1440)", () => {
  for (const width of [375, 768, 1024, 1440]) {
    test(`inicio y resultado a ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await mockTriage(page, 200, triageBody("ALTA"));
      await page.goto("/");
      await expectNoHorizontalOverflow(page);

      await submitSymptoms(page, "Tengo dolor abdominal intenso desde hace 6 horas y no mejora con reposo.");
      await expect(page).toHaveURL(/\/resultado$/);
      await expectNoHorizontalOverflow(page);
    });
  }
});
