import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Edit2, Plus, Save, Trash2, X } from "lucide-react";
import { useData } from "../../context/DataContext";
import {
  createContentItemId,
  roleIconOptions,
  type HighlightCard,
} from "../../lib/portfolio-content";

export function AboutAdmin({ canEdit }: { canEdit: boolean }) {
  const { content, saveContent, saving } = useData();
  const [section, setSection] = useState(content.about);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<HighlightCard | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    icon: roleIconOptions[0],
    title: "",
    description: "",
  });

  useEffect(() => {
    setSection(content.about);
  }, [content.about]);

  const resetForm = () => {
    setFormData({
      icon: roleIconOptions[0],
      title: "",
      description: "",
    });
    setEditingRole(null);
    setIsFormOpen(false);
  };

  const persistSection = async (
    nextSection: typeof section,
    successMessage: string,
  ) => {
    const result = await saveContent(
      (current) => ({
        ...current,
        about: nextSection,
      }),
      successMessage,
    );

    setFeedback(result.message);

    if (result.success) {
      setSection(nextSection);
    }

    return result;
  };

  const handleRoleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const nextRole: HighlightCard = {
      id: editingRole?.id ?? createContentItemId("about-role"),
      icon: formData.icon,
      title: formData.title,
      description: formData.description,
    };

    const nextSection = {
      ...section,
      roles: editingRole
        ? section.roles.map((item) =>
            item.id === editingRole.id ? nextRole : item,
          )
        : [...section.roles, nextRole],
    };

    const result = await persistSection(
      nextSection,
      editingRole
        ? "Role card updated successfully."
        : "Role card added successfully.",
    );

    if (result.success) {
      resetForm();
    }
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    await persistSection(section, "About section saved successfully.");
  };

  const handleDelete = async (roleId: string) => {
    const nextSection = {
      ...section,
      roles: section.roles.filter((item) => item.id !== roleId),
    };

    await persistSection(nextSection, "Role card deleted successfully.");
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Edit About Section</h2>
          <p className="text-muted-foreground mt-2">
            Update the main about copy and the supporting role cards below it.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          form="about-admin-form"
          disabled={!canEdit || saving}
          className="px-6 py-3 theme-accent-button rounded-lg font-medium disabled:opacity-60 transition-colors flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save About"}
        </motion.button>
      </div>

      {feedback ? <p className="text-sm text-muted-foreground">{feedback}</p> : null}

      <form id="about-admin-form" onSubmit={handleSave} className="space-y-8">
        <div className="p-8 rounded-2xl bg-card border border-border space-y-6">
          <input
            type="text"
            value={section.heading}
            onChange={(event) =>
              setSection({ ...section, heading: event.target.value })
            }
            disabled={!canEdit}
            className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground outline-none"
            placeholder="Section heading"
          />

          <textarea
            value={section.introduction}
            onChange={(event) =>
              setSection({ ...section, introduction: event.target.value })
            }
            rows={5}
            disabled={!canEdit}
            className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground outline-none resize-none"
            placeholder="Introduction paragraph"
          />

          <textarea
            value={section.description}
            onChange={(event) =>
              setSection({ ...section, description: event.target.value })
            }
            rows={5}
            disabled={!canEdit}
            className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground outline-none resize-none"
            placeholder="Description paragraph"
          />
        </div>

        <div className="p-8 rounded-2xl bg-card border border-border space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-foreground">Role Cards</h3>
              <p className="text-sm text-muted-foreground">
                These cards appear under the about text.
              </p>
            </div>

            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsFormOpen(true)}
              disabled={!canEdit}
              className="px-5 py-3 bg-muted text-foreground rounded-lg font-medium hover:bg-accent disabled:opacity-60 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Role
            </motion.button>
          </div>

          {isFormOpen ? (
            <div className="p-6 rounded-xl border border-border bg-background">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-foreground">
                  {editingRole ? "Edit Role" : "Add Role"}
                </h4>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleRoleSubmit} className="space-y-5">
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
                  {roleIconOptions.map((icon) => (
                    <option key={icon} value={icon}>
                      {icon}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  value={formData.title}
                  onChange={(event) =>
                    setFormData({ ...formData, title: event.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground outline-none"
                  placeholder="Role title"
                  required
                />

                <textarea
                  value={formData.description}
                  onChange={(event) =>
                    setFormData({ ...formData, description: event.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground outline-none resize-none"
                  placeholder="Role description"
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
                      : editingRole
                        ? "Update Role"
                        : "Add Role"}
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
            </div>
          ) : null}

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {section.roles.map((role) => (
              <div
                key={role.id}
                className="p-5 rounded-xl bg-background border border-border space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm theme-accent-text">{role.icon}</p>
                    <h4 className="font-semibold text-foreground">{role.title}</h4>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingRole(role);
                        setFormData({
                          icon: role.icon as typeof formData.icon,
                          title: role.title,
                          description: role.description,
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
                      onClick={() => void handleDelete(role.id)}
                      disabled={!canEdit || saving}
                      className="p-2 rounded-lg bg-muted text-red-500 hover:bg-red-500/10 disabled:opacity-60 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">{role.description}</p>
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
