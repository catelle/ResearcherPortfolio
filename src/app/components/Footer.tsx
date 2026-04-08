import { motion } from "motion/react";
import { Heart, Settings } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router";
import { useData } from "../context/DataContext";
import { useLocale } from "../context/LocaleContext";
import { getLocalizedText } from "../lib/portfolio-content";

export function Footer() {
  const navigate = useNavigate();
  const location = useLocation();
  const { content } = useData();
  const { locale, copy } = useLocale();
  const isHomePage = location.pathname === "/";
  const links = isHomePage
    ? [
        { label: copy.navigation.about, href: "#about" },
        { label: copy.navigation.projects, href: "#projects" },
        { label: copy.navigation.blog, href: "#blog" },
        { label: copy.navigation.feedback, href: "#recommendations" },
        { label: copy.navigation.contact, href: "#contact" },
      ]
    : [
        { label: copy.navigation.home, href: "/" },
        { label: copy.navigation.projects, href: "/projects" },
        { label: copy.navigation.blog, href: "/blog" },
        { label: copy.navigation.feedback, href: "/recommendations" },
        { label: copy.navigation.contact, href: "/#contact" },
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
            <Link to="/" className="text-2xl font-bold theme-accent-text">
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
