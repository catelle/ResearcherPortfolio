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
  type BlogPost,
} from "../../lib/portfolio-content";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { LocalizedFieldGroup } from "./LocalizedFields";

function parseListInput(value: string) {
  return value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function BlogAdmin({ canEdit }: { canEdit: boolean }) {
  const { content, saveContent, saving, uploading, uploadAsset } = useData();
  const [section, setSection] = useState(content.blog);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: { en: "", fr: "" } as LocalizedText,
    excerpt: { en: "", fr: "" } as LocalizedText,
    category: { en: "", fr: "" } as LocalizedText,
    date: { en: "", fr: "" } as LocalizedText,
    readTime: { en: "", fr: "" } as LocalizedText,
    image: "",
    imageAlt: { en: "", fr: "" } as LocalizedText,
    author: { en: "", fr: "" } as LocalizedText,
    featured: false,
    tags: { en: "", fr: "" } as LocalizedText,
    body: { en: "", fr: "" } as LocalizedText,
    keyTakeaways: { en: "", fr: "" } as LocalizedText,
    externalUrl: "",
  });

  useEffect(() => {
    setSection(content.blog);
  }, [content.blog]);

  const resetForm = () => {
    setFormData({
      title: { en: "", fr: "" },
      excerpt: { en: "", fr: "" },
      category: { en: "", fr: "" },
      date: { en: "", fr: "" },
      readTime: { en: "", fr: "" },
      image: "",
      imageAlt: { en: "", fr: "" },
      author: { en: "", fr: "" },
      featured: false,
      tags: { en: "", fr: "" },
      body: { en: "", fr: "" },
      keyTakeaways: { en: "", fr: "" },
      externalUrl: "",
    });
    setEditingPost(null);
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
        blog: nextSection,
      }),
      successMessage,
    );

    setFeedback(result.message);

    if (result.success) {
      setSection(nextSection);
    }

    return result;
  };

  const handlePostSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    let imageUrl = formData.image.trim();

    if (imageFile) {
      const uploadResult = await uploadAsset(
        imageFile,
        "blog",
        "Blog image uploaded successfully.",
      );

      if (!uploadResult.success || !uploadResult.url) {
        setFeedback(uploadResult.message);
        return;
      }

      imageUrl = uploadResult.url;
    }

    const nextPost: BlogPost = {
      id: editingPost?.id ?? createContentItemId("blog"),
      title: buildLocalizedTextValue(formData.title),
      excerpt: buildLocalizedTextValue(formData.excerpt),
      category: buildLocalizedTextValue(formData.category),
      date: buildLocalizedTextValue(formData.date),
      readTime: buildLocalizedTextValue(formData.readTime),
      image: imageUrl,
      imageAlt: buildLocalizedTextValue(formData.imageAlt),
      author: buildLocalizedTextValue(formData.author),
      featured: formData.featured,
      tags: buildLocalizedListValue(formData.tags),
      body: buildLocalizedTextValue(formData.body),
      keyTakeaways: buildLocalizedListValue(formData.keyTakeaways),
      externalUrl: formData.externalUrl.trim(),
    };

    const nextSection = {
      ...section,
      posts: editingPost
        ? section.posts.map((item) =>
            item.id === editingPost.id ? nextPost : item,
          )
        : [nextPost, ...section.posts],
    };

    const result = await persistSection(
      nextSection,
      editingPost
        ? "Blog post updated successfully."
        : "Blog post added successfully.",
    );

    if (result.success) {
      resetForm();
    }
  };

  const handleSave = async () => {
    await persistSection(section, "Blog section saved successfully.");
  };

  const handleDelete = async (postId: string) => {
    const nextSection = {
      ...section,
      posts: section.posts.filter((item) => item.id !== postId),
    };

    await persistSection(nextSection, "Blog post deleted successfully.");
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div className="space-y-4 flex-1">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Manage Blog</h2>
            <p className="text-muted-foreground mt-2">
              Keep homepage highlights short, while storing the full article copy
              and supporting details for the blog detail pages.
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
            Add Post
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => void handleSave()}
            disabled={!canEdit || saving}
            className="px-6 py-3 theme-accent-button rounded-lg font-medium disabled:opacity-60 transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Blog"}
          </motion.button>
        </div>
      </div>

      {feedback ? <p className="text-sm text-muted-foreground">{feedback}</p> : null}

      {isFormOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-foreground">
                {editingPost ? "Edit Blog Post" : "Add Blog Post"}
              </h3>
              <button
                type="button"
                onClick={resetForm}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePostSubmit} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <LocalizedFieldGroup
                  label="Post title"
                  value={formData.title}
                  onChange={(value) => setFormData({ ...formData, title: value })}
                />

                <label className="flex items-center gap-3 rounded-lg bg-background border border-border px-4 py-3 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(event) =>
                      setFormData({ ...formData, featured: event.target.checked })
                    }
                    className="h-4 w-4"
                  />
                  Featured article
                </label>
              </div>

              <LocalizedFieldGroup
                label="Short excerpt"
                value={formData.excerpt}
                onChange={(value) => setFormData({ ...formData, excerpt: value })}
                multiline
                rows={3}
              />

              <div className="grid md:grid-cols-3 gap-4">
                <LocalizedFieldGroup
                  label="Category"
                  value={formData.category}
                  onChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                />
                <LocalizedFieldGroup
                  label="Date"
                  value={formData.date}
                  onChange={(value) => setFormData({ ...formData, date: value })}
                  englishPlaceholder="April 8, 2026"
                  frenchPlaceholder="8 avril 2026"
                />
                <LocalizedFieldGroup
                  label="Read time"
                  value={formData.readTime}
                  onChange={(value) =>
                    setFormData({ ...formData, readTime: value })
                  }
                  englishPlaceholder="7 min read"
                  frenchPlaceholder="7 min de lecture"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <LocalizedFieldGroup
                  label="Author"
                  value={formData.author}
                  onChange={(value) => setFormData({ ...formData, author: value })}
                />
                <LocalizedFieldGroup
                  label="Tags"
                  value={formData.tags}
                  onChange={(value) => setFormData({ ...formData, tags: value })}
                  multiline
                  rows={4}
                  englishPlaceholder={"Security\nProduct\nAfrica"}
                  frenchPlaceholder={"Securite\nProduit\nAfrique"}
                />
              </div>

              <LocalizedFieldGroup
                label="Full article body for the detail page"
                value={formData.body}
                onChange={(value) => setFormData({ ...formData, body: value })}
                multiline
                rows={8}
              />

              <LocalizedFieldGroup
                label="Key takeaways"
                value={formData.keyTakeaways}
                onChange={(value) =>
                  setFormData({ ...formData, keyTakeaways: value })
                }
                multiline
                rows={4}
                englishPlaceholder={"Takeaway one\nTakeaway two"}
                frenchPlaceholder={"Point cle un\nPoint cle deux"}
              />

              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="url"
                  value={formData.image}
                  onChange={(event) =>
                    setFormData({ ...formData, image: event.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground outline-none"
                  placeholder="Image URL"
                />
                <LocalizedFieldGroup
                  label="Image alt text"
                  value={formData.imageAlt}
                  onChange={(value) => setFormData({ ...formData, imageAlt: value })}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Paste an image URL, or upload an image file below.
              </p>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Upload Blog Image
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
                  Optional. If a file is selected, it will replace the pasted URL.
                </p>
              </div>

              <input
                type="url"
                value={formData.externalUrl}
                onChange={(event) =>
                  setFormData({ ...formData, externalUrl: event.target.value })
                }
                className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground outline-none"
                placeholder="External article URL"
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
                      : editingPost
                        ? "Update Post"
                        : "Add Post"}
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

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {section.posts.map((post) => (
          <div
            key={post.id}
            className="rounded-xl bg-card border border-border overflow-hidden"
          >
            <div className="relative h-44 bg-muted">
              {post.image ? (
                <ImageWithFallback
                  src={post.image}
                  alt={
                    getLocalizedText(post.imageAlt, "en") ||
                    getLocalizedText(post.title, "en")
                  }
                  className="w-full h-full object-cover"
                />
              ) : null}
              {post.featured ? (
                <span className="absolute top-4 right-4 px-3 py-1 text-xs rounded-full theme-accent-badge font-medium">
                  Featured
                </span>
              ) : null}
            </div>
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="px-3 py-1 text-xs rounded-full theme-accent-badge font-medium">
                  {getLocalizedText(post.category, "en")}
                </span>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPost(post);
                      setFormData({
                        title: toLocalizedDraft(post.title),
                        excerpt: toLocalizedDraft(post.excerpt),
                        category: toLocalizedDraft(post.category),
                        date: toLocalizedDraft(post.date),
                        readTime: toLocalizedDraft(post.readTime),
                        image: post.image,
                        imageAlt: toLocalizedDraft(post.imageAlt),
                        author: toLocalizedDraft(post.author),
                        featured: post.featured,
                        tags: toLocalizedListDraft(post.tags),
                        body: toLocalizedDraft(post.body),
                        keyTakeaways: toLocalizedListDraft(post.keyTakeaways),
                        externalUrl: post.externalUrl,
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
                    onClick={() => void handleDelete(post.id)}
                    disabled={!canEdit || saving || uploading}
                    className="p-2 rounded-lg bg-muted text-red-500 hover:bg-red-500/10 disabled:opacity-60 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="font-bold text-foreground line-clamp-2">
                {getLocalizedText(post.title, "en")}
              </h3>
              <p className="text-xs text-muted-foreground">
                {getLocalizedText(post.date, "en")} •{" "}
                {getLocalizedText(post.readTime, "en")}
                {getLocalizedText(post.author, "en")
                  ? ` • ${getLocalizedText(post.author, "en")}`
                  : ""}
              </p>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {getLocalizedText(post.excerpt, "en")}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
