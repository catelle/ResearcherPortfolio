import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Edit2, Plus, Save, Trash2, X } from "lucide-react";
import { useData } from "../../context/DataContext";
import {
  createContentItemId,
  projectIconOptions,
  type Project,
} from "../../lib/portfolio-content";

export function ProjectsAdmin({ canEdit }: { canEdit: boolean }) {
  const { content, saveContent, saving } = useData();
  const [section, setSection] = useState(content.projects);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    icon: projectIconOptions[0],
    title: "",
    category: "",
    problem: "",
    solution: "",
    techStack: "",
    impact: "",
    color: "#a855f7",
  });

  useEffect(() => {
    setSection(content.projects);
  }, [content.projects]);

  const resetForm = () => {
    setFormData({
      icon: projectIconOptions[0],
      title: "",
      category: "",
      problem: "",
      solution: "",
      techStack: "",
      impact: "",
      color: "#a855f7",
    });
    setEditingProject(null);
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

    const nextProject: Project = {
      id: editingProject?.id ?? createContentItemId("project"),
      icon: formData.icon,
      title: formData.title,
      category: formData.category,
      problem: formData.problem,
      solution: formData.solution,
      techStack: formData.techStack
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      impact: formData.impact,
      color: formData.color,
    };

    const nextSection = {
      ...section,
      items: editingProject
        ? section.items.map((item) =>
            item.id === editingProject.id ? nextProject : item,
          )
        : [...section.items, nextProject],
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
              Update the section headline and curate the portfolio projects that
              appear on the homepage.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              value={section.heading}
              onChange={(event) =>
                setSection({ ...section, heading: event.target.value })
              }
              disabled={!canEdit}
              className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground outline-none"
              placeholder="Section heading"
            />
            <input
              type="text"
              value={section.intro}
              onChange={(event) =>
                setSection({ ...section, intro: event.target.value })
              }
              disabled={!canEdit}
              className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground outline-none"
              placeholder="Section intro"
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
            className="bg-card border border-border rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
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
              <div className="grid md:grid-cols-2 gap-5">
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
              </div>

              <input
                type="text"
                value={formData.title}
                onChange={(event) =>
                  setFormData({ ...formData, title: event.target.value })
                }
                className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground outline-none"
                placeholder="Project title"
                required
              />

              <input
                type="text"
                value={formData.category}
                onChange={(event) =>
                  setFormData({ ...formData, category: event.target.value })
                }
                className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground outline-none"
                placeholder="Category label"
                required
              />

              <textarea
                value={formData.problem}
                onChange={(event) =>
                  setFormData({ ...formData, problem: event.target.value })
                }
                rows={3}
                className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground outline-none resize-none"
                placeholder="Problem statement"
                required
              />

              <textarea
                value={formData.solution}
                onChange={(event) =>
                  setFormData({ ...formData, solution: event.target.value })
                }
                rows={3}
                className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground outline-none resize-none"
                placeholder="Solution summary"
                required
              />

              <input
                type="text"
                value={formData.techStack}
                onChange={(event) =>
                  setFormData({ ...formData, techStack: event.target.value })
                }
                className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground outline-none"
                placeholder="React, Node.js, MongoDB"
                required
              />

              <textarea
                value={formData.impact}
                onChange={(event) =>
                  setFormData({ ...formData, impact: event.target.value })
                }
                rows={3}
                className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground outline-none resize-none"
                placeholder="Impact statement"
                required
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
            className="p-6 rounded-xl bg-card border border-border space-y-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-foreground">{project.title}</h3>
                <p className="text-sm theme-accent-text">{project.category}</p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingProject(project);
                    setFormData({
                      icon: project.icon as typeof formData.icon,
                      title: project.title,
                      category: project.category,
                      problem: project.problem,
                      solution: project.solution,
                      techStack: project.techStack.join(", "),
                      impact: project.impact,
                      color: project.color,
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
                  onClick={() => void handleDelete(project.id)}
                  disabled={!canEdit || saving}
                  className="p-2 rounded-lg bg-muted text-red-500 hover:bg-red-500/10 disabled:opacity-60 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">{project.problem}</p>

            <div className="flex flex-wrap gap-2">
              {project.techStack.map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 text-xs rounded-full bg-muted text-foreground border border-border"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
