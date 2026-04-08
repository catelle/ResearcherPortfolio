import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { useData } from "../context/DataContext";
import { SkillsCloud } from "./SkillsCloud";
import { SectionVisualBackground } from "./SectionVisualBackground";

export function SkillsSection() {
  const { content } = useData();
  const { skills, site } = content;
  const previewCategories = skills.categories.slice(0, skills.previewCategoryCount);
  const allSkills = skills.categories.flatMap((category) => category.skills);

  return (
    <section id="skills" className="relative py-32 bg-background">
      <SectionVisualBackground
        site={site}
        sectionKey="skills"
        align="left"
        iconNames={["Code", "Brain", "Shield", "Zap", "Target", "Lightbulb"]}
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
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
          <div className="w-24 h-1 theme-accent-line mx-auto mt-6 rounded-full" />
        </motion.div>

        {skills.showSkillCloud ? <SkillsCloud skills={allSkills} /> : null}

        <div className="grid md:grid-cols-2 gap-8">
          {previewCategories.map((category, categoryIndex) => {
            const hiddenSkillsCount = Math.max(
              category.skills.length - skills.previewSkillsPerCategory,
              0,
            );

            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.08 * categoryIndex }}
                className="group"
              >
                <div className="h-full p-8 rounded-3xl bg-card border border-border theme-accent-hover-border transition-all duration-300 shadow-sm">
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <h3 className="text-2xl font-bold text-foreground">
                        {category.title}
                      </h3>
                    </div>
                    <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      {category.skills.length} skills
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {category.skills
                      .slice(0, skills.previewSkillsPerCategory)
                      .map((skill) => (
                        <div
                          key={skill}
                          className="px-4 py-3 rounded-xl bg-muted border border-border text-sm text-foreground"
                        >
                          {skill}
                        </div>
                      ))}
                  </div>

                  {hiddenSkillsCount > 0 ? (
                    <p className="mt-5 text-sm text-muted-foreground">
                      +{hiddenSkillsCount} more in this category
                    </p>
                  ) : null}
                </div>
              </motion.div>
            );
          })}
        </div>

        {skills.categories.length > previewCategories.length ? (
          <div className="flex justify-center mt-12">
            <Link
              to="/skills"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-muted border border-border text-foreground hover:bg-accent transition-colors"
            >
              {skills.viewAllLabel}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
