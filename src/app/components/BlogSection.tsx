import { motion } from "motion/react";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { useData } from "../context/DataContext";
import { useLocale } from "../context/LocaleContext";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import {
  getBlogPostHref,
  getLocalizedText,
  getLocalizedTextList,
} from "../lib/portfolio-content";
import { SectionVisualBackground } from "./SectionVisualBackground";
import { buildPublicSitePath } from "../lib/site-routing";

export function BlogSection() {
  const { content, activeSite } = useData();
  const { locale, copy } = useLocale();
  const { blog, site } = content;
  const currentSiteSlug = activeSite?.slug ?? null;
  const previewItems = blog.posts.slice(0, blog.previewCount);

  return (
    <section id="blog" className="relative py-32 bg-muted/30">
      <SectionVisualBackground
        site={site}
        sectionKey="blog"
        align="right"
        iconNames={["Lightbulb", "Brain", "Code", "Globe2", "Target", "Zap"]}
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
            {getLocalizedText(blog.heading, locale)}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {getLocalizedText(blog.intro, locale)}
          </p>
          <div className="w-24 h-1 theme-accent-line mx-auto mt-6 rounded-full" />
        </motion.div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
          {previewItems.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.08 * index }}
              whileHover={{ y: -8 }}
              className="group"
            >
              <Link
                to={getBlogPostHref(post, currentSiteSlug)}
                className="block h-full rounded-3xl bg-card border border-border theme-accent-hover-border transition-all duration-300 shadow-sm overflow-hidden"
              >
                <div className="relative h-52 overflow-hidden bg-muted">
                  <ImageWithFallback
                    src={post.image}
                    alt={
                      getLocalizedText(post.imageAlt, locale) ||
                      getLocalizedText(post.title, locale)
                    }
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="px-3 py-1 text-xs rounded-full theme-accent-badge font-medium">
                      {getLocalizedText(post.category, locale)}
                    </span>
                    {post.featured ? (
                      <span className="px-3 py-1 text-xs rounded-full bg-background/90 text-foreground border border-border font-medium">
                        {copy.common.featured}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{getLocalizedText(post.date, locale)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{getLocalizedText(post.readTime, locale)}</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-foreground mb-3 group-hover-theme-accent-text transition-colors">
                    {getLocalizedText(post.title, locale)}
                  </h3>

                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {getLocalizedText(post.excerpt, locale)}
                  </p>

                  {post.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mb-5">
                      {getLocalizedTextList(post.tags, locale)
                        .slice(0, 3)
                        .map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 text-xs rounded-full bg-muted text-foreground border border-border"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  <div className="flex items-center gap-2 theme-accent-text font-medium">
                    <span>{copy.blog.readArticle}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>

        {blog.posts.length > previewItems.length ? (
          <div className="flex justify-center mt-12">
            <Link
              to={buildPublicSitePath(currentSiteSlug, "/blog")}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-card border border-border text-foreground hover:bg-accent transition-colors"
            >
              {getLocalizedText(blog.viewAllLabel, locale)}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
