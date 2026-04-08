import type { ReactNode } from "react";
import { motion } from "motion/react";
import {
  normalizeThemeAccentColor,
  DEFAULT_THEME_ACCENT,
} from "../lib/theme-accent";
import type { FormCardEffect } from "../lib/portfolio-content";
import { cn } from "./ui/utils";

function clamp(value: number, min = 0, max = 255) {
  return Math.min(max, Math.max(min, value));
}

function parseHexColor(value: string) {
  const normalized = normalizeThemeAccentColor(value);

  return {
    red: Number.parseInt(normalized.slice(1, 3), 16),
    green: Number.parseInt(normalized.slice(3, 5), 16),
    blue: Number.parseInt(normalized.slice(5, 7), 16),
  };
}

function toRgba(value: string, alpha: number) {
  const { red, green, blue } = parseHexColor(value);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function mixColor(base: string, target: string, amount: number) {
  const start = parseHexColor(base);
  const end = parseHexColor(target);
  const ratio = Math.min(1, Math.max(0, amount));

  const red = clamp(start.red + (end.red - start.red) * ratio);
  const green = clamp(start.green + (end.green - start.green) * ratio);
  const blue = clamp(start.blue + (end.blue - start.blue) * ratio);

  return `#${red.toString(16).padStart(2, "0")}${green
    .toString(16)
    .padStart(2, "0")}${blue.toString(16).padStart(2, "0")}`;
}

export function EffectCard({
  effect,
  className,
  contentClassName,
  children,
}: {
  effect: FormCardEffect | null | undefined;
  className?: string;
  contentClassName?: string;
  children: ReactNode;
}) {
  const activeEffect = effect?.style ?? "none";
  const color = normalizeThemeAccentColor(effect?.color ?? DEFAULT_THEME_ACCENT);
  const shineStart = mixColor(color, "#ffffff", 0.34);
  const shineMid = mixColor(color, "#ffffff", 0.16);
  const shineEnd = mixColor(color, "#111827", 0.18);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {activeEffect === "border-beam" ? (
        <motion.div
          aria-hidden="true"
          className="absolute -inset-[36%] rounded-[inherit]"
          style={{
            background: `conic-gradient(from 90deg at 50% 50%, transparent 0deg, transparent 250deg, ${toRgba(
              color,
              0.95,
            )} 308deg, transparent 340deg)`,
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
      ) : null}

      {activeEffect === "shine-border" ? (
        <motion.div
          aria-hidden="true"
          className="absolute inset-0 rounded-[inherit]"
          style={{
            background: `linear-gradient(120deg, ${shineStart}, ${shineMid}, ${shineEnd}, ${shineStart})`,
            backgroundSize: "220% 220%",
          }}
          animate={{
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      ) : null}

      <div
        className={cn(
          "relative rounded-[inherit] border border-border bg-card shadow-sm",
          activeEffect !== "none" ? "m-px" : "",
          contentClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}
