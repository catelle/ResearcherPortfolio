import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Edit2, Plus, Save, Trash2, X } from "lucide-react";
import { useData } from "../../context/DataContext";
import {
  buildLocalizedListValue,
  buildLocalizedTextValue,
  createContentItemId,
  getLocalizedText,
  projectIconOptions,
  toLocalizedDraft,
  toLocalizedListDraft,
  type LocalizedText,
  type Project,
} from "../../lib/portfolio-content";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { LocalizedFieldGroup } from "./LocalizedFields";

function parseListInput(value: string) {
  return value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function ProjectsAdmin({ canEdit }: { canEdit: boolean }) {
  const { content, saveContent, saving, uploading, uploadAsset } = useData();
  const [section, setSection] = useState(content.projects);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    icon: projectIconOptions[0],
    title: { en: "", fr: "" } as LocalizedText,
    category: { en: "", fr: "" } as LocalizedText,
    summary: { en: "", fr: "" } as LocalizedText,
    problem: { en: "", fr: "" } as LocalizedText,
    solution: { en: "", fr: "" } as LocalizedText,
    techStack: "",
    impact: { en: "", fr: "" } as LocalizedText,
    color: "#a855f7",
    image: "",
    imageAlt: { en: "", fr: "" } as LocalizedText,
    year: "",
    client: { en: "", fr: "" } as LocalizedText,
    role: { en: "", fr: "" } as LocalizedText,
    duration: { en: "", fr: "" } as LocalizedText,
    featured: false,
    details: { en: "", fr: "" } as LocalizedText,
    outcomes: { en: "", fr: "" } as LocalizedText,
    demoUrl: "",
    repositoryUrl: "",
  });

  useEffect(() => {
    setSection(content.projects);
  }, [content.projects]);

  const resetForm = () => {
    setFormData({
      icon: projectIconOptions[0],
      title: { en: "", fr: "" },
      category: { en: "", fr: "" },
      summary: { en: "", fr: "" },
      problem: { en: "", fr: "" },
      solution: { en: "", fr: "" },
      techStack: "",
      impact: { en: "", fr: "" },
      color: "#a855f7",
      image: "",
      imageAlt: { en: "", fr: "" },
      year: "",
      client: { en: "", fr: "" },
      role: { en: "", fr: "" },
      duration: { en: "", fr: "" },
      featured: false,
      details: { en: "", fr: "" },
      outcomes: { en: "", fr: "" },
      demoUrl: "",
      repositoryUrl: "",
    });
    setEditingProject(null);
    setImageFile(null);
    setIsFormOpen(false);
  };

  const persistSection = async (
    nextSection: typeof section,
    successMessage: string,
  ) => {
    const result = await saveContent(
      (current) => ({
        ...current,
        projects: nextSection,
      }),
      successMessage,
    );

    setFeedback(result.message);

    if (result.success) {
      setSection(nextSection);
    }

    return result;
  };

  const handleProjectSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    let imageUrl = formData.image.trim();

    if (imageFile) {
      const uploadResult = await uploadAsset(
        imageFile,
        "project",
        "Project image uploaded successfully.",
      );

      if (!uploadResult.success || !uploadResult.url) {
        setFeedback(uploadResult.message);
        return;
      }

      imageUrl = uploadResult.url;
    }

    const nextProject: Project = {
      id: editingProject?.id ?? createContentItemId("project"),
      icon: formData.icon,
      title: buildLocalizedTextValue(formData.title),
      category: buildLocalizedTextValue(formData.category),
      summary: buildLocalizedTextValue(formData.summary),
      problem: buildLocalizedTextValue(formData.problem),
      solution: buildLocalizedTextValue(formData.solution),
      techStack: parseListInput(formData.techStack),
      impact: buildLocalizedTextValue(formData.impact),
      color: formData.color,
      image: imageUrl,
      imageAlt: buildLocalizedTextValue(formData.imageAlt),
      year: formData.year.trim(),
      client: buildLocalizedTextValue(formData.client),
      role: buildLocalizedTextValue(formData.role),
      duration: buildLocalizedTextValue(formData.duration),
      featured: formData.featured,
      details: buildLocalizedTextValue(formData.details),
      outcomes: buildLocalizedListValue(formData.outcomes),
      demoUrl: formData.demoUrl.trim(),
      repositoryUrl: formData.repositoryUrl.trim(),
    };

    const nextSection = {
      ...section,
      items: editingProject
        ? section.items.map((item) =>
            item.id === editingProject.id ? nextProject : item,
          )
        : [nextProject, ...section.items],
    };

    const result = await persistSection(
      nextSection,
      editingProject
        ? "Project updated successfully."
        : "Project added successfully.",
    );

    if (result.success) {
      resetForm();
    }
  };

  const handleSave = async () => {
    await persistSection(section, "Projects section saved successfully.");
  };

  const handleDelete = async (projectId: string) => {
    const nextSection = {
      ...section,
      items: section.items.filter((item) => item.id !== projectId),
    };

    await persistSection(nextSection, "Project deleted successfully.");
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div className="space-y-4 flex-1">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Manage Projects</h2>
            <p className="text-muted-foreground mt-2">
              Keep the homepage curated while adding richer case-study details for
              the dedicated project pages.
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
          </div>
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
            Add Project
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => void handleSave()}
            disabled={!canEdit || saving}
            className="px-6 py-3 theme-accent-button rounded-lg font-medium disabled:opacity-60 transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Projects"}
          </motion.button>
        </div>
      </div>

      {feedback ? (
        <p className="text-sm text-muted-foreground">{feedback}</p>
      ) : null}

      {isFormOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-foreground">
                {editingProject ? "Edit Project" : "Add Project"}
              </h3>
              <button
                type="button"
                onClick={resetForm}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProjectSubmit} className="space-y-5">
              <div className="grid md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Icon
                  </label>
                  <select
                    value={formData.icon}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        icon: event.target.value as typeof formData.icon,
                      })
                    }
                    className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground outline-none"
                  >
                    {projectIconOptions.map((icon) => (
                      <option key={icon} value={icon}>
                        {icon}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Accent Color
                  </label>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(event) =>
                      setFormData({ ...formData, color: event.target.value })
                    }
                    className="w-full h-12 rounded-lg bg-background border border-border"
                  />
                </div>

                <label className="flex items-center gap-3 rounded-lg bg-background border border-border px-4 py-3 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(event) =>
                      setFormData({ ...formData, featured: event.target.checked })
                    }
                    className="h-4 w-4"
                  />
                  Featured project
                </label>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <LocalizedFieldGroup
                  label="Project title"
                  value={formData.title}
                  onChange={(value) => setFormData({ ...formData, title: value })}
                />
                <LocalizedFieldGroup
                  label="Category label"
                  value={formData.category}
                  onChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                />
              </div>

              <LocalizedFieldGroup
                label="Short summary shown in cards and headers"
                value={formData.summary}
                onChange={(value) => setFormData({ ...formData, summary: value })}
                multiline
                rows={3}
              />

              <div className="grid md:grid-cols-2 gap-5">
                <LocalizedFieldGroup
                  label="Problem statement"
                  value={formData.problem}
                  onChange={(value) => setFormData({ ...formData, problem: value })}
                  multiline
                  rows={4}
                />
                <LocalizedFieldGroup
                  label="Solution summary"
                  value={formData.solution}
                  onChange={(value) =>
                    setFormData({ ...formData, solution: value })
                  }
                  multiline
                  rows={4}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <input
                  type="text"
                  value={formData.techStack}
                  onChange={(event) =>
                    setFormData({ ...formData, techStack: event.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground outline-none"
                  placeholder="React, Node.js, MongoDB"
                />
                <LocalizedFieldGroup
                  label="Outcomes"
                  value={formData.outcomes}
                  onChange={(value) =>
                    setFormData({ ...formData, outcomes: value })
                  }
                  multiline
                  rows={4}
                  englishPlaceholder={"Outcome one\nOutcome two"}
                  frenchPlaceholder={"Resultat un\nResultat deux"}
                />
              </div>

              <LocalizedFieldGroup
                label="Impact statement"
                value={formData.impact}
                onChange={(value) => setFormData({ ...formData, impact: value })}
                multiline
                rows={3}
              />

              <LocalizedFieldGroup
                label="Long-form project details for the dedicated page"
                value={formData.details}
                onChange={(value) => setFormData({ ...formData, details: value })}
                multiline
                rows={5}
              />

              <div className="grid md:grid-cols-2 gap-5">
                <input
                  type="url"
                  value={formData.image}
                  onChange={(event) =>
                    setFormData({ ...formData, image: event.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground outline-none"
                  placeholder="Project image URL"
                />
                <LocalizedFieldGroup
                  label="Image alt text"
                  value={formData.imageAlt}
                  onChange={(value) => setFormData({ ...formData, imageAlt: value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Upload Project Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) =>
                    setImageFile(event.target.files?.[0] ?? null)
                  }
                  disabled={!canEdit || saving || uploading}
                  className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground outline-none file:mr-4 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-2 file:text-sm file:font-medium"
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  Optional. A selected file will replace the pasted image URL.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-5">
                <input
                  type="text"
                  value={formData.year}
                  onChange={(event) =>
                    setFormData({ ...formData, year: event.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground outline-none"
                  placeholder="Year"
                />
                <LocalizedFieldGroup
                  label="Client or organization"
                  value={formData.client}
                  onChange={(value) => setFormData({ ...formData, client: value })}
                />
                <LocalizedFieldGroup
                  label="Your role"
                  value={formData.role}
                  onChange={(value) => setFormData({ ...formData, role: value })}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <LocalizedFieldGroup
                  label="Duration"
                  value={formData.duration}
                  onChange={(value) =>
                    setFormData({ ...formData, duration: value })
                  }
                />
                <input
                  type="url"
                  value={formData.demoUrl}
                  onChange={(event) =>
                    setFormData({ ...formData, demoUrl: event.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground outline-none"
                  placeholder="Live demo URL"
                />
              </div>

              <input
                type="url"
                value={formData.repositoryUrl}
                onChange={(event) =>
                  setFormData({ ...formData, repositoryUrl: event.target.value })
                }
                className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground outline-none"
                placeholder="Repository URL"
              />

              <div className="flex gap-3">
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  disabled={saving || uploading}
                  className="px-5 py-3 theme-accent-button rounded-lg font-medium disabled:opacity-60 transition-colors"
                >
                  {uploading
                    ? "Uploading..."
                    : saving
                      ? "Syncing..."
                      : editingProject
                        ? "Update Project"
                        : "Add Project"}
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
        {section.items.map((project) => (
          <div
            key={project.id}
            className="rounded-2xl bg-card border border-border overflow-hidden"
          >
            <div className="relative h-48 bg-muted">
              {project.image ? (
                <ImageWithFallback
                  src={project.image}
                  alt={
                    getLocalizedText(project.imageAlt, "en") ||
                    getLocalizedText(project.title, "en")
                  }
                  className="w-full h-full object-cover"
                />
              ) : null}
              {project.featured ? (
                <span className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium theme-accent-badge">
                  Featured
                </span>
              ) : null}
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    {getLocalizedText(project.title, "en")}
                  </h3>
                  <p className="text-sm theme-accent-text">
                    {getLocalizedText(project.category, "en")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {[
                      project.year,
                      getLocalizedText(project.client, "en"),
                      getLocalizedText(project.role, "en"),
                    ]
                      .filter(Boolean)
                      .join(" • ")}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProject(project);
                      setFormData({
                        icon: project.icon as typeof formData.icon,
                        title: toLocalizedDraft(project.title),
                        category: toLocalizedDraft(project.category),
                        summary: toLocalizedDraft(project.summary),
                        problem: toLocalizedDraft(project.problem),
                        solution: toLocalizedDraft(project.solution),
                        techStack: project.techStack.join(", "),
                        impact: toLocalizedDraft(project.impact),
                        color: project.color,
                        image: project.image,
                        imageAlt: toLocalizedDraft(project.imageAlt),
                        year: project.year,
                        client: toLocalizedDraft(project.client),
                        role: toLocalizedDraft(project.role),
                        duration: toLocalizedDraft(project.duration),
                        featured: project.featured,
                        details: toLocalizedDraft(project.details),
                        outcomes: toLocalizedListDraft(project.outcomes),
                        demoUrl: project.demoUrl,
                        repositoryUrl: project.repositoryUrl,
                      });
                      setImageFile(null);
                      setIsFormOpen(true);
                    }}
                    disabled={!canEdit}
                    className="p-2 rounded-lg bg-muted text-foreground hover:bg-accent disabled:opacity-60 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(project.id)}
                    disabled={!canEdit || saving}
                    className="p-2 rounded-lg bg-muted text-red-500 hover:bg-red-500/10 disabled:opacity-60 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                {getLocalizedText(project.summary, "en") ||
                  getLocalizedText(project.problem, "en") ||
                  "No summary added yet."}
              </p>

              <div className="flex flex-wrap gap-2">
                {project.techStack.slice(0, 4).map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 text-xs rounded-full bg-muted text-foreground border border-border"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
