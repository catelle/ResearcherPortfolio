import { motion } from "motion/react";

export function PageHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className="relative overflow-hidden bg-background pt-36 pb-18 lg:pt-40 lg:pb-22">
      <div className="absolute inset-0 dark:opacity-100 opacity-0">
        <div className="absolute top-20 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full theme-accent-line opacity-10 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <p className="text-sm uppercase tracking-[0.25em] theme-accent-text mb-5">
            {eyebrow}
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
            {title}
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed">
            {description}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
