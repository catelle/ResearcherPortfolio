import { motion } from "motion/react";
import { useData } from "../context/DataContext";
import { iconMap } from "../lib/icon-maps";

export function AboutSection() {
  const { content } = useData();
  const { about } = content;

  return (
    <section id="about" className="relative py-32 bg-muted/30">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            {about.heading}
          </h2>
          <div className="w-24 h-1 theme-accent-line mx-auto rounded-full" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto mb-20"
        >
          <p className="text-xl text-foreground leading-relaxed mb-6 text-center">
            {about.introduction}
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed text-center">
            {about.description}
          </p>
        </motion.div>

        {/* Role cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {about.roles.map((role, index) => {
            const Icon = iconMap[role.icon as keyof typeof iconMap] ?? iconMap.Shield;

            return (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              whileHover={{ y: -8 }}
              className="group relative"
            >
              <div className="relative h-full p-8 rounded-2xl bg-card border border-border theme-accent-hover-border transition-all duration-300 shadow-sm">
                <div className="w-14 h-14 mb-6 rounded-xl theme-accent-solid flex items-center justify-center">
                  <Icon className="w-7 h-7 text-current" />
                </div>
                
                <h3 className="text-xl font-bold text-foreground mb-4">
                  {role.title}
                </h3>
                
                <p className="text-muted-foreground leading-relaxed">
                  {role.description}
                </p>
              </div>
            </motion.div>
          )})}
        </div>
      </div>
    </section>
  );
}
