import { motion } from "motion/react";
import { Send } from "lucide-react";
import { useState } from "react";
import { useData } from "../context/DataContext";
import { iconMap } from "../lib/icon-maps";
import { EffectCard } from "./EffectCard";
import { SectionVisualBackground } from "./SectionVisualBackground";

export function ContactSection() {
  const { content } = useData();
  const { contact, site } = content;
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form submission logic would go here
    console.log("Form submitted:", formData);
  };

  return (
    <section id="contact" className="relative py-32 bg-muted/30">
      <SectionVisualBackground
        site={site}
        sectionKey="contact"
        align="left"
        iconNames={
          contact.socialLinks.length > 0
            ? contact.socialLinks.map(
                (social) => social.icon as keyof typeof iconMap,
              )
            : ["Mail", "Linkedin", "Twitter", "Github"]
        }
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
            {contact.heading}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {contact.intro}
          </p>
          <div className="w-24 h-1 theme-accent-line mx-auto mt-6 rounded-full" />
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
            <EffectCard
              effect={contact.formCardEffect}
              className="rounded-2xl"
              contentClassName="p-8"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                    {contact.nameLabel}
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground theme-accent-field outline-none"
                    placeholder={contact.namePlaceholder}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                    {contact.emailLabel}
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground theme-accent-field outline-none"
                    placeholder={contact.emailPlaceholder}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                    {contact.messageLabel}
                  </label>
                  <textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground theme-accent-field outline-none resize-none"
                    placeholder={contact.messagePlaceholder}
                    required
                  />
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-8 py-4 theme-accent-button rounded-lg font-medium shadow-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  {contact.submitLabel}
                </motion.button>
              </form>
            </EffectCard>
          </motion.div>

          {/* Contact Info & Social */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-8"
          >
            {/* CTA Box */}
            <div className="p-8 rounded-2xl bg-card border theme-accent-panel shadow-sm">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                {contact.ctaTitle}
              </h3>
              <ul className="space-y-3 text-muted-foreground">
                {contact.opportunities.map((opportunity) => (
                  <li key={opportunity} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full theme-accent-dot mt-2" />
                    <span>{opportunity}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social Links */}
            <div className="p-8 rounded-2xl bg-card border border-border shadow-sm">
              <h3 className="text-xl font-bold text-foreground mb-6">
                {contact.socialHeading}
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                {contact.socialLinks.map((social) => {
                  const Icon = iconMap[social.icon as keyof typeof iconMap] ?? iconMap.Mail;

                  return (
                  <motion.a
                    key={social.id}
                    href={social.href}
                    whileHover={{ scale: 1.05, y: -4 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-3 p-4 rounded-lg bg-muted border border-border theme-accent-hover-border transition-all group"
                    >
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${social.color}20` }}
                      >
                        <Icon
                          className="w-5 h-5"
                          style={{ color: social.color }}
                        />
                      </div>
                      <span className="text-sm text-foreground">
                        {social.label}
                      </span>
                    </motion.a>
                )})}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
