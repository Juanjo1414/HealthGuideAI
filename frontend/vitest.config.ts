import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(dirname, "./src") } },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    restoreMocks: true,
    // userEvent.type escribe tecla por tecla: con la máquina o el runner de CI
    // cargados, 5s (default) no alcanza y aparecen fallos que no son bugs.
    testTimeout: 20000,
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/test/**", "src/**/*.test.{ts,tsx}", "src/main.tsx", "src/vite-env.d.ts", "src/components/ui/**"],
      // Piso de la Sesión 12 (CONSTRAINTS.md: "se establece un piso cuando
      // exista"), apenas por debajo de lo medido (91/82/81/89). Ratchet: se
      // sube, nunca se baja.
      thresholds: { lines: 88, functions: 78, branches: 80, statements: 86 },
    },
  },
});
