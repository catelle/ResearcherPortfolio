import { useState } from "react";
import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import { SiteLayout } from "../components/SiteLayout";
import { PageHero } from "../components/PageHero";
import { RecommendationForm } from "../components/RecommendationForm";
import { RecommendationQuoteCard } from "../components/RecommendationQuoteCard";
import { RecommendationsMarquee } from "../components/RecommendationsMarquee";
import { useData } from "../context/DataContext";
import { getApprovedRecommendations } from "../lib/portfolio-content";

const PAGE_SIZE = 6;

export function RecommendationsPage() {
  const { content } = useData();
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
        eyebrow="Social Proof"
        title={content.recommendations.heading}
        description={content.recommendations.intro}
      />

      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-10"
          >
            <ArrowLeft className="w-4 h-4" />
            Home
          </Link>

          {showMarquee ? (
            <div className="space-y-8">
              <RecommendationsMarquee items={pageItems} />

              {approvedItems.length === 0 ? (
                <div className="rounded-3xl bg-card border border-border p-10 text-center text-muted-foreground">
                  Approved recommendations will show up here once they are reviewed.
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

              <div className="max-w-2xl mx-auto">
                <RecommendationForm
                  title={content.recommendations.formHeading}
                  intro={content.recommendations.formIntro}
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
                    Approved recommendations will show up here once they are reviewed.
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

              <RecommendationForm
                title={content.recommendations.formHeading}
                intro={content.recommendations.formIntro}
              />
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
