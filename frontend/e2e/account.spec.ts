import { expect, test } from "@playwright/test";
import { signupViaUi, uniqueEmail } from "./fixtures";

/** Auth contra el backend real (Postgres + Redis del stack de compose). */
test.describe("cuenta", () => {
  test("signup → historial vacío → logout → login → historial", async ({ page }) => {
    const { email, password } = await signupViaUi(page);

    await page.goto("/historial");
    await expect(page.getByText(/todavía no tienes consultas guardadas/i)).toBeVisible();

    await page.goto("/perfil");
    await expect(page.getByLabel(/correo de la cuenta/i)).toHaveValue(email);
    await page.getByRole("button", { name: /cerrar sesión/i }).click();
    await page.goto("/historial");
    await expect(page).toHaveURL(/\/login$/);

    await page.getByLabel(/^correo electrónico/i).fill(email);
    await page.getByLabel(/^contraseña/i).fill(password);
    await page.getByRole("button", { name: /acceder a mi historial/i }).click();

    // Vuelve a la página que pedía antes de iniciar sesión.
    await expect(page).toHaveURL(/\/historial$/);
  });

  test("credenciales incorrectas: error sin decir qué campo falló", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/^correo electrónico/i).fill(uniqueEmail());
    await page.getByLabel(/^contraseña/i).fill("incorrecta");
    await page.getByRole("button", { name: /acceder a mi historial/i }).click();

    await expect(page.getByRole("alert")).toHaveText(/correo o contraseña incorrectos/i);
  });

  test("correo ya registrado al crear cuenta", async ({ page, browser }) => {
    const { email } = await signupViaUi(page);
    const other = await (await browser.newContext()).newPage();

    await other.goto("/signup");
    await other.getByLabel(/correo electrónico de contacto/i).fill(email);
    await other.getByLabel(/contraseña segura/i).fill("otraClave123");
    await other.getByRole("checkbox", { name: /acepto los términos/i }).check();
    await other.getByRole("checkbox", { name: /inteligencia artificial/i }).check();
    await other.getByRole("button", { name: /crear cuenta segura/i }).click();

    await expect(other.getByRole("alert")).toHaveText(/ya está registrado/i);
  });

  test("sesión expirada: el historial lo informa en vez de mostrar datos", async ({ page, context }) => {
    await signupViaUi(page);
    await context.clearCookies();

    // Navegación del lado del cliente: la app todavía cree tener sesión, pero
    // el backend ya no la reconoce — el 401 tiene que verse, no ocultarse.
    await page.getByRole("link", { name: /mi historial|historial/i }).first().click();

    await expect(page.getByRole("alert")).toContainText(/inicia sesión/i);
  });

  test("borrar el historial desde el perfil funciona en el navegador (CORS DELETE)", async ({ page }) => {
    await signupViaUi(page);
    await page.goto("/perfil");
    await page.getByRole("button", { name: /privacidad y datos/i }).click();

    await page.getByRole("button", { name: /purgar historial completo/i }).click();
    await page.getByRole("button", { name: /sí, borrar todo/i }).click();

    await expect(page.getByText(/fue borrado de forma definitiva/i)).toBeVisible();
  });

  test("historial y perfil exigen sesión", async ({ page }) => {
    for (const path of ["/historial", "/perfil"]) {
      await page.goto(path);
      await expect(page).toHaveURL(/\/login$/);
    }
  });
});
