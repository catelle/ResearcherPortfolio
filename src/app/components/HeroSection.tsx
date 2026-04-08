import { motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { useData } from "../context/DataContext";
import { useLocale } from "../context/LocaleContext";
import { getLocalizedText, getLocalizedTextList } from "../lib/portfolio-content";
import { HeroTerminal } from "./HeroTerminal";
import { HeroSocialDock } from "./HeroSocialDock";
import { SectionVisualBackground } from "./SectionVisualBackground";

export function HeroSection() {
  const { content } = useData();
  const { locale } = useLocale();
  const { hero, contact, site } = content;
  const showTerminalDescription = hero.descriptionDisplayMode === "terminal";

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      <SectionVisualBackground
        site={site}
        sectionKey="hero"
        align="right"
        iconNames={["Shield", "Code", "Globe2", "Users", "Heart", "Zap"]}
      />

      {/* Subtle background accent - only in dark mode */}
      <div className="absolute inset-0 dark:opacity-100 opacity-0">
        <motion.div
          className="absolute top-1/4 right-1/4 w-96 h-96 theme-accent-line rounded-full opacity-10 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="inline-block mb-6 px-4 py-2 rounded-full bg-muted border border-border"
            >
              <span className="text-sm tracking-wide text-muted-foreground">
                {getLocalizedText(hero.eyebrow, locale)}
              </span>
            </motion.div>

            <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight text-foreground">
              <span className="block">{getLocalizedText(hero.titlePrefix, locale)}</span>
              <span className="block theme-accent-text">
                {getLocalizedText(hero.titleAccent, locale)}
              </span>
            </h1>

            <p className="text-xl lg:text-2xl text-foreground mb-4 leading-relaxed">
              {getLocalizedText(hero.role, locale)}
            </p>

            {showTerminalDescription ? (
              <div className="mb-10">
                <HeroTerminal
                  lines={getLocalizedTextList(hero.terminalLines, locale)}
                  fallbackText={getLocalizedText(hero.description, locale)}
                />
              </div>
            ) : (
              <p className="text-lg text-muted-foreground mb-10 leading-relaxed max-w-xl">
                {getLocalizedText(hero.description, locale)}
              </p>
            )}

            <div className="flex flex-wrap gap-4">
              <motion.a
                href="#projects"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 theme-accent-button rounded-lg font-medium shadow-lg transition-colors"
              >
                {getLocalizedText(hero.primaryCtaLabel, locale)}
              </motion.a>

              <motion.a
                href="#contact"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-muted text-foreground rounded-lg font-medium border border-border hover:bg-accent transition-colors"
              >
                {getLocalizedText(hero.secondaryCtaLabel, locale)}
              </motion.a>
            </div>
          </motion.div>

          {/* Portrait */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden border-2 theme-accent-panel">
                <img
                  src={hero.portraitUrl}
                  alt={getLocalizedText(hero.portraitAlt, locale)}
                  className="w-full h-auto aspect-[3/4] object-cover"
                />
              </div>

              {hero.showSocialDock ? (
                <HeroSocialDock items={contact.socialLinks} locale={locale} />
              ) : null}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <ChevronDown className="w-8 h-8 text-muted-foreground" />
      </motion.div>
    </section>
  );
}
