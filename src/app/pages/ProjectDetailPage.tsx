import { Link, useParams } from "react-router";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { SiteLayout } from "../components/SiteLayout";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { RichTextBlocks } from "../components/RichTextBlocks";
import { useData } from "../context/DataContext";
import { useLocale } from "../context/LocaleContext";
import { findProjectBySlug, getLocalizedText, getLocalizedTextList } from "../lib/portfolio-content";

export function ProjectDetailPage() {
  const { slug } = useParams();
  const { content } = useData();
  const { locale, copy } = useLocale();
  const project = findProjectBySlug(content.projects.items, slug);

  if (!project) {
    return (
      <SiteLayout>
        <section className="pt-36 pb-24">
          <div className="max-w-4xl mx-auto px-6 lg:px-8">
            <div className="rounded-3xl bg-card border border-border p-10">
              <p className="text-sm uppercase tracking-[0.2em] theme-accent-text mb-4">
                {copy.projects.notFoundEyebrow}
              </p>
              <h1 className="text-4xl font-bold text-foreground">
                {copy.projects.notFoundTitle}
              </h1>
              <Link
                to="/projects"
                className="inline-flex items-center gap-2 mt-6 theme-accent-text font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                {copy.projects.backToProjects}
              </Link>
            </div>
          </div>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="pt-36 pb-24">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {copy.projects.backToProjects}
          </Link>

          <div className="mt-8 grid lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)] gap-8 items-start">
            <div className="space-y-8">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] theme-accent-text mb-4">
                  {getLocalizedText(project.category, locale)}
                </p>
                <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                  {getLocalizedText(project.title, locale)}
                </h1>
                <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
                  {getLocalizedText(project.summary, locale) ||
                    getLocalizedText(project.problem, locale)}
                </p>
              </div>

              <div className="rounded-3xl overflow-hidden border border-border bg-card">
                <ImageWithFallback
                  src={project.image}
                  alt={
                    getLocalizedText(project.imageAlt, locale) ||
                    getLocalizedText(project.title, locale)
                  }
                  className="w-full aspect-[16/10] object-cover"
                />
              </div>

              {getLocalizedText(project.problem, locale) ? (
                <section className="rounded-3xl bg-card border border-border p-8">
                  <h2 className="text-2xl font-bold text-foreground mb-4">{copy.projects.problem}</h2>
                  <RichTextBlocks text={getLocalizedText(project.problem, locale)} />
                </section>
              ) : null}

              {getLocalizedText(project.solution, locale) ? (
                <section className="rounded-3xl bg-card border border-border p-8">
                  <h2 className="text-2xl font-bold text-foreground mb-4">{copy.projects.solution}</h2>
                  <RichTextBlocks text={getLocalizedText(project.solution, locale)} />
                </section>
              ) : null}

              {getLocalizedText(project.details, locale) ? (
                <section className="rounded-3xl bg-card border border-border p-8">
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    {copy.projects.fullNotes}
                  </h2>
                  <RichTextBlocks text={getLocalizedText(project.details, locale)} />
                </section>
              ) : null}

              {project.outcomes.length > 0 ? (
                <section className="rounded-3xl bg-card border border-border p-8">
                  <h2 className="text-2xl font-bold text-foreground mb-4">{copy.projects.outcomes}</h2>
                  <ul className="space-y-3 text-muted-foreground">
                    {getLocalizedTextList(project.outcomes, locale).map((outcome) => (
                      <li key={outcome} className="flex items-start gap-3">
                        <span className="mt-2 h-2 w-2 rounded-full theme-accent-dot shrink-0" />
                        <span>{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </div>

            <aside className="space-y-6 lg:sticky lg:top-28">
              <div className="rounded-3xl bg-card border border-border p-8 space-y-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {copy.projects.year}
                  </p>
                  <p className="mt-2 text-lg text-foreground">
                    {project.year || copy.projects.notSpecified}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {copy.projects.client}
                  </p>
                  <p className="mt-2 text-lg text-foreground">
                    {getLocalizedText(project.client, locale) || copy.projects.confidential}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {copy.projects.role}
                  </p>
                  <p className="mt-2 text-lg text-foreground">
                    {getLocalizedText(project.role, locale) || copy.projects.notSpecified}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {copy.projects.duration}
                  </p>
                  <p className="mt-2 text-lg text-foreground">
                    {getLocalizedText(project.duration, locale) || copy.projects.notSpecified}
                  </p>
                </div>
              </div>

              {project.techStack.length > 0 ? (
                <div className="rounded-3xl bg-card border border-border p-8">
                  <h2 className="text-xl font-bold text-foreground mb-4">
                    {copy.projects.techStack}
                  </h2>
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
              ) : null}

              {getLocalizedText(project.impact, locale) ? (
                <div className="rounded-3xl bg-card border border-border p-8">
                  <h2 className="text-xl font-bold text-foreground mb-4">{copy.projects.impact}</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {getLocalizedText(project.impact, locale)}
                  </p>
                </div>
              ) : null}

              {(project.demoUrl || project.repositoryUrl) ? (
                <div className="rounded-3xl bg-card border border-border p-8 space-y-4">
                  <h2 className="text-xl font-bold text-foreground">{copy.projects.links}</h2>
                  {project.demoUrl ? (
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between rounded-2xl bg-muted border border-border px-4 py-3 text-foreground hover:bg-accent transition-colors"
                    >
                      <span>{copy.projects.liveDemo}</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  ) : null}
                  {project.repositoryUrl ? (
                    <a
                      href={project.repositoryUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between rounded-2xl bg-muted border border-border px-4 py-3 text-foreground hover:bg-accent transition-colors"
                    >
                      <span>{copy.projects.repository}</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  ) : null}
                </div>
              ) : null}
            </aside>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
