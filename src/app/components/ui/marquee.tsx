import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "./utils";

export function Marquee({
  children,
  className,
  pauseOnHover = false,
  reverse = false,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  pauseOnHover?: boolean;
  reverse?: boolean;
}) {
  return (
    <div
      className={cn(
        "group flex overflow-hidden [--gap:1rem] [--duration:24s]",
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          "flex min-w-max shrink-0 items-stretch gap-[var(--gap)] animate-marquee",
          reverse && "animate-marquee-reverse",
          pauseOnHover && "group-hover:[animation-play-state:paused]",
        )}
      >
        {children}
      </div>
      <div
        aria-hidden="true"
        className={cn(
          "flex min-w-max shrink-0 items-stretch gap-[var(--gap)] animate-marquee",
          reverse && "animate-marquee-reverse",
          pauseOnHover && "group-hover:[animation-play-state:paused]",
        )}
      >
        {children}
      </div>
    </div>
  );
}
