import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Save, Star, Trash2, CheckCircle2, Clock3 } from "lucide-react";
import { useData } from "../../context/DataContext";
import {
  buildLocalizedTextValue,
  getLocalizedText,
  toLocalizedDraft,
  type FormCardEffectStyle,
} from "../../lib/portfolio-content";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { LocalizedFieldGroup } from "./LocalizedFields";

const formCardEffectOptions: Array<{
  value: FormCardEffectStyle;
  label: string;
}> = [
  { value: "none", label: "None" },
  { value: "border-beam", label: "Border beam" },
  { value: "shine-border", label: "Shine border" },
];

export function RecommendationsAdmin({ canEdit }: { canEdit: boolean }) {
  const { content, saveContent, saving } = useData();
  const [section, setSection] = useState(content.recommendations);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    setSection(content.recommendations);
  }, [content.recommendations]);

  const persistSection = async (
    nextSection: typeof section,
    successMessage: string,
  ) => {
    const result = await saveContent(
      (current) => ({
        ...current,
        recommendations: nextSection,
      }),
      successMessage,
    );

    setFeedback(result.message);

    if (result.success) {
      setSection(nextSection);
    }

    return result;
  };

  const handleSave = async () => {
    await persistSection(
      section,
      "Recommendations section settings saved successfully.",
    );
  };

  const handleDelete = async (id: string) => {
    const nextSection = {
      ...section,
      items: section.items.filter((item) => item.id !== id),
    };

    await persistSection(nextSection, "Recommendation deleted successfully.");
  };

  const toggleStatus = async (id: string) => {
    const nextSection = {
      ...section,
      items: section.items.map((item) =>
        item.id === id
          ? {
              ...item,
              status: item.status === "approved" ? "pending" : "approved",
            }
          : item,
      ),
    };

    await persistSection(nextSection, "Recommendation status updated.");
  };

  const toggleFeatured = async (id: string) => {
    const nextSection = {
      ...section,
      items: section.items.map((item) =>
        item.id === id ? { ...item, featured: !item.featured } : item,
      ),
    };

    await persistSection(nextSection, "Recommendation highlight updated.");
  };

  const orderedItems = [...section.items].sort((left, right) => {
    if (left.status !== right.status) {
      return left.status === "pending" ? -1 : 1;
    }

    return Number(right.featured) - Number(left.featured);
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div className="space-y-4 flex-1">
          <div>
            <h2 className="text-3xl font-bold text-foreground">
              Manage Recommendations
            </h2>
            <p className="text-muted-foreground mt-2">
              Review visitor submissions, approve the best testimonials, and tune
              the public section copy.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <LocalizedFieldGroup
              label="Section heading"
              value={toLocalizedDraft(section.heading)}
              onChange={(value) =>
                setSection({ ...section, heading: buildLocalizedTextValue(value) })
              }
              disabled={!canEdit}
            />
            <LocalizedFieldGroup
              label="Section intro"
              value={toLocalizedDraft(section.intro)}
              onChange={(value) =>
                setSection({ ...section, intro: buildLocalizedTextValue(value) })
              }
              disabled={!canEdit}
            />
            <select
              value={section.displayMode}
              onChange={(event) =>
                setSection({
                  ...section,
                  displayMode: event.target.value as typeof section.displayMode,
                })
              }
              disabled={!canEdit}
              className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground outline-none"
            >
              <option value="cards">Cards layout</option>
              <option value="marquee">Marquee layout</option>
            </select>
            <input
              type="number"
              min={1}
              value={section.previewCount}
              onChange={(event) =>
                setSection({
                  ...section,
                  previewCount: Number(event.target.value) || 1,
                })
              }
              disabled={!canEdit}
              className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground outline-none"
              placeholder="Homepage preview count"
            />
            <LocalizedFieldGroup
              label="View all label"
              value={toLocalizedDraft(section.viewAllLabel)}
              onChange={(value) =>
                setSection({
                  ...section,
                  viewAllLabel: buildLocalizedTextValue(value),
                })
              }
              disabled={!canEdit}
            />
            <LocalizedFieldGroup
              label="Form heading"
              value={toLocalizedDraft(section.formHeading)}
              onChange={(value) =>
                setSection({
                  ...section,
                  formHeading: buildLocalizedTextValue(value),
                })
              }
              disabled={!canEdit}
            />
            <LocalizedFieldGroup
              label="Submit button label"
              value={toLocalizedDraft(section.submitLabel)}
              onChange={(value) =>
                setSection({
                  ...section,
                  submitLabel: buildLocalizedTextValue(value),
                })
              }
              disabled={!canEdit}
            />
            <LocalizedFieldGroup
              label="Form introduction"
              value={toLocalizedDraft(section.formIntro)}
              onChange={(value) =>
                setSection({
                  ...section,
                  formIntro: buildLocalizedTextValue(value),
                })
              }
              disabled={!canEdit}
              multiline
              rows={3}
            />
            <LocalizedFieldGroup
              label="Name placeholder"
              value={toLocalizedDraft(section.namePlaceholder)}
              onChange={(value) =>
                setSection({
                  ...section,
                  namePlaceholder: buildLocalizedTextValue(value),
                })
              }
              disabled={!canEdit}
            />
            <LocalizedFieldGroup
              label="Role placeholder"
              value={toLocalizedDraft(section.rolePlaceholder)}
              onChange={(value) =>
                setSection({
                  ...section,
                  rolePlaceholder: buildLocalizedTextValue(value),
                })
              }
              disabled={!canEdit}
            />
            <LocalizedFieldGroup
              label="Company placeholder"
              value={toLocalizedDraft(section.companyPlaceholder)}
              onChange={(value) =>
                setSection({
                  ...section,
                  companyPlaceholder: buildLocalizedTextValue(value),
                })
              }
              disabled={!canEdit}
            />
            <LocalizedFieldGroup
              label="Message placeholder"
              value={toLocalizedDraft(section.textPlaceholder)}
              onChange={(value) =>
                setSection({
                  ...section,
                  textPlaceholder: buildLocalizedTextValue(value),
                })
              }
              disabled={!canEdit}
              multiline
              rows={3}
            />
            <LocalizedFieldGroup
              label="Photo label"
              value={toLocalizedDraft(section.photoLabel)}
              onChange={(value) =>
                setSection({
                  ...section,
                  photoLabel: buildLocalizedTextValue(value),
                })
              }
              disabled={!canEdit}
            />
            <LocalizedFieldGroup
              label="Photo upload helper text"
              value={toLocalizedDraft(section.photoHint)}
              onChange={(value) =>
                setSection({
                  ...section,
                  photoHint: buildLocalizedTextValue(value),
                })
              }
              disabled={!canEdit}
              multiline
              rows={3}
            />
            <LocalizedFieldGroup
              label="Submitting label"
              value={toLocalizedDraft(section.submittingLabel)}
              onChange={(value) =>
                setSection({
                  ...section,
                  submittingLabel: buildLocalizedTextValue(value),
                })
              }
              disabled={!canEdit}
            />
            <div className="md:col-span-2">
              <LocalizedFieldGroup
                label="Submission success message"
                value={toLocalizedDraft(section.successMessage)}
                onChange={(value) =>
                  setSection({
                    ...section,
                    successMessage: buildLocalizedTextValue(value),
                  })
                }
                disabled={!canEdit}
                multiline
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Recommendation Form Card Effect
              </label>
              <select
                value={section.formCardEffect.style}
                onChange={(event) =>
                  setSection({
                    ...section,
                    formCardEffect: {
                      ...section.formCardEffect,
                      style: event.target.value as FormCardEffectStyle,
                    },
                  })
                }
                disabled={!canEdit}
                className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground outline-none"
              >
                {formCardEffectOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Effect Color
              </label>
              <input
                type="color"
                value={section.formCardEffect.color}
                onChange={(event) =>
                  setSection({
                    ...section,
                    formCardEffect: {
                      ...section.formCardEffect,
                      color: event.target.value,
                    },
                  })
                }
                disabled={!canEdit}
                className="h-12 w-full rounded-lg bg-card border border-border"
              />
            </div>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => void handleSave()}
          disabled={!canEdit || saving}
          className="px-6 py-3 theme-accent-button rounded-lg font-medium disabled:opacity-60 transition-colors flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Recommendations"}
        </motion.button>
      </div>

      {feedback ? <p className="text-sm text-muted-foreground">{feedback}</p> : null}

      <div className="grid gap-6">
        {orderedItems.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl bg-card border border-border p-6"
          >
            <div className="flex flex-col lg:flex-row lg:items-start gap-5">
              <ImageWithFallback
                src={item.photoUrl}
                alt={item.photoAlt || item.name}
                className="h-16 w-16 rounded-2xl object-cover shrink-0"
              />

              <div className="flex-1 space-y-3">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                          item.status === "approved"
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                            : "bg-amber-500/10 text-amber-700 dark:text-amber-300"
                        }`}
                      >
                        {item.status === "approved" ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <Clock3 className="w-3 h-3" />
                        )}
                        {item.status}
                      </span>
                      {item.featured ? (
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium theme-accent-badge">
                          <Star className="w-3 h-3" />
                          Featured
                        </span>
                      ) : null}
                    </div>
                    <h3 className="text-lg font-bold text-foreground">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {item.role}
                      {item.company ? ` • ${item.company}` : ""}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Submitted{" "}
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString()
                        : "recently"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void toggleStatus(item.id)}
                      disabled={!canEdit || saving}
                      className="px-4 py-2 rounded-lg bg-muted text-foreground hover:bg-accent disabled:opacity-60 transition-colors"
                    >
                      {item.status === "approved" ? "Mark Pending" : "Approve"}
                    </button>
                    <button
                      type="button"
                      onClick={() => void toggleFeatured(item.id)}
                      disabled={!canEdit || saving}
                      className="px-4 py-2 rounded-lg bg-muted text-foreground hover:bg-accent disabled:opacity-60 transition-colors"
                    >
                      {item.featured ? "Unfeature" : "Feature"}
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(item.id)}
                      disabled={!canEdit || saving}
                      className="px-4 py-2 rounded-lg bg-muted text-red-500 hover:bg-red-500/10 disabled:opacity-60 transition-colors inline-flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>

                <p className="text-foreground leading-relaxed">{item.text}</p>
              </div>
            </div>
          </div>
        ))}

        {orderedItems.length === 0 ? (
          <div className="rounded-2xl bg-card border border-border p-8 text-center text-muted-foreground">
            Visitor feedback submissions will appear here.
          </div>
        ) : null}
      </div>
    </div>
  );
}
