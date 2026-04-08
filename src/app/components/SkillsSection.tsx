import { motion } from "motion/react";
import { useData } from "../context/DataContext";

export function SkillsSection() {
  const { content } = useData();
  const { skills } = content;

  return (
    <section id="skills" className="relative py-32 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            {skills.heading}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {skills.intro}
          </p>
          <div className="w-24 h-1 bg-[#a855f7] mx-auto mt-6 rounded-full" />
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {skills.categories.map((category, categoryIndex) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 * categoryIndex }}
              className="group"
            >
              <div className="h-full p-8 rounded-2xl bg-card border border-border hover:border-[#a855f7]/50 transition-all duration-300 shadow-sm">
                <div className="flex items-center mb-6">
                  <div
                    className="w-3 h-3 rounded-full mr-3"
                    style={{ backgroundColor: category.color }}
                  />
                  <h3 className="text-2xl font-bold text-foreground">
                    {category.title}
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {category.skills.map((skill, skillIndex) => (
                    <motion.div
                      key={skill}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.05 * skillIndex }}
                      className="relative group/skill"
                    >
                      <div className="px-4 py-3 rounded-lg bg-muted border border-border hover:border-border/50 transition-all duration-200 hover:bg-accent">
                        <p className="text-sm text-foreground">
                          {skill}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
