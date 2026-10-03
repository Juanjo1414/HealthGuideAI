import type { ReactNode } from "react";
import SiteHeader, { MobileTabBar } from "./SiteHeader";
import SiteFooter from "./SiteFooter";

/** Estructura común de todas las pantallas de Stitch: header fijo + main + footer legal. */
export default function PageShell({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="w-full pt-20 bg-surface min-h-[calc(100vh-140px)]">{children}</main>
      <SiteFooter />
      <MobileTabBar />
    </>
  );
}
