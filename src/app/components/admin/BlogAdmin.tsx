import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Edit2, Plus, Save, Trash2, X } from "lucide-react";
import { useData } from "../../context/DataContext";
import {
  createContentItemId,
  type BlogPost,
} from "../../lib/portfolio-content";

export function BlogAdmin({ canEdit }: { canEdit: boolean }) {
  const { content, saveContent, saving, uploading, uploadAsset } = useData();
  const [section, setSection] = useState(content.blog);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    category: "",
    date: "",
    readTime: "",
    image: "",
  });

  useEffect(() => {
    setSection(content.blog);
  }, [content.blog]);

  const resetForm = () => {
    setFormData({
      title: "",
      excerpt: "",
      category: "",
      date: "",
      readTime: "",
      image: "",
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

    if (!imageUrl) {
      setFeedback("Add a blog image URL or upload an image file before saving.");
      return;
    }

    const nextPost: BlogPost = {
      id: editingPost?.id ?? createContentItemId("blog"),
      title: formData.title,
      excerpt: formData.excerpt,
      category: formData.category,
      date: formData.date,
      readTime: formData.readTime,
      image: imageUrl,
    };

    const nextSection = {
      ...section,
      posts: editingPost
        ? section.posts.map((item) =>
            item.id === editingPost.id ? nextPost : item,
          )
        : [...section.posts, nextPost],
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
              Curate blog cards and adjust the section copy shown on the
              homepage.
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
            Add Post
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => void handleSave()}
            disabled={!canEdit || saving}
            className="px-6 py-3 bg-[#a855f7] text-white rounded-lg font-medium hover:bg-[#9333ea] disabled:opacity-60 transition-colors flex items-center gap-2"
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
            className="bg-card border border-border rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
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
              <input
                type="text"
                value={formData.title}
                onChange={(event) =>
                  setFormData({ ...formData, title: event.target.value })
                }
                className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground outline-none"
                placeholder="Post title"
                required
              />

              <textarea
                value={formData.excerpt}
                onChange={(event) =>
                  setFormData({ ...formData, excerpt: event.target.value })
                }
                rows={4}
                className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground outline-none resize-none"
                placeholder="Post excerpt"
                required
              />

              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={formData.category}
                  onChange={(event) =>
                    setFormData({ ...formData, category: event.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground outline-none"
                  placeholder="Category"
                  required
                />
                <input
                  type="text"
                  value={formData.readTime}
                  onChange={(event) =>
                    setFormData({ ...formData, readTime: event.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground outline-none"
                  placeholder="7 min read"
                  required
                />
              </div>

              <input
                type="text"
                value={formData.date}
                onChange={(event) =>
                  setFormData({ ...formData, date: event.target.value })
                }
                className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground outline-none"
                placeholder="April 8, 2026"
                required
              />

              <input
                type="url"
                value={formData.image}
                onChange={(event) =>
                  setFormData({ ...formData, image: event.target.value })
                }
                className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground outline-none"
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-xs text-muted-foreground">
                Paste an image URL, or upload a blog image file below.
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
                  Optional. If a file is selected, it will be uploaded to
                  Supabase Storage and used instead of the pasted URL.
                </p>
                {imageFile ? (
                  <p className="mt-2 text-xs text-foreground">
                    Selected file: {imageFile.name}
                  </p>
                ) : null}
              </div>

              <div className="flex gap-3">
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  disabled={saving || uploading}
                  className="px-5 py-3 bg-[#a855f7] text-white rounded-lg font-medium hover:bg-[#9333ea] disabled:opacity-60 transition-colors"
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
            <img src={post.image} alt={post.title} className="w-full h-40 object-cover" />
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="px-3 py-1 text-xs rounded-full bg-[#a855f7] text-white font-medium">
                  {post.category}
                </span>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPost(post);
                      setFormData({
                        title: post.title,
                        excerpt: post.excerpt,
                        category: post.category,
                        date: post.date,
                        readTime: post.readTime,
                        image: post.image,
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

              <h3 className="font-bold text-foreground line-clamp-2">{post.title}</h3>
              <p className="text-xs text-muted-foreground">
                {post.date} • {post.readTime}
              </p>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {post.excerpt}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
