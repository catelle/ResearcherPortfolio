import type { ReactNode } from "react";
import { Navigation } from "./Navigation";
import { Footer } from "./Footer";
import { SitePointer } from "./SitePointer";
import { useData } from "../context/DataContext";

export function SiteLayout({
  children,
  mainClassName = "",
}: {
  children: ReactNode;
  mainClassName?: string;
}) {
  const { content } = useData();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <style>{`
        html {
          scroll-behavior: smooth;
        }
      `}</style>

      <SitePointer styleName={content.site.cursorStyle} />

      <Navigation />

      <main className={mainClassName}>{children}</main>

      <Footer />
    </div>
  );
}
