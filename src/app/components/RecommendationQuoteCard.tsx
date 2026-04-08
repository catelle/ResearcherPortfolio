import { Quote } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import type { Recommendation } from "../lib/portfolio-content";
import { cn } from "./ui/utils";

export function RecommendationQuoteCard({
  item,
  className,
}: {
  item: Recommendation;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "rounded-3xl bg-card border border-border shadow-sm p-6 lg:p-8",
        className,
      )}
    >
      <div className="flex items-start gap-4">
        <ImageWithFallback
          src={item.photoUrl}
          alt={item.photoAlt || item.name}
          className="h-16 w-16 rounded-2xl object-cover shrink-0"
        />

        <div className="flex-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-foreground">{item.name}</h3>
              <p className="text-sm text-muted-foreground">
                {item.role}
                {item.company ? ` • ${item.company}` : ""}
              </p>
            </div>
            <Quote className="w-5 h-5 theme-accent-text shrink-0" />
          </div>

          <p className="mt-4 text-foreground leading-relaxed">{item.text}</p>
        </div>
      </div>
    </article>
  );
}
