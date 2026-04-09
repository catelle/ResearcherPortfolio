import { Link, useParams } from "react-router";
import { ArrowLeft, Calendar, Clock, ExternalLink } from "lucide-react";
import { SiteLayout } from "../components/SiteLayout";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { RichTextBlocks } from "../components/RichTextBlocks";
import { useData } from "../context/DataContext";
import { useLocale } from "../context/LocaleContext";
import { findBlogPostBySlug, getLocalizedText, getLocalizedTextList } from "../lib/portfolio-content";
import { buildPublicSitePath } from "../lib/site-routing";

export function BlogDetailPage() {
  const { slug } = useParams();
  const { content, activeSite } = useData();
  const { locale, copy } = useLocale();
  const currentSiteSlug = activeSite?.slug ?? null;
  const post = findBlogPostBySlug(content.blog.posts, slug);

  if (!post) {
    return (
      <SiteLayout>
        <section className="pt-36 pb-24">
          <div className="max-w-4xl mx-auto px-6 lg:px-8">
            <div className="rounded-3xl bg-card border border-border p-10">
              <p className="text-sm uppercase tracking-[0.2em] theme-accent-text mb-4">
                {copy.blog.notFoundEyebrow}
              </p>
              <h1 className="text-4xl font-bold text-foreground">
                {copy.blog.notFoundTitle}
              </h1>
              <Link
                to={buildPublicSitePath(currentSiteSlug, "/blog")}
                className="inline-flex items-center gap-2 mt-6 theme-accent-text font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                {copy.blog.backToBlog}
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
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <Link
            to={buildPublicSitePath(currentSiteSlug, "/blog")}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {copy.blog.backToBlog}
          </Link>

          <div className="mt-8">
            <p className="text-sm uppercase tracking-[0.25em] theme-accent-text mb-4">
              {getLocalizedText(post.category, locale)}
            </p>
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
              {getLocalizedText(post.title, locale)}
            </h1>
            <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
              {getLocalizedText(post.excerpt, locale)}
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {getLocalizedText(post.date, locale)}
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {getLocalizedText(post.readTime, locale)}
            </span>
            {getLocalizedText(post.author, locale) ? (
              <span>
                {copy.blog.by} {getLocalizedText(post.author, locale)}
              </span>
            ) : null}
          </div>

          <div className="mt-10 rounded-3xl overflow-hidden border border-border bg-card">
            <ImageWithFallback
              src={post.image}
              alt={
                getLocalizedText(post.imageAlt, locale) ||
                getLocalizedText(post.title, locale)
              }
              className="w-full aspect-[16/9] object-cover"
            />
          </div>

          <div className="mt-10 grid lg:grid-cols-[minmax(0,1fr)_280px] gap-8 items-start">
            <article className="rounded-3xl bg-card border border-border p-8 lg:p-10">
              {post.body ? (
                <RichTextBlocks
                  text={getLocalizedText(post.body, locale)}
                  className="text-base lg:text-lg text-foreground/85"
                />
              ) : (
                <RichTextBlocks
                  text={getLocalizedText(post.excerpt, locale)}
                  className="text-base lg:text-lg text-foreground/85"
                />
              )}
            </article>

            <aside className="space-y-6 lg:sticky lg:top-28">
              {post.tags.length > 0 ? (
                <div className="rounded-3xl bg-card border border-border p-8">
                  <h2 className="text-xl font-bold text-foreground mb-4">{copy.blog.topics}</h2>
                  <div className="flex flex-wrap gap-2">
                    {getLocalizedTextList(post.tags, locale).map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 text-xs rounded-full bg-muted text-foreground border border-border"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              {post.keyTakeaways.length > 0 ? (
                <div className="rounded-3xl bg-card border border-border p-8">
                  <h2 className="text-xl font-bold text-foreground mb-4">
                    {copy.blog.keyTakeaways}
                  </h2>
                  <ul className="space-y-3 text-muted-foreground">
                    {getLocalizedTextList(post.keyTakeaways, locale).map((takeaway) => (
                      <li key={takeaway} className="flex items-start gap-3">
                        <span className="mt-2 h-2 w-2 rounded-full theme-accent-dot shrink-0" />
                        <span>{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {post.externalUrl ? (
                <div className="rounded-3xl bg-card border border-border p-8">
                  <a
                    href={post.externalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-2xl bg-muted border border-border px-4 py-3 text-foreground hover:bg-accent transition-colors"
                  >
                    <span>{copy.blog.readExternalSource}</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              ) : null}
            </aside>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
