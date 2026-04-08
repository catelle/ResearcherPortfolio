import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, Search } from "lucide-react";
import { SiteLayout } from "../components/SiteLayout";
import { PageHero } from "../components/PageHero";
import { SkillsCloud } from "../components/SkillsCloud";
import { useData } from "../context/DataContext";
import { useLocale } from "../context/LocaleContext";
import {
  getLocalizedText,
  getLocalizedTextList,
} from "../lib/portfolio-content";

const PAGE_SIZE = 4;

export function SkillsPage() {
  const { content } = useData();
  const { locale, copy } = useLocale();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const filteredCategories = content.skills.categories.filter((category) => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return true;
    }

    return (
      getLocalizedText(category.title, locale).toLowerCase().includes(normalizedQuery) ||
      getLocalizedTextList(category.skills, locale).some((skill) =>
        skill.toLowerCase().includes(normalizedQuery),
      )
    );
  });
  const totalPages = Math.max(1, Math.ceil(filteredCategories.length / PAGE_SIZE));
  const pageItems = filteredCategories.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [query, content.skills.categories.length, locale]);

  return (
    <SiteLayout>
      <PageHero
        eyebrow={copy.pages.skillsEyebrow}
        title={getLocalizedText(content.skills.heading, locale)}
        description={getLocalizedText(content.skills.intro, locale)}
      />

      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-10">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {copy.common.home}
            </Link>

            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-card border border-border text-foreground placeholder-muted-foreground theme-accent-field outline-none"
                placeholder={copy.skills.searchPlaceholder}
              />
            </div>
          </div>

          {content.skills.showSkillCloud ? (
            <SkillsCloud
              skills={content.skills.categories.flatMap((category) =>
                getLocalizedTextList(category.skills, locale),
              )}
              centerLabel={copy.skills.liveCloud}
            />
          ) : null}

          <div className="grid md:grid-cols-2 gap-8">
            {pageItems.map((category) => {
              const localizedSkills = getLocalizedTextList(category.skills, locale);

              return (
                <article
                  key={category.id}
                  className="rounded-3xl bg-card border border-border shadow-sm p-8"
                >
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <h2 className="text-2xl font-bold text-foreground">
                        {getLocalizedText(category.title, locale)}
                      </h2>
                    </div>
                    <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      {copy.skills.countLabel(localizedSkills.length)}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {localizedSkills.map((skill) => (
                      <span
                        key={skill}
                        className="px-4 py-2 rounded-full bg-muted border border-border text-sm text-foreground"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>

          {filteredCategories.length === 0 ? (
            <div className="mt-12 rounded-3xl bg-card border border-border p-10 text-center text-muted-foreground">
              {copy.skills.noMatch}
            </div>
          ) : null}

          {filteredCategories.length > PAGE_SIZE ? (
            <div className="mt-12 flex items-center justify-center gap-4">
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
      </section>
    </SiteLayout>
  );
}
