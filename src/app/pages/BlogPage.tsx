import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, ArrowRight, Calendar, Clock } from "lucide-react";
import { motion } from "motion/react";
import { SiteLayout } from "../components/SiteLayout";
import { PageHero } from "../components/PageHero";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useData } from "../context/DataContext";
import { getBlogPostHref } from "../lib/portfolio-content";

const PAGE_SIZE = 6;

export function BlogPage() {
  const { content } = useData();
  const orderedPosts = content.blog.posts;
  const categories = Array.from(
    new Set(orderedPosts.map((post) => post.category).filter(Boolean)),
  );
  const [activeCategory, setActiveCategory] = useState("All");
  const filteredPosts =
    activeCategory === "All"
      ? orderedPosts
      : orderedPosts.filter((post) => post.category === activeCategory);
  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / PAGE_SIZE));
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [activeCategory, content.blog.posts.length]);

  const pageItems = filteredPosts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Writing"
        title={content.blog.heading}
        description={content.blog.intro}
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

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
            {pageItems.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.05 * index }}
                className="group"
              >
                <Link
                  to={getBlogPostHref(post)}
                  className="block h-full rounded-3xl bg-card border border-border theme-accent-hover-border shadow-sm overflow-hidden"
                >
                  <div className="relative h-56 bg-muted">
                    <ImageWithFallback
                      src={post.image}
                      alt={post.imageAlt || post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-medium theme-accent-badge">
                        {post.category}
                      </span>
                      {post.featured ? (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-background/90 text-foreground border border-border">
                          Featured
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {post.date}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {post.readTime}
                      </span>
                    </div>

                    <h2 className="text-2xl font-bold text-foreground line-clamp-2">
                      {post.title}
                    </h2>
                    <p className="mt-3 text-muted-foreground line-clamp-4 leading-relaxed">
                      {post.excerpt}
                    </p>

                    {post.tags.length > 0 ? (
                      <div className="mt-5 flex flex-wrap gap-2">
                        {post.tags.slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 text-xs rounded-full bg-muted text-foreground border border-border"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    <div className="mt-6 inline-flex items-center gap-2 theme-accent-text font-medium">
                      Read full article
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>

          {filteredPosts.length === 0 ? (
            <div className="mt-12 rounded-3xl bg-card border border-border p-10 text-center text-muted-foreground">
              No articles match this filter yet.
            </div>
          ) : null}

          {filteredPosts.length > PAGE_SIZE ? (
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
