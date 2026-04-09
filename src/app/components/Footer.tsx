import { motion } from "motion/react";
import { Heart, Settings } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router";
import { useData } from "../context/DataContext";
import { useLocale } from "../context/LocaleContext";
import { getLocalizedText } from "../lib/portfolio-content";
import {
  buildPublicSiteHomePath,
  buildPublicSitePath,
  buildPublicSiteSectionHref,
  isPublicHomePath,
} from "../lib/site-routing";

export function Footer() {
  const navigate = useNavigate();
  const location = useLocation();
  const { content, activeSite } = useData();
  const { locale, copy } = useLocale();
  const currentSiteSlug = activeSite?.slug ?? null;
  const isHomePage = isPublicHomePath(location.pathname, currentSiteSlug);
  const links = isHomePage
    ? [
        {
          label: copy.navigation.about,
          href: buildPublicSiteSectionHref(currentSiteSlug, "about", true),
        },
        {
          label: copy.navigation.projects,
          href: buildPublicSiteSectionHref(currentSiteSlug, "projects", true),
        },
        {
          label: copy.navigation.blog,
          href: buildPublicSiteSectionHref(currentSiteSlug, "blog", true),
        },
        {
          label: copy.navigation.feedback,
          href: buildPublicSiteSectionHref(currentSiteSlug, "recommendations", true),
        },
        {
          label: copy.navigation.contact,
          href: buildPublicSiteSectionHref(currentSiteSlug, "contact", true),
        },
      ]
    : [
        {
          label: copy.navigation.home,
          href: buildPublicSiteHomePath(currentSiteSlug),
        },
        {
          label: copy.navigation.projects,
          href: buildPublicSitePath(currentSiteSlug, "/projects"),
        },
        {
          label: copy.navigation.blog,
          href: buildPublicSitePath(currentSiteSlug, "/blog"),
        },
        {
          label: copy.navigation.feedback,
          href: buildPublicSitePath(currentSiteSlug, "/recommendations"),
        },
        {
          label: copy.navigation.contact,
          href: buildPublicSiteSectionHref(currentSiteSlug, "contact", false),
        },
      ];

  return (
    <footer className="relative bg-muted border-t border-border py-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Link
              to={buildPublicSiteHomePath(currentSiteSlug)}
              className="text-2xl font-bold theme-accent-text"
            >
              {getLocalizedText(content.site.brandName, locale)}
            </Link>
          </motion.div>

          {/* Copyright */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center gap-2 text-muted-foreground"
          >
            <span>{getLocalizedText(content.site.footerPrefix, locale)}</span>
            <Heart className="w-4 h-4 theme-accent-text theme-accent-fill" />
            <span>{getLocalizedText(content.site.footerHighlight, locale)}</span>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-6"
          >
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
            <button
              onClick={() => navigate("/admin")}
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Settings className="w-3 h-3" />
              {copy.navigation.admin}
            </button>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}
