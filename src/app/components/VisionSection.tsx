import { motion } from "motion/react";
import { useData } from "../context/DataContext";
import { iconMap } from "../lib/icon-maps";

export function VisionSection() {
  const { content } = useData();
  const { vision } = content;

  return (
    <section id="vision" className="relative py-32 bg-background">
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            {vision.heading}
          </h2>
          <div className="w-24 h-1 theme-accent-line mx-auto rounded-full" />
        </motion.div>

        {/* Main vision statement */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-5xl mx-auto mb-20"
        >
          <div className="relative p-12 rounded-3xl bg-card border-2 theme-accent-panel shadow-lg">
            <div className="relative text-center">
              <p className="text-3xl lg:text-4xl font-bold text-foreground leading-relaxed mb-6">
                {vision.mainStatement}
              </p>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                {vision.subStatement}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Vision pillars */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {vision.pillars.map((pillar, index) => {
            const Icon = iconMap[pillar.icon as keyof typeof iconMap] ?? iconMap.Target;

            return (
            <motion.div
              key={pillar.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              whileHover={{ y: -8 }}
              className="group"
            >
              <div className="h-full p-6 rounded-2xl bg-card border border-border theme-accent-hover-border transition-all duration-300 shadow-sm text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl theme-accent-solid flex items-center justify-center">
                  <Icon className="w-7 h-7 text-current" />
                </div>
                
                <h3 className="text-lg font-bold text-foreground mb-3">
                  {pillar.title}
                </h3>
                
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            </motion.div>
          )})}
        </div>
      </div>
    </section>
  );
}
