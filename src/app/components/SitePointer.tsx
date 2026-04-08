import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { Heart } from "lucide-react";
import type { SiteCursorStyle } from "../lib/portfolio-content";

function PointerShape({ styleName }: { styleName: Exclude<SiteCursorStyle, "default"> }) {
  if (styleName === "emoji") {
    return (
      <motion.div
        animate={{ rotate: [0, 7, -7, 0], scale: [0.92, 1.05, 0.92] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        className="text-2xl drop-shadow-sm"
      >
        👆
      </motion.div>
    );
  }

  if (styleName === "heart") {
    return (
      <motion.div
        animate={{ scale: [0.94, 1.08, 0.94] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/90 shadow-lg backdrop-blur"
      >
        <Heart className="h-5 w-5 theme-accent-text fill-current" />
      </motion.div>
    );
  }

  if (styleName === "ring") {
    return (
      <motion.div
        animate={{ scale: [0.96, 1.04, 0.96] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        className="relative h-9 w-9 rounded-full border-2 theme-accent-border bg-background/10 shadow-[0_0_24px_var(--theme-accent-soft)] backdrop-blur-sm"
      >
        <div className="absolute inset-[11px] rounded-full theme-accent-dot opacity-70" />
      </motion.div>
    );
  }

  return (
    <div className="relative h-8 w-8">
      <div className="absolute inset-0 rounded-full border theme-accent-border opacity-45" />
      <motion.div
        animate={{ scale: [0.9, 1.18, 0.9] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-[9px] rounded-full theme-accent-dot shadow-[0_0_22px_var(--theme-accent-soft)]"
      />
    </div>
  );
}

export function SitePointer({
  styleName,
}: {
  styleName: SiteCursorStyle | null | undefined;
}) {
  const activeStyle = styleName ?? "default";
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const smoothX = useSpring(x, { stiffness: 500, damping: 36, mass: 0.35 });
  const smoothY = useSpring(y, { stiffness: 500, damping: 36, mass: 0.35 });
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (activeStyle === "default") {
      setEnabled(false);
      return;
    }

    const mediaQuery = window.matchMedia("(pointer: fine)");
    const sync = () => {
      setEnabled(mediaQuery.matches);
    };

    sync();
    mediaQuery.addEventListener("change", sync);

    return () => {
      mediaQuery.removeEventListener("change", sync);
    };
  }, [activeStyle]);

  useEffect(() => {
    document.documentElement.classList.remove("has-custom-pointer");

    if (!enabled || activeStyle === "default") {
      return;
    }

    document.documentElement.classList.add("has-custom-pointer");

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") {
        return;
      }

      setVisible(true);
      x.set(event.clientX);
      y.set(event.clientY);
    };

    const handlePointerLeave = () => {
      setVisible(false);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerdown", handlePointerMove);
    window.addEventListener("pointerleave", handlePointerLeave);
    window.addEventListener("blur", handlePointerLeave);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("blur", handlePointerLeave);
      document.documentElement.classList.remove("has-custom-pointer");
    };
  }, [activeStyle, enabled, x, y]);

  if (activeStyle === "default" || !enabled) {
    return null;
  }

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[120]"
      style={{ x: smoothX, y: smoothY, opacity: visible ? 1 : 0 }}
    >
      <div className="-translate-x-1/2 -translate-y-1/2">
        <PointerShape
          styleName={activeStyle as Exclude<SiteCursorStyle, "default">}
        />
      </div>
    </motion.div>
  );
}
