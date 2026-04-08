import { motion } from "motion/react";
import { normalizeThemeAccentColor } from "../lib/theme-accent";

const particleSpecs = Array.from({ length: 32 }, (_, index) => {
  const seed = index + 1;

  return {
    id: index,
    left: (Math.sin(seed * 37.21) * 0.5 + 0.5) * 100,
    top: (Math.cos(seed * 24.83) * 0.5 + 0.5) * 100,
    size: 4 + (index % 5) * 3,
    duration: 8 + (index % 6),
    delay: index * 0.15,
  };
});

export function SectionParticlesBackground({
  color,
}: {
  color: string;
}) {
  const resolvedColor = normalizeThemeAccentColor(color);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(circle at center, var(--theme-accent-faint), transparent 65%)",
        }}
      />

      {particleSpecs.map((particle) => (
        <motion.span
          key={particle.id}
          className="absolute rounded-full blur-[1px]"
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: resolvedColor,
            boxShadow: `0 0 24px ${resolvedColor}`,
          }}
          animate={{
            x: [0, 10 - (particle.id % 3) * 8, 0],
            y: [0, -14 + (particle.id % 4) * 7, 0],
            opacity: [0.12, 0.42, 0.12],
            scale: [0.8, 1.12, 0.8],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
