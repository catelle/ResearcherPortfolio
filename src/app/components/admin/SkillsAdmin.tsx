import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Edit2, Plus, Save, Trash2, X } from "lucide-react";
import { useData } from "../../context/DataContext";
import {
  buildLocalizedListValue,
  buildLocalizedTextValue,
  createContentItemId,
  getLocalizedText,
  toLocalizedDraft,
  toLocalizedListDraft,
  type LocalizedText,
  type SkillCategory,
} from "../../lib/portfolio-content";
import { LocalizedFieldGroup } from "./LocalizedFields";

export function SkillsAdmin({ canEdit }: { canEdit: boolean }) {
  const { content, saveContent, saving } = useData();
  const [section, setSection] = useState(content.skills);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<SkillCategory | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: { en: "", fr: "" } as LocalizedText,
    skills: { en: "", fr: "" } as LocalizedText,
    color: "#a855f7",
  });

  useEffect(() => {
    setSection(content.skills);
  }, [content.skills]);

  const resetForm = () => {
    setFormData({
      title: { en: "", fr: "" },
      skills: { en: "", fr: "" },
      color: "#a855f7",
    });
    setEditingCategory(null);
    setIsFormOpen(false);
  };

  const persistSection = async (
    nextSection: typeof section,
    successMessage: string,
  ) => {
    const result = await saveContent(
      (current) => ({
        ...current,
        skills: nextSection,
      }),
      successMessage,
    );

    setFeedback(result.message);

    if (result.success) {
      setSection(nextSection);
    }

    return result;
  };

  const handleCategorySubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const nextCategory: SkillCategory = {
      id: editingCategory?.id ?? createContentItemId("skill"),
      title: buildLocalizedTextValue(formData.title),
      skills: buildLocalizedListValue(formData.skills),
      color: formData.color,
    };

    const nextSection = {
      ...section,
      categories: editingCategory
        ? section.categories.map((item) =>
            item.id === editingCategory.id ? nextCategory : item,
          )
        : [nextCategory, ...section.categories],
    };

    const result = await persistSection(
      nextSection,
      editingCategory
        ? "Skill category updated successfully."
        : "Skill category added successfully.",
    );

    if (result.success) {
      resetForm();
    }
  };

  const handleSave = async () => {
    await persistSection(section, "Skills section saved successfully.");
  };

  const handleDelete = async (categoryId: string) => {
    const nextSection = {
      ...section,
      categories: section.categories.filter((item) => item.id !== categoryId),
    };

    await persistSection(nextSection, "Skill category deleted successfully.");
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div className="space-y-4 flex-1">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Manage Skills</h2>
            <p className="text-muted-foreground mt-2">
              Edit the skills headline and organize the categories displayed on
              the homepage.
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
            <input
              type="number"
              min={1}
              value={section.previewCategoryCount}
              onChange={(event) =>
                setSection({
                  ...section,
                  previewCategoryCount: Number(event.target.value) || 1,
                })
              }
              disabled={!canEdit}
              className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground outline-none"
              placeholder="Homepage category preview count"
            />
            <input
              type="number"
              min={1}
              value={section.previewSkillsPerCategory}
              onChange={(event) =>
                setSection({
                  ...section,
                  previewSkillsPerCategory: Number(event.target.value) || 1,
                })
              }
              disabled={!canEdit}
              className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground outline-none"
              placeholder="Skills shown per category"
            />
            <div className="md:col-span-2">
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
            </div>
          </div>

          <label className="flex items-center gap-3 rounded-lg bg-card border border-border px-4 py-3 text-sm text-foreground">
            <input
              type="checkbox"
              checked={section.showSkillCloud}
              onChange={(event) =>
                setSection({
                  ...section,
                  showSkillCloud: event.target.checked,
                })
              }
              disabled={!canEdit}
              className="h-4 w-4"
            />
            Show the animated skill cloud above the skills list
          </label>
        </div>

        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsFormOpen(true)}
            disabled={!canEdit}
            className="px-6 py-3 bg-muted text-foreground rounded-lg font-medium hover:bg-accent disabled:opacity-60 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => void handleSave()}
            disabled={!canEdit || saving}
            className="px-6 py-3 theme-accent-button rounded-lg font-medium disabled:opacity-60 transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Skills"}
          </motion.button>
        </div>
      </div>

      {feedback ? <p className="text-sm text-muted-foreground">{feedback}</p> : null}

      {isFormOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-2xl p-8 max-w-xl w-full"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-foreground">
                {editingCategory ? "Edit Category" : "Add Category"}
              </h3>
              <button
                type="button"
                onClick={resetForm}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCategorySubmit} className="space-y-5">
              <LocalizedFieldGroup
                label="Category title"
                value={formData.title}
                onChange={(value) => setFormData({ ...formData, title: value })}
              />

              <LocalizedFieldGroup
                label="Skills list"
                value={formData.skills}
                onChange={(value) => setFormData({ ...formData, skills: value })}
                multiline
                rows={4}
                englishPlaceholder={"Skill one\nSkill two\nSkill three"}
                frenchPlaceholder={"Competence un\nCompetence deux\nCompetence trois"}
              />

              <input
                type="color"
                value={formData.color}
                onChange={(event) =>
                  setFormData({ ...formData, color: event.target.value })
                }
                className="w-full h-12 rounded-lg bg-background border border-border"
              />

              <div className="flex gap-3">
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  disabled={saving}
                  className="px-5 py-3 theme-accent-button rounded-lg font-medium disabled:opacity-60 transition-colors"
                >
                  {saving
                    ? "Syncing..."
                    : editingCategory
                      ? "Update Category"
                      : "Add Category"}
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
            </form>
          </motion.div>
        </div>
      ) : null}

      <div className="grid md:grid-cols-2 gap-6">
        {section.categories.map((category) => (
          <div
            key={category.id}
            className="p-6 rounded-xl bg-card border border-border"
          >
            <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                <h3 className="font-bold text-foreground">
                  {getLocalizedText(category.title, "en")}
                </h3>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingCategory(category);
                    setFormData({
                      title: toLocalizedDraft(category.title),
                      skills: toLocalizedListDraft(category.skills),
                      color: category.color,
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
                  onClick={() => void handleDelete(category.id)}
                  disabled={!canEdit || saving}
                  className="p-2 rounded-lg bg-muted text-red-500 hover:bg-red-500/10 disabled:opacity-60 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {category.skills.map((skill) => (
                <span
                  key={getLocalizedText(skill, "en")}
                  className="px-3 py-1 text-xs rounded-full bg-muted text-foreground border border-border"
                >
                  {getLocalizedText(skill, "en")}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
