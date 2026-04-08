import { useState } from "react";
import { motion } from "motion/react";
import { useData } from "../context/DataContext";
import { useLocale } from "../context/LocaleContext";
import { getLocalizedText } from "../lib/portfolio-content";
import { EffectCard } from "./EffectCard";

export function RecommendationForm({
  title,
  intro,
}: {
  title: string;
  intro: string;
}) {
  const {
    content,
    meta,
    submittingRecommendation,
    submitRecommendation,
  } = useData();
  const { locale, copy } = useLocale();
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    company: "",
    text: "",
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);

  const submissionsEnabled = meta.isMongoConfigured && meta.isStorageConfigured;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const result = await submitRecommendation({
      ...formData,
      photoFile,
      photoAlt: formData.name
        ? locale === "fr"
          ? `Photo de ${formData.name}`
          : `Photo of ${formData.name}`
        : undefined,
    }, getLocalizedText(content.recommendations.successMessage, locale));

    setFeedback(result.message);

    if (!result.success) {
      return;
    }

    setFormData({
      name: "",
      role: "",
      company: "",
      text: "",
    });
    setPhotoFile(null);
    setFileInputKey((current) => current + 1);
  };

  return (
    <EffectCard
      effect={content.recommendations.formCardEffect}
      className="rounded-3xl"
      contentClassName="p-8 lg:p-10"
    >
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-foreground">{title}</h3>
        <p className="mt-3 text-muted-foreground leading-relaxed">{intro}</p>
      </div>

      {feedback ? (
        <div className="mb-5 rounded-2xl border theme-accent-panel bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          {feedback}
        </div>
      ) : null}

      {!submissionsEnabled ? (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/8 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
          {copy.recommendations.unavailable}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              value={formData.name}
              onChange={(event) =>
                setFormData({ ...formData, name: event.target.value })
              }
              className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder-muted-foreground theme-accent-field outline-none"
              placeholder={getLocalizedText(content.recommendations.namePlaceholder, locale)}
              required
            />
            <input
              type="text"
              value={formData.role}
              onChange={(event) =>
                setFormData({ ...formData, role: event.target.value })
              }
              className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder-muted-foreground theme-accent-field outline-none"
              placeholder={getLocalizedText(content.recommendations.rolePlaceholder, locale)}
              required
            />
          </div>

          <input
            type="text"
            value={formData.company}
            onChange={(event) =>
              setFormData({ ...formData, company: event.target.value })
            }
            className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder-muted-foreground theme-accent-field outline-none"
            placeholder={getLocalizedText(content.recommendations.companyPlaceholder, locale)}
          />

          <textarea
            value={formData.text}
            onChange={(event) =>
              setFormData({ ...formData, text: event.target.value })
            }
            rows={5}
            className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder-muted-foreground theme-accent-field outline-none resize-none"
            placeholder={getLocalizedText(content.recommendations.textPlaceholder, locale)}
            required
          />

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {getLocalizedText(content.recommendations.photoLabel, locale)}
            </label>
            <input
              key={fileInputKey}
              type="file"
              accept="image/*"
              onChange={(event) => setPhotoFile(event.target.files?.[0] ?? null)}
              disabled={submittingRecommendation}
              className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground outline-none file:mr-4 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-2 file:text-sm file:font-medium"
              required
            />
            <p className="mt-2 text-xs text-muted-foreground">
              {getLocalizedText(content.recommendations.photoHint, locale)}
            </p>
            {photoFile ? (
              <p className="mt-2 text-xs text-foreground">
                {copy.recommendations.selectedFile}: {photoFile.name}
              </p>
            ) : null}
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            disabled={submittingRecommendation}
            className="w-full px-6 py-4 theme-accent-button rounded-xl font-medium disabled:opacity-60 transition-colors"
          >
            {submittingRecommendation
              ? getLocalizedText(content.recommendations.submittingLabel, locale)
              : getLocalizedText(content.recommendations.submitLabel, locale)}
          </motion.button>
        </form>
      )}
    </EffectCard>
  );
}
