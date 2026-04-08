import { motion } from "motion/react";
import { ExternalLink } from "lucide-react";
import { useData } from "../context/DataContext";
import { iconMap } from "../lib/icon-maps";

export function ProjectsSection() {
  const { content } = useData();
  const { projects } = content;

  return (
    <section id="projects" className="relative py-32 bg-background">
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            {projects.heading}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {projects.intro}
          </p>
          <div className="w-24 h-1 theme-accent-line mx-auto mt-6 rounded-full" />
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {projects.items.map((project, index) => {
            const IconComponent =
              iconMap[project.icon as keyof typeof iconMap] ?? iconMap.Shield;
            
            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                whileHover={{ y: -8 }}
                className="group relative"
              >
                <div className="relative h-full p-8 rounded-2xl bg-card border border-border theme-accent-hover-border transition-all duration-300 shadow-sm">
                  <div className="relative">
                    {/* Icon and category */}
                    <div className="flex items-start justify-between mb-6">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${project.color}20` }}
                      >
                        <IconComponent className="w-6 h-6" style={{ color: project.color }} />
                      </div>
                      <ExternalLink className="w-5 h-5 text-muted-foreground group-hover-theme-accent-text transition-colors" />
                    </div>

                    <h3 className="text-2xl font-bold text-foreground mb-2">
                      {project.title}
                    </h3>

                    <p className="text-sm theme-accent-text mb-6">
                      {project.category}
                    </p>

                    {/* Problem */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-muted-foreground mb-2">Problem</h4>
                      <p className="text-foreground leading-relaxed">
                        {project.problem}
                      </p>
                    </div>

                    {/* Solution */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-muted-foreground mb-2">Solution</h4>
                      <p className="text-foreground leading-relaxed">
                        {project.solution}
                      </p>
                    </div>

                    {/* Tech Stack */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-muted-foreground mb-2">Tech Stack</h4>
                      <div className="flex flex-wrap gap-2">
                        {project.techStack.map((tech) => (
                          <span
                            key={tech}
                            className="px-3 py-1 text-xs rounded-full bg-muted text-foreground border border-border"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Impact */}
                    <div className="pt-4 border-t border-border">
                      <h4 className="text-sm font-semibold theme-accent-text mb-2">Impact</h4>
                      <p className="text-muted-foreground italic leading-relaxed">
                        {project.impact}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
