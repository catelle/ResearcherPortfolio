import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Edit2, Plus, Save, Trash2, X } from "lucide-react";
import { useData } from "../../context/DataContext";
import {
  buildLocalizedTextValue,
  createContentItemId,
  getLocalizedText,
  visionIconOptions,
  toLocalizedDraft,
  type LocalizedText,
  type HighlightCard,
} from "../../lib/portfolio-content";
import { LocalizedFieldGroup } from "./LocalizedFields";

export function VisionAdmin({ canEdit }: { canEdit: boolean }) {
  const { content, saveContent, saving } = useData();
  const [section, setSection] = useState(content.vision);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPillar, setEditingPillar] = useState<HighlightCard | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    icon: visionIconOptions[0],
    title: { en: "", fr: "" } as LocalizedText,
    description: { en: "", fr: "" } as LocalizedText,
  });

  useEffect(() => {
    setSection(content.vision);
  }, [content.vision]);

  const getPillarFormIcon = (icon?: string) =>
    visionIconOptions.includes(icon as (typeof visionIconOptions)[number])
      ? (icon as (typeof visionIconOptions)[number])
      : visionIconOptions[0];

  const resetForm = () => {
    setFormData({
      icon: visionIconOptions[0],
      title: { en: "", fr: "" },
      description: { en: "", fr: "" },
    });
    setEditingPillar(null);
    setIsFormOpen(false);
  };

  const persistSection = async (
    nextSection: typeof section,
    successMessage: string,
  ) => {
    const result = await saveContent(
      (current) => ({
        ...current,
        vision: nextSection,
      }),
      successMessage,
    );

    setFeedback(result.message);

    if (result.success) {
      setSection(nextSection);
    }

    return result;
  };

  const handlePillarSubmit = async () => {
    const nextPillar: HighlightCard = {
      id: editingPillar?.id ?? createContentItemId("vision-pillar"),
      icon: formData.icon,
      title: buildLocalizedTextValue(formData.title),
      description: buildLocalizedTextValue(formData.description),
    };

    const nextSection = {
      ...section,
      pillars: editingPillar
        ? section.pillars.map((item) =>
            item.id === editingPillar.id ? nextPillar : item,
          )
        : [...section.pillars, nextPillar],
    };

    const result = await persistSection(
      nextSection,
      editingPillar
        ? "Vision pillar updated successfully."
        : "Vision pillar added successfully.",
    );

    if (result.success) {
      resetForm();
    }
  };

  const handleSave = async () => {
    await persistSection(section, "Vision section saved successfully.");
  };

  const handleDelete = async (pillarId: string) => {
    const nextSection = {
      ...section,
      pillars: section.pillars.filter((item) => item.id !== pillarId),
    };

    await persistSection(nextSection, "Vision pillar deleted successfully.");
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Edit Vision Section</h2>
          <p className="text-muted-foreground mt-2">
            Update the big vision statement and the pillars shown beneath it.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={() => void handleSave()}
          disabled={!canEdit || saving}
          className="px-6 py-3 theme-accent-button rounded-lg font-medium disabled:opacity-60 transition-colors flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Vision"}
        </motion.button>
      </div>

      {feedback ? <p className="text-sm text-muted-foreground">{feedback}</p> : null}

      <div className="space-y-8">
        <div className="p-8 rounded-2xl bg-card border border-border space-y-6">
          <LocalizedFieldGroup
            label="Section heading"
            value={toLocalizedDraft(section.heading)}
            onChange={(value) =>
              setSection({ ...section, heading: buildLocalizedTextValue(value) })
            }
            disabled={!canEdit}
          />

          <LocalizedFieldGroup
            label="Main vision statement"
            value={toLocalizedDraft(section.mainStatement)}
            onChange={(value) =>
              setSection({
                ...section,
                mainStatement: buildLocalizedTextValue(value),
              })
            }
            disabled={!canEdit}
            multiline
            rows={3}
          />

          <LocalizedFieldGroup
            label="Supporting statement"
            value={toLocalizedDraft(section.subStatement)}
            onChange={(value) =>
              setSection({
                ...section,
                subStatement: buildLocalizedTextValue(value),
              })
            }
            disabled={!canEdit}
            multiline
            rows={4}
          />
        </div>

        <div className="p-8 rounded-2xl bg-card border border-border space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-foreground">Vision Pillars</h3>
              <p className="text-sm text-muted-foreground">
                Edit the grid cards shown below the main vision statement.
              </p>
            </div>

            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                resetForm();
                setIsFormOpen(true);
              }}
              disabled={!canEdit}
              className="px-5 py-3 bg-muted text-foreground rounded-lg font-medium hover:bg-accent disabled:opacity-60 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Pillar
            </motion.button>
          </div>

          {isFormOpen ? (
            <div className="p-6 rounded-xl border border-border bg-background">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-foreground">
                  {editingPillar ? "Edit Pillar" : "Add Pillar"}
                </h4>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-5">
                <select
                  value={formData.icon}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      icon: event.target.value as typeof formData.icon,
                    })
                  }
                  className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground outline-none"
                >
                  {visionIconOptions.map((icon) => (
                    <option key={icon} value={icon}>
                      {icon}
                    </option>
                  ))}
                </select>

                <LocalizedFieldGroup
                  label="Pillar title"
                  value={formData.title}
                  onChange={(value) => setFormData({ ...formData, title: value })}
                />

                <LocalizedFieldGroup
                  label="Pillar description"
                  value={formData.description}
                  onChange={(value) =>
                    setFormData({ ...formData, description: value })
                  }
                  multiline
                  rows={3}
                />

                <div className="flex gap-3">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => void handlePillarSubmit()}
                    disabled={saving}
                    className="px-5 py-3 theme-accent-button rounded-lg font-medium disabled:opacity-60 transition-colors"
                  >
                    {saving
                      ? "Syncing..."
                      : editingPillar
                        ? "Update Pillar"
                        : "Add Pillar"}
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={resetForm}
                    className="px-5 py-3 bg-muted text-foreground rounded-lg font-medium hover:bg-accent transition-colors"
                  >
                    Cancel
                  </motion.button>
                </div>
              </div>
            </div>
          ) : null}

          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
            {section.pillars.map((pillar) => (
              <div
                key={pillar.id}
                className="p-5 rounded-xl bg-background border border-border space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm theme-accent-text">{pillar.icon}</p>
                    <h4 className="font-semibold text-foreground">
                      {getLocalizedText(pillar.title, "en")}
                    </h4>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPillar(pillar);
                        setFormData({
                          icon: getPillarFormIcon(pillar.icon),
                          title: toLocalizedDraft(pillar.title),
                          description: toLocalizedDraft(pillar.description),
                        });
                        setIsFormOpen(true);
                      }}
                      disabled={!canEdit}
                      className="p-2 rounded-lg bg-muted text-foreground hover:bg-accent disabled:opacity-60 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(pillar.id)}
                      disabled={!canEdit || saving}
                      className="p-2 rounded-lg bg-muted text-red-500 hover:bg-red-500/10 disabled:opacity-60 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  {getLocalizedText(pillar.description, "en")}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
