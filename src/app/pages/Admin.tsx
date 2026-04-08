import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, LogOut } from "lucide-react";
import { motion } from "motion/react";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import { SiteAdmin } from "../components/admin/SiteAdmin";
import { ProjectsAdmin } from "../components/admin/ProjectsAdmin";
import { SkillsAdmin } from "../components/admin/SkillsAdmin";
import { BlogAdmin } from "../components/admin/BlogAdmin";
import { AboutAdmin } from "../components/admin/AboutAdmin";
import { VisionAdmin } from "../components/admin/VisionAdmin";
import { LoginPanel } from "../components/admin/LoginPanel";

export function Admin() {
  const navigate = useNavigate();
  const { meta, loading, error, statusMessage } = useData();
  const { isConfigured, loading: authLoading, session, user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "site" | "projects" | "skills" | "blog" | "about" | "vision"
  >("site");

  const tabs = [
    { id: "site" as const, label: "Site" },
    { id: "projects" as const, label: "Projects" },
    { id: "skills" as const, label: "Skills" },
    { id: "blog" as const, label: "Blog" },
    { id: "about" as const, label: "About" },
    { id: "vision" as const, label: "Vision" },
  ];

  const canEdit = Boolean(session) && meta.canPersist;

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 min-h-20 py-4">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted text-foreground hover:bg-accent transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Site
              </motion.button>

              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Content Management
                </h1>
                <p className="text-sm text-muted-foreground">
                  Remote admin powered by MongoDB and Supabase
                </p>
              </div>
            </div>

            {session ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">
                    {user?.email ?? "Signed in"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {canEdit ? "Write access enabled" : "Read-only mode"}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => void signOut()}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted text-foreground hover:bg-accent transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </motion.button>
              </div>
            ) : null}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "theme-accent-tab"
                    : "text-muted-foreground border-transparent hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 space-y-8">
        <div className="grid gap-4">
          {loading || authLoading ? (
            <div className="p-5 rounded-xl bg-card border border-border text-muted-foreground">
              Loading admin workspace...
            </div>
          ) : null}

          {statusMessage ? (
            <div className="p-5 rounded-xl bg-card border border-emerald-500/30 text-emerald-700 dark:text-emerald-300">
              {statusMessage}
            </div>
          ) : null}

          {error ? (
            <div className="p-5 rounded-xl bg-card border border-red-500/30 text-red-600 dark:text-red-300">
              {error}
            </div>
          ) : null}

          {!meta.isMongoConfigured ? (
            <div className="p-5 rounded-xl bg-card border border-amber-500/30 text-amber-700 dark:text-amber-300">
              MongoDB is not configured yet. Set `MONGODB_URI` and
              `MONGODB_DB_NAME` to persist admin edits remotely.
            </div>
          ) : null}

          {!isConfigured ? (
            <div className="p-5 rounded-xl bg-card border border-amber-500/30 text-amber-700 dark:text-amber-300">
              Supabase client auth is not configured yet. Add
              `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
              before enabling protected admin saves.
            </div>
          ) : null}

          {!meta.isStorageConfigured ? (
            <div className="p-5 rounded-xl bg-card border border-amber-500/30 text-amber-700 dark:text-amber-300">
              Supabase Storage uploads are not configured yet. Add
              `SUPABASE_SERVICE_ROLE_KEY` and `SUPABASE_STORAGE_BUCKET` before
              uploading profile or blog images from admin.
            </div>
          ) : null}
        </div>

        {!session && isConfigured ? <LoginPanel /> : null}

        <div className={!canEdit ? "opacity-80" : ""}>
          {activeTab === "site" && <SiteAdmin canEdit={canEdit} />}
          {activeTab === "projects" && <ProjectsAdmin canEdit={canEdit} />}
          {activeTab === "skills" && <SkillsAdmin canEdit={canEdit} />}
          {activeTab === "blog" && <BlogAdmin canEdit={canEdit} />}
          {activeTab === "about" && <AboutAdmin canEdit={canEdit} />}
          {activeTab === "vision" && <VisionAdmin canEdit={canEdit} />}
        </div>
      </div>
    </div>
  );
}
