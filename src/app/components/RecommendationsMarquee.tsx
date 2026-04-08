import { RecommendationQuoteCard } from "./RecommendationQuoteCard";
import { Marquee } from "./ui/marquee";
import type { Recommendation } from "../lib/portfolio-content";

function repeatItems(items: Recommendation[], minimumCount: number, offset = 0) {
  if (items.length === 0) {
    return [];
  }

  const rotated = items.map(
    (_, index) => items[(index + offset) % items.length],
  );
  const result = [...rotated];
  let cursor = 0;

  while (result.length < minimumCount) {
    result.push(rotated[cursor % rotated.length]);
    cursor += 1;
  }

  return result;
}

function splitRows(items: Recommendation[]) {
  if (items.length <= 6) {
    return {
      firstRow: repeatItems(items, 8),
      secondRow: repeatItems(items, 8, items.length > 1 ? 1 : 0),
    };
  }

  const midpoint = Math.ceil(items.length / 2);

  return {
    firstRow: repeatItems(items.slice(0, midpoint), 6),
    secondRow: repeatItems(items.slice(midpoint), 6),
  };
}

export function RecommendationsMarquee({
  items,
}: {
  items: Recommendation[];
}) {
  const { firstRow, secondRow } = splitRows(items);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="relative flex w-full flex-col gap-4 overflow-hidden">
      <Marquee pauseOnHover className="[--duration:60s] [--gap:0.75rem]">
        {firstRow.map((item, index) => (
          <RecommendationQuoteCard
            key={`${item.id}-row-1-${index}`}
            item={item}
            className="h-full w-[40rem] md:w-[42rem] xl:w-[45rem] shrink-0 p-4 lg:p-5"
          />
        ))}
      </Marquee>

      {secondRow.length > 0 ? (
        <Marquee reverse pauseOnHover className="[--duration:120s] [--gap:0.75rem]">
          {secondRow.map((item, index) => (
            <RecommendationQuoteCard
              key={`${item.id}-row-2-${index}`}
              item={item}
              className="h-full w-[40rem] md:w-[42rem] xl:w-[45rem] shrink-0 p-4 lg:p-5"
            />
          ))}
        </Marquee>
      ) : null}

      <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-background to-transparent" />
    </div>
  );
}
