import { motion } from "motion/react";
import { Heart, Settings } from "lucide-react";
import { useNavigate } from "react-router";
import { useData } from "../context/DataContext";

export function Footer() {
  const navigate = useNavigate();
  const { content } = useData();

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
            <p className="text-2xl font-bold theme-accent-text">
              {content.site.brandName}
            </p>
          </motion.div>

          {/* Copyright */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center gap-2 text-muted-foreground"
          >
            <span>{content.site.footerPrefix}</span>
            <Heart className="w-4 h-4 theme-accent-text theme-accent-fill" />
            <span>{content.site.footerHighlight}</span>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex gap-6"
          >
            <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">
              About
            </a>
            <a href="#projects" className="text-muted-foreground hover:text-foreground transition-colors">
              Projects
            </a>
            <a href="#blog" className="text-muted-foreground hover:text-foreground transition-colors">
              Blog
            </a>
            <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </a>
            <button
              onClick={() => navigate("/admin")}
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Settings className="w-3 h-3" />
              Admin
            </button>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}
