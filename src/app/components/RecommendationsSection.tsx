import { motion } from "motion/react";
import { Link } from "react-router";
import { RecommendationForm } from "./RecommendationForm";
import { RecommendationQuoteCard } from "./RecommendationQuoteCard";
import { RecommendationsMarquee } from "./RecommendationsMarquee";
import { useData } from "../context/DataContext";
import {
  getApprovedRecommendations,
  getFeaturedPreviewItems,
} from "../lib/portfolio-content";
import { SectionVisualBackground } from "./SectionVisualBackground";

export function RecommendationsSection() {
  const { content } = useData();
  const { recommendations, site } = content;
  const approvedItems = getApprovedRecommendations(recommendations.items);
  const orderedItems = [...approvedItems].sort(
    (left, right) => Number(right.featured) - Number(left.featured),
  );
  const previewItems = getFeaturedPreviewItems(
    orderedItems,
    recommendations.previewCount,
  );
  const showMarquee = recommendations.displayMode === "marquee";

  return (
    <section id="recommendations" className="relative py-32 bg-background">
      <SectionVisualBackground
        site={site}
        sectionKey="recommendations"
        align="left"
        iconNames={["Heart", "Users", "Lightbulb", "Target", "Globe2", "Zap"]}
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
            {recommendations.heading}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {recommendations.intro}
          </p>
          <div className="w-24 h-1 theme-accent-line mx-auto mt-6 rounded-full" />
        </motion.div>

        {showMarquee ? (
          <div className="space-y-8">
            <RecommendationsMarquee items={orderedItems} />

            {orderedItems.length > Math.max(8, recommendations.previewCount) ? (
              <div className="flex justify-center">
                <Link
                  to="/recommendations"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-border bg-muted text-foreground hover:bg-accent transition-colors"
                >
                  {recommendations.viewAllLabel}
                </Link>
              </div>
            ) : null}

            <div className="max-w-2xl mx-auto">
              <RecommendationForm
                title={recommendations.formHeading}
                intro={recommendations.formIntro}
              />
            </div>
          </div>
        ) : (
          <div className="grid xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)] gap-8 items-start">
            <div className="space-y-6">
              {previewItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.08 * index }}
                >
                  <RecommendationQuoteCard item={item} />
                </motion.div>
              ))}

              {approvedItems.length > previewItems.length ? (
                <div className="pt-2">
                  <Link
                    to="/recommendations"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-border bg-muted text-foreground hover:bg-accent transition-colors"
                  >
                    {recommendations.viewAllLabel}
                  </Link>
                </div>
              ) : null}
            </div>

            <RecommendationForm
              title={recommendations.formHeading}
              intro={recommendations.formIntro}
            />
          </div>
        )}
      </div>
    </section>
  );
}
