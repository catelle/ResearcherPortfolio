import { motion } from "motion/react";

function getUniqueSkills(skills: string[]) {
  return Array.from(
    new Set(
      skills
        .map((skill) => skill.trim())
        .filter(Boolean),
    ),
  );
}

function createRing(items: string[], radiusX: number, radiusY: number) {
  return items.map((item, index) => {
    const angle = (Math.PI * 2 * index) / items.length;

    return {
      item,
      x: Math.cos(angle) * radiusX,
      y: Math.sin(angle) * radiusY,
    };
  });
}

export function SkillsCloud({ skills }: { skills: string[] }) {
  const uniqueSkills = getUniqueSkills(skills).slice(0, 18);

  if (uniqueSkills.length === 0) {
    return null;
  }

  const outerRing = createRing(uniqueSkills.slice(0, 8), 190, 112);
  const middleRing = createRing(uniqueSkills.slice(8, 14), 132, 76);
  const innerRing = createRing(uniqueSkills.slice(14, 18), 78, 44);
  const rings = [...outerRing, ...middleRing, ...innerRing];

  return (
    <div className="relative mb-14 overflow-hidden rounded-[2rem] border border-border bg-card/75 px-6 py-8 shadow-sm">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--theme-accent-faint),transparent_62%)] opacity-80" />
      <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full theme-accent-line opacity-10 blur-3xl" />

      <div className="relative mx-auto flex h-[22rem] max-w-5xl items-center justify-center overflow-hidden">
        <div className="absolute left-1/2 top-1/2 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border theme-accent-panel bg-background/90 shadow-sm backdrop-blur">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.26em] text-muted-foreground">
              Skills
            </p>
            <p className="mt-2 text-sm font-semibold text-foreground">
              Live cloud
            </p>
          </div>
        </div>

        {rings.map(({ item, x, y }, index) => {
          const horizontalDrift = 8 + (index % 3) * 3;
          const verticalDrift = 5 + (index % 4) * 2;

          return (
            <motion.div
              key={item}
              initial={{ opacity: 0, scale: 0.92, x, y }}
              whileInView={{ opacity: 1, scale: 1, x, y }}
              viewport={{ once: true, amount: 0.2 }}
              animate={{
                x: [x, x + horizontalDrift, x - horizontalDrift, x],
                y: [y, y - verticalDrift, y + verticalDrift, y],
              }}
              transition={{
                duration: 7 + (index % 5),
                delay: index * 0.08,
                ease: "easeInOut",
                repeat: Infinity,
              }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            >
              <span className="inline-flex items-center rounded-full border border-border bg-background/90 px-4 py-2 text-sm text-foreground shadow-sm backdrop-blur">
                {item}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
