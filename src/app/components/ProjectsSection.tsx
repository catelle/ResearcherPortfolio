import { motion } from "motion/react";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Link } from "react-router";
import { useData } from "../context/DataContext";
import { useLocale } from "../context/LocaleContext";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { getLocalizedText, getProjectHref } from "../lib/portfolio-content";
import { SectionVisualBackground } from "./SectionVisualBackground";
import { buildPublicSitePath } from "../lib/site-routing";

export function ProjectsSection() {
  const { content, activeSite } = useData();
  const { locale, copy } = useLocale();
  const { projects, site } = content;
  const currentSiteSlug = activeSite?.slug ?? null;
  const previewItems = projects.items.slice(0, projects.previewCount);

  return (
    <section id="projects" className="relative py-32 bg-background">
      <SectionVisualBackground
        site={site}
        sectionKey="projects"
        align="right"
        iconNames={["Target", "Zap", "TrendingUp", "Globe", "Code", "Brain"]}
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
            {getLocalizedText(projects.heading, locale)}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {getLocalizedText(projects.intro, locale)}
          </p>
          <div className="w-24 h-1 theme-accent-line mx-auto mt-6 rounded-full" />
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {previewItems.map((project, index) => (
            <motion.article
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.08 * index }}
              whileHover={{ y: -6 }}
              className="group"
            >
              <div className="h-full overflow-hidden rounded-3xl bg-card border border-border theme-accent-hover-border transition-all duration-300 shadow-sm">
                <div className="relative aspect-[16/10] bg-muted">
                  <ImageWithFallback
                    src={project.image}
                    alt={
                      getLocalizedText(project.imageAlt, locale) ||
                      getLocalizedText(project.title, locale)
                    }
                    className="w-full h-full object-cover"
                  />

                  <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5">
                    <span className="px-3 py-1 rounded-full text-xs font-medium theme-accent-badge">
                      {getLocalizedText(project.category, locale)}
                    </span>
                    {project.featured ? (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-background/85 text-foreground border border-border">
                        {copy.common.featured}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="p-7 space-y-5">
                  <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {project.year ? <span>{project.year}</span> : null}
                    {getLocalizedText(project.client, locale) ? (
                      <span>{getLocalizedText(project.client, locale)}</span>
                    ) : null}
                    {getLocalizedText(project.role, locale) ? (
                      <span>{getLocalizedText(project.role, locale)}</span>
                    ) : null}
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-foreground">
                      {getLocalizedText(project.title, locale)}
                    </h3>
                    <p className="mt-3 text-muted-foreground leading-relaxed">
                      {getLocalizedText(project.summary, locale) ||
                        getLocalizedText(project.problem, locale)}
                    </p>
                  </div>

                  {project.techStack.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {project.techStack.slice(0, 4).map((tech) => (
                        <span
                          key={tech}
                          className="px-3 py-1 text-xs rounded-full bg-muted text-foreground border border-border"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  {project.impact ? (
                    <p className="text-sm text-foreground/85 leading-relaxed border-l-2 theme-accent-border pl-4">
                      {getLocalizedText(project.impact, locale)}
                    </p>
                  ) : null}

                  <div className="flex items-center justify-between gap-4 pt-2">
                    <Link
                      to={getProjectHref(project, currentSiteSlug)}
                      className="inline-flex items-center gap-2 theme-accent-text font-medium"
                    >
                      {copy.projects.viewCaseStudy}
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                    {(project.demoUrl || project.repositoryUrl) ? (
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        {project.demoUrl ? (
                          <a
                            href={project.demoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 hover:text-foreground transition-colors"
                          >
                            {copy.common.demo}
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        ) : null}
                        {project.repositoryUrl ? (
                          <a
                            href={project.repositoryUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 hover:text-foreground transition-colors"
                          >
                            {copy.common.repo}
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {projects.items.length > previewItems.length ? (
          <div className="flex justify-center mt-12">
            <Link
              to={buildPublicSitePath(currentSiteSlug, "/projects")}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-muted border border-border text-foreground hover:bg-accent transition-colors"
            >
              {getLocalizedText(projects.viewAllLabel, locale)}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
