import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { motion } from "motion/react";
import { SiteLayout } from "../components/SiteLayout";
import { PageHero } from "../components/PageHero";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useData } from "../context/DataContext";
import { getProjectHref } from "../lib/portfolio-content";

const PAGE_SIZE = 6;

export function ProjectsPage() {
  const { content } = useData();
  const orderedItems = content.projects.items;
  const categories = Array.from(
    new Set(orderedItems.map((item) => item.category).filter(Boolean)),
  );
  const [activeCategory, setActiveCategory] = useState("All");
  const filteredItems =
    activeCategory === "All"
      ? orderedItems
      : orderedItems.filter((item) => item.category === activeCategory);
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [activeCategory, content.projects.items.length]);

  const pageItems = filteredItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Case Studies"
        title={content.projects.heading}
        description={content.projects.intro}
      />

      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-3 mb-10">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-muted border border-border text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Home
            </Link>

            <button
              type="button"
              onClick={() => setActiveCategory("All")}
              className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                activeCategory === "All"
                  ? "theme-accent-badge border-transparent"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              All
            </button>

            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                  activeCategory === category
                    ? "theme-accent-badge border-transparent"
                    : "bg-card border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {pageItems.map((project, index) => (
              <motion.article
                key={project.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.05 * index }}
                className="group"
              >
                <div className="h-full rounded-3xl overflow-hidden bg-card border border-border theme-accent-hover-border shadow-sm">
                  <div className="relative aspect-[16/10] bg-muted">
                    <ImageWithFallback
                      src={project.image}
                      alt={project.imageAlt || project.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5">
                      <span className="px-3 py-1 rounded-full text-xs font-medium theme-accent-badge">
                        {project.category}
                      </span>
                      {project.featured ? (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-background/90 text-foreground border border-border">
                          Featured
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="p-7">
                    <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      {project.year ? <span>{project.year}</span> : null}
                      {project.client ? <span>{project.client}</span> : null}
                      {project.duration ? <span>{project.duration}</span> : null}
                    </div>

                    <h2 className="mt-4 text-2xl font-bold text-foreground">
                      {project.title}
                    </h2>
                    <p className="mt-3 text-muted-foreground leading-relaxed">
                      {project.summary || project.problem}
                    </p>

                    {project.techStack.length > 0 ? (
                      <div className="mt-5 flex flex-wrap gap-2">
                        {project.techStack.slice(0, 5).map((tech) => (
                          <span
                            key={tech}
                            className="px-3 py-1 text-xs rounded-full bg-muted text-foreground border border-border"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    <div className="mt-6 flex items-center justify-between gap-4">
                      <Link
                        to={getProjectHref(project)}
                        className="inline-flex items-center gap-2 theme-accent-text font-medium"
                      >
                        View full details
                        <ArrowRight className="w-4 h-4" />
                      </Link>

                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        {project.demoUrl ? (
                          <a
                            href={project.demoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 hover:text-foreground transition-colors"
                          >
                            Demo
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
                            Repo
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          {filteredItems.length === 0 ? (
            <div className="mt-12 rounded-3xl bg-card border border-border p-10 text-center text-muted-foreground">
              No projects match this filter yet.
            </div>
          ) : null}

          {filteredItems.length > PAGE_SIZE ? (
            <div className="mt-12 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page === 1}
                className="px-5 py-3 rounded-xl bg-card border border-border text-foreground disabled:opacity-50 transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
                disabled={page === totalPages}
                className="px-5 py-3 rounded-xl bg-card border border-border text-foreground disabled:opacity-50 transition-colors"
              >
                Next
              </button>
            </div>
          ) : null}
        </div>
      </section>
    </SiteLayout>
  );
}
