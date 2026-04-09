import { useState } from "react";
import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import { SiteLayout } from "../components/SiteLayout";
import { PageHero } from "../components/PageHero";
import { RecommendationForm } from "../components/RecommendationForm";
import { RecommendationQuoteCard } from "../components/RecommendationQuoteCard";
import { RecommendationsMarquee } from "../components/RecommendationsMarquee";
import { useData } from "../context/DataContext";
import { useLocale } from "../context/LocaleContext";
import { getApprovedRecommendations, getLocalizedText } from "../lib/portfolio-content";
import { buildPublicSiteHomePath } from "../lib/site-routing";

const PAGE_SIZE = 6;

export function RecommendationsPage() {
  const { content, activeSite } = useData();
  const { locale, copy } = useLocale();
  const currentSiteSlug = activeSite?.slug ?? null;
  const showMarquee = content.recommendations.displayMode === "marquee";
  const approvedItems = getApprovedRecommendations(content.recommendations.items);
  const orderedItems = [...approvedItems].sort(
    (left, right) => Number(right.featured) - Number(left.featured),
  );
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(orderedItems.length / PAGE_SIZE));
  const pageItems = orderedItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <SiteLayout>
      <PageHero
        eyebrow={copy.pages.recommendationsEyebrow}
        title={getLocalizedText(content.recommendations.heading, locale)}
        description={getLocalizedText(content.recommendations.intro, locale)}
      />

      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <Link
            to={buildPublicSiteHomePath(currentSiteSlug)}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-10"
          >
            <ArrowLeft className="w-4 h-4" />
            {copy.common.home}
          </Link>

          {showMarquee ? (
            <div className="space-y-8">
              <RecommendationsMarquee items={pageItems} />

              {approvedItems.length === 0 ? (
                <div className="rounded-3xl bg-card border border-border p-10 text-center text-muted-foreground">
                  {copy.recommendations.emptyState}
                </div>
              ) : null}

              {approvedItems.length > PAGE_SIZE ? (
                <div className="flex items-center justify-center gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    disabled={page === 1}
                    className="px-5 py-3 rounded-xl bg-card border border-border text-foreground disabled:opacity-50 transition-colors"
                  >
                    {copy.common.previous}
                  </button>
                  <span className="text-sm text-muted-foreground">
                    {copy.common.page} {page} {copy.common.of} {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setPage((current) => Math.min(totalPages, current + 1))
                    }
                    disabled={page === totalPages}
                    className="px-5 py-3 rounded-xl bg-card border border-border text-foreground disabled:opacity-50 transition-colors"
                  >
                    {copy.common.next}
                  </button>
                </div>
              ) : null}

              <div className="max-w-2xl mx-auto">
                <RecommendationForm
                  title={getLocalizedText(content.recommendations.formHeading, locale)}
                  intro={getLocalizedText(content.recommendations.formIntro, locale)}
                />
              </div>
            </div>
          ) : (
            <div className="grid xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)] gap-8 items-start">
              <div className="space-y-6">
                {pageItems.map((item) => (
                  <RecommendationQuoteCard key={item.id} item={item} className="p-7" />
                ))}

                {approvedItems.length === 0 ? (
                  <div className="rounded-3xl bg-card border border-border p-10 text-center text-muted-foreground">
                    {copy.recommendations.emptyState}
                  </div>
                ) : null}

                {approvedItems.length > PAGE_SIZE ? (
                  <div className="flex items-center justify-center gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setPage((current) => Math.max(1, current - 1))}
                      disabled={page === 1}
                      className="px-5 py-3 rounded-xl bg-card border border-border text-foreground disabled:opacity-50 transition-colors"
                    >
                      {copy.common.previous}
                    </button>
                    <span className="text-sm text-muted-foreground">
                      {copy.common.page} {page} {copy.common.of} {totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setPage((current) => Math.min(totalPages, current + 1))
                      }
                      disabled={page === totalPages}
                      className="px-5 py-3 rounded-xl bg-card border border-border text-foreground disabled:opacity-50 transition-colors"
                    >
                      {copy.common.next}
                    </button>
                  </div>
                ) : null}
              </div>

              <RecommendationForm
                title={getLocalizedText(content.recommendations.formHeading, locale)}
                intro={getLocalizedText(content.recommendations.formIntro, locale)}
              />
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
