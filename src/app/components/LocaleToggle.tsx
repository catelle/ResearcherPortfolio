import { motion } from "motion/react";
import { useLocale } from "../context/LocaleContext";
import { cn } from "./ui/utils";

const localeOptions = [
  { value: "en", label: "EN" },
  { value: "fr", label: "FR" },
] as const;

export function LocaleToggle() {
  const { locale, setLocale } = useLocale();

  return (
    <div className="inline-flex items-center rounded-full border border-border bg-card/80 p-1">
      {localeOptions.map((option) => (
        <motion.button
          key={option.value}
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={() => setLocale(option.value)}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
            locale === option.value
              ? "theme-accent-button"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {option.label}
        </motion.button>
      ))}
    </div>
  );
}
