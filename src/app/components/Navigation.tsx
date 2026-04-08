import { motion } from "motion/react";
import { Menu, X, Settings } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { LocaleToggle } from "./LocaleToggle";
import { Link, useNavigate, useLocation } from "react-router";
import { useData } from "../context/DataContext";
import { useLocale } from "../context/LocaleContext";
import { getLocalizedText } from "../lib/portfolio-content";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { content } = useData();
  const { locale, copy } = useLocale();
  const isHomePage = location.pathname === "/";
  const navItems = isHomePage
    ? [
        { label: copy.navigation.about, href: "#about" },
        { label: copy.navigation.projects, href: "#projects" },
        { label: copy.navigation.skills, href: "#skills" },
        { label: copy.navigation.blog, href: "#blog" },
        { label: copy.navigation.feedback, href: "#recommendations" },
        { label: copy.navigation.contact, href: "#contact" },
      ]
    : [
        { label: copy.navigation.home, href: "/" },
        { label: copy.navigation.projects, href: "/projects" },
        { label: copy.navigation.skills, href: "/skills" },
        { label: copy.navigation.blog, href: "/blog" },
        { label: copy.navigation.feedback, href: "/recommendations" },
        { label: copy.navigation.contact, href: "/#contact" },
      ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/80 border-b border-border"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <motion.div whileHover={{ scale: 1.05 }}>
            <Link to="/" className="text-2xl font-bold theme-accent-text">
              {getLocalizedText(content.site.brandName, locale)}
            </Link>
          </motion.div>

          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <motion.a
                key={item.label}
                href={item.href}
                whileHover={{ scale: 1.05 }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </motion.a>
            ))}
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate("/admin")}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Settings className="w-4 h-4" />
              {copy.navigation.admin}
            </motion.button>
            <LocaleToggle />
            <ThemeToggle />
          </div>

          <div className="md:hidden flex items-center gap-3">
            <LocaleToggle />
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-foreground p-2"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden pb-6"
          >
            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors py-2"
                >
                  {item.label}
                </a>
              ))}
              <button
                onClick={() => {
                  navigate("/admin");
                  setIsOpen(false);
                }}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                <Settings className="w-4 h-4" />
                {copy.navigation.admin}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}
