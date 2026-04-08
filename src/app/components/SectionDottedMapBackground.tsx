import { useId } from "react";
import { motion } from "motion/react";
import {
  getCountryFlagUrl,
  getCountryMapDisplayName,
  getCountryMapPoint,
} from "../lib/country-map-data";

const VIEWBOX_WIDTH = 1000;
const VIEWBOX_HEIGHT = 500;

const continentEllipses = [
  { lat: 52, lng: -110, latRadius: 26, lngRadius: 56 },
  { lat: 67, lng: -42, latRadius: 12, lngRadius: 18 },
  { lat: 16, lng: -91, latRadius: 10, lngRadius: 16 },
  { lat: -16, lng: -60, latRadius: 33, lngRadius: 24 },
  { lat: 52, lng: 15, latRadius: 12, lngRadius: 25 },
  { lat: 6, lng: 20, latRadius: 36, lngRadius: 24 },
  { lat: -20, lng: 47, latRadius: 9, lngRadius: 6 },
  { lat: 34, lng: 92, latRadius: 28, lngRadius: 82 },
  { lat: 15, lng: 103, latRadius: 18, lngRadius: 22 },
  { lat: -25, lng: 135, latRadius: 14, lngRadius: 20 },
];

function isPointOnLand(lat: number, lng: number) {
  return continentEllipses.some((ellipse) => {
    const latDelta = (lat - ellipse.lat) / ellipse.latRadius;
    const lngDelta = (lng - ellipse.lng) / ellipse.lngRadius;

    return latDelta * latDelta + lngDelta * lngDelta <= 1;
  });
}

function projectToMap(lat: number, lng: number) {
  return {
    x: ((lng + 180) / 360) * VIEWBOX_WIDTH,
    y: ((90 - lat) / 180) * VIEWBOX_HEIGHT,
  };
}

const landDots: Array<{ x: number; y: number }> = [];

for (let lat = -58; lat <= 78; lat += 7.5) {
  for (let lng = -177.5; lng <= 177.5; lng += 7.5) {
    if (isPointOnLand(lat, lng)) {
      landDots.push(projectToMap(lat, lng));
    }
  }
}

export function SectionDottedMapBackground({
  countryCode,
  label,
}: {
  countryCode: string;
  label: string;
}) {
  const marker = getCountryMapPoint(countryCode);
  const id = useId();

  if (!marker) {
    return null;
  }

  const { x, y } = projectToMap(marker.lat, marker.lng);
  const markerLabel = label.trim() || getCountryMapDisplayName(marker.code);
  const markerRadius = 18;
  const flagRadius = 13;
  const labelWidth = Math.max(98, markerLabel.length * 8.5 + 28);
  const showLabelOnLeft = x > VIEWBOX_WIDTH - 180;
  const labelX = showLabelOnLeft ? x - labelWidth - markerRadius - 16 : x + markerRadius + 12;
  const labelY = y - 18;
  const clipId = `${id}-flag-clip`.replace(/:/g, "-");

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--theme-accent-faint),transparent_68%)] opacity-60" />

      <div className="absolute inset-0 flex items-center justify-center px-6 py-10">
        <svg
          viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
          className="h-full w-full max-w-6xl opacity-70"
          preserveAspectRatio="xMidYMid meet"
        >
          {landDots.map((dot, index) => (
            <circle
              key={`${dot.x}-${dot.y}-${index}`}
              cx={dot.x}
              cy={dot.y}
              r={2.1}
              fill="var(--theme-accent)"
              opacity="0.18"
            />
          ))}

          <defs>
            <clipPath id={clipId}>
              <circle cx={x} cy={y} r={flagRadius} />
            </clipPath>
          </defs>

          <motion.circle
            cx={x}
            cy={y}
            r={markerRadius + 10}
            fill="var(--theme-accent)"
            opacity={0.12}
            animate={{ r: [markerRadius + 6, markerRadius + 16, markerRadius + 6], opacity: [0.12, 0.24, 0.12] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <circle cx={x} cy={y} r={markerRadius} fill="rgba(17,24,39,0.85)" />
          <image
            href={getCountryFlagUrl(marker.code)}
            x={x - flagRadius}
            y={y - flagRadius}
            width={flagRadius * 2}
            height={flagRadius * 2}
            preserveAspectRatio="xMidYMid slice"
            clipPath={`url(#${clipId})`}
          />
          <circle
            cx={x}
            cy={y}
            r={flagRadius}
            fill="transparent"
            stroke="rgba(255,255,255,0.7)"
            strokeWidth="1.5"
          />

          <rect
            x={labelX}
            y={labelY}
            width={labelWidth}
            height={36}
            rx={18}
            fill="rgba(17,24,39,0.76)"
            stroke="rgba(255,255,255,0.12)"
          />
          <text
            x={labelX + 16}
            y={labelY + 22}
            fill="white"
            fontSize="14"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            {markerLabel}
          </text>
        </svg>
      </div>
    </div>
  );
}
