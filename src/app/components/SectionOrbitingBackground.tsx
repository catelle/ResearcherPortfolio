import { iconMap } from "../lib/icon-maps";
import { cn } from "./ui/utils";

type OrbitIconName = keyof typeof iconMap;

const defaultIcons: OrbitIconName[] = [
  "Shield",
  "Code",
  "Globe2",
  "Users",
  "Heart",
  "Zap",
  "Target",
  "Brain",
];

function fillIcons(items: OrbitIconName[], minimumCount: number) {
  if (items.length === 0) {
    return defaultIcons.slice(0, minimumCount);
  }

  const result = [...items];
  let cursor = 0;

  while (result.length < minimumCount) {
    result.push(items[cursor % items.length]);
    cursor += 1;
  }

  return result;
}

export function SectionOrbitingBackground({
  enabled,
  iconNames = defaultIcons,
  align = "right",
}: {
  enabled: boolean;
  iconNames?: OrbitIconName[];
  align?: "left" | "right" | "center";
}) {
  if (!enabled) {
    return null;
  }

  const outerIcons = fillIcons(iconNames.slice(0, 5), 5);
  const innerIcons = fillIcons(iconNames.slice(2), 4);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div
        className={cn(
          "absolute top-1/2 -translate-y-1/2 opacity-60",
          align === "left"
            ? "-left-24 md:left-0"
            : align === "center"
              ? "left-1/2 -translate-x-1/2"
              : "-right-24 md:right-0",
        )}
      >
        <div className="relative h-[20rem] w-[20rem] md:h-[28rem] md:w-[28rem]">
          <div className="absolute inset-[8%] rounded-full border border-border/60" />
          <div className="absolute inset-[24%] rounded-full border theme-accent-panel" />
          <div className="absolute inset-[36%] rounded-full border border-border/40" />
          <div className="absolute inset-[28%] rounded-full theme-accent-line opacity-10 blur-3xl" />

          <div style={{ animation: "orbit-spin 22s linear infinite" }} className="absolute inset-0">
            {outerIcons.map((iconName, index) => {
              const Icon = iconMap[iconName] ?? iconMap.Zap;
              const angle = (360 / outerIcons.length) * index;

              return (
                <div
                  key={`${iconName}-outer-${index}`}
                  className="absolute left-1/2 top-1/2"
                  style={{
                    transform: `rotate(${angle}deg) translateY(-11rem) rotate(${-angle}deg)`,
                  }}
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/60 bg-card/75 text-muted-foreground shadow-sm backdrop-blur md:h-12 md:w-12">
                    <Icon className="h-4 w-4 theme-accent-text md:h-5 md:w-5" />
                  </div>
                </div>
              );
            })}
          </div>

          <div
            style={{ animation: "orbit-spin 18s linear infinite reverse" }}
            className="absolute inset-[12%]"
          >
            {innerIcons.map((iconName, index) => {
              const Icon = iconMap[iconName] ?? iconMap.Zap;
              const angle = (360 / innerIcons.length) * index;

              return (
                <div
                  key={`${iconName}-inner-${index}`}
                  className="absolute left-1/2 top-1/2"
                  style={{
                    transform: `rotate(${angle}deg) translateY(-7rem) rotate(${-angle}deg)`,
                  }}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border/50 bg-background/80 shadow-sm backdrop-blur md:h-10 md:w-10">
                    <Icon className="h-4 w-4 text-foreground/80" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
