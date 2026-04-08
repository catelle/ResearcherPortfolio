import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { iconMap } from "../lib/icon-maps";
import type { SocialLink } from "../lib/portfolio-content";

function DockItem({
  item,
  mouseX,
}: {
  item: SocialLink;
  mouseX: MotionValue<number>;
}) {
  const ref = useRef<HTMLAnchorElement | null>(null);
  const distance = useTransform(mouseX, (value) => {
    const element = ref.current;

    if (!element || Number.isInfinite(value)) {
      return 999;
    }

    const bounds = element.getBoundingClientRect();
    return value - bounds.left - bounds.width / 2;
  });
  const size = useTransform(distance, [-180, 0, 180], [44, 66, 44]);
  const y = useTransform(distance, [-180, 0, 180], [0, -10, 0]);
  const scale = useTransform(distance, [-180, 0, 180], [1, 1.08, 1]);
  const animatedSize = useSpring(size, { mass: 0.18, stiffness: 220, damping: 18 });
  const animatedY = useSpring(y, { mass: 0.18, stiffness: 220, damping: 18 });
  const animatedScale = useSpring(scale, {
    mass: 0.18,
    stiffness: 220,
    damping: 18,
  });
  const Icon = iconMap[item.icon as keyof typeof iconMap] ?? iconMap.Mail;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.a
          ref={ref}
          href={item.href}
          target={item.href.startsWith("http") ? "_blank" : undefined}
          rel={item.href.startsWith("http") ? "noreferrer" : undefined}
          style={{
            width: animatedSize,
            height: animatedSize,
            y: animatedY,
            scale: animatedScale,
          }}
          className="flex shrink-0 items-center justify-center rounded-full border border-border bg-card/95 text-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-accent"
          aria-label={item.label}
        >
          <Icon className="size-5" style={{ color: item.color }} />
        </motion.a>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={8}>
        <p>{item.label}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export function HeroSocialDock({ items }: { items: SocialLink[] }) {
  const mouseX = useMotionValue(Number.POSITIVE_INFINITY);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 flex justify-center">
      <motion.div
        onMouseMove={(event) => mouseX.set(event.clientX)}
        onMouseLeave={() => mouseX.set(Number.POSITIVE_INFINITY)}
        className="flex items-end gap-3 rounded-full border border-border bg-background/80 px-4 py-3 shadow-lg backdrop-blur-md"
      >
        {items.map((item) => (
          <DockItem key={item.id} item={item} mouseX={mouseX} />
        ))}
      </motion.div>
    </div>
  );
}
