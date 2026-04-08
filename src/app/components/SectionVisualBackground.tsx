import {
  resolveSectionBackgroundSettings,
  type PortfolioSectionKey,
  type SiteContent,
} from "../lib/portfolio-content";
import { SectionDottedMapBackground } from "./SectionDottedMapBackground";
import { SectionOrbitingBackground } from "./SectionOrbitingBackground";
import { SectionParticlesBackground } from "./SectionParticlesBackground";
import { iconMap } from "../lib/icon-maps";

export function SectionVisualBackground({
  site,
  sectionKey,
  align = "right",
  iconNames,
}: {
  site: SiteContent;
  sectionKey: PortfolioSectionKey;
  align?: "left" | "right" | "center";
  iconNames?: Array<keyof typeof iconMap>;
}) {
  const settings = resolveSectionBackgroundSettings(site, sectionKey);

  if (settings.style === "orbit") {
    return (
      <SectionOrbitingBackground
        enabled
        align={align}
        iconNames={iconNames}
      />
    );
  }

  if (settings.style === "particles") {
    return <SectionParticlesBackground color={settings.particlesColor} />;
  }

  if (settings.style === "dotted-map") {
    return (
      <SectionDottedMapBackground
        countryCode={settings.mapCountryCode}
        label={settings.mapLabel}
      />
    );
  }

  return null;
}
