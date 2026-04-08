import { useEffect } from "react";
import { useData } from "../context/DataContext";
import { getThemeAccentCssVars } from "../lib/theme-accent";

export function ThemeAccentSync() {
  const { content } = useData();

  useEffect(() => {
    const root = document.documentElement;
    const accentVars = getThemeAccentCssVars(content.site.themeAccentColor);

    for (const [key, value] of Object.entries(accentVars)) {
      root.style.setProperty(key, value);
    }
  }, [content.site.themeAccentColor]);

  return null;
}
