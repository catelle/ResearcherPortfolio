import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, ExternalLink, Globe, LogOut, Plus, Rocket } from "lucide-react";
import { motion } from "motion/react";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import { SiteAdmin } from "../components/admin/SiteAdmin";
import { ProjectsAdmin } from "../components/admin/ProjectsAdmin";
import { SkillsAdmin } from "../components/admin/SkillsAdmin";
import { BlogAdmin } from "../components/admin/BlogAdmin";
import { AboutAdmin } from "../components/admin/AboutAdmin";
import { VisionAdmin } from "../components/admin/VisionAdmin";
import { RecommendationsAdmin } from "../components/admin/RecommendationsAdmin";

export function Admin() {
  const navigate = useNavigate();
  const {
    meta,
    loading,
    error,
    statusMessage,
    sites,
    activeSite,
    selectSite,
    createSite,
    publishSite,
    connectCustomDomain,
    verifyCustomDomain,
    disconnectCustomDomain,
    publishing,
  } = useData();
  const {
    isConfigured,
    isEmailVerificationConfigured,
    isVercelDomainIntegrationConfigured,
    loading: authLoading,
    session,
    user,
    signOut,
  } = useAuth();
  const [siteForm, setSiteForm] = useState({ name: "", slug: "" });
  const [domainFormValue, setDomainFormValue] = useState("");
  const [activeTab, setActiveTab] = useState<
    "site" | "projects" | "skills" | "blog" | "recommendations" | "about" | "vision"
  >("site");

  const tabs = [
    { id: "site" as const, label: "Site" },
    { id: "projects" as const, label: "Projects" },
    { id: "skills" as const, label: "Skills" },
    { id: "blog" as const, label: "Blog" },
    { id: "recommendations" as const, label: "Feedback" },
    { id: "about" as const, label: "About" },
    { id: "vision" as const, label: "Vision" },
  ];

  const canEdit = Boolean(session) && meta.canPersist && Boolean(activeSite);
  const showWarnings = !loading && !authLoading;

  useEffect(() => {
    setDomainFormValue(activeSite?.customDomain ?? "");
  }, [activeSite?.customDomain]);

  const handleCreateSite = async (event: React.FormEvent) => {
    event.preventDefault();
    const result = await createSite(siteForm);

    if (result.success) {
      setSiteForm({ name: "", slug: "" });
    }
  };

  const handlePublish = async () => {
    const result = await publishSite();

    if (result.success && result.publicUrl) {
      window.open(result.publicUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleOpenPublicSite = (url?: string | null) => {
    const nextUrl = url || activeSite?.publicUrl || "/";

    if (/^https?:\/\//i.test(nextUrl)) {
      window.location.assign(nextUrl);
      return;
    }

    navigate(nextUrl);
  };

  const handleConnectDomain = async (event: React.FormEvent) => {
    event.preventDefault();
    await connectCustomDomain(domainFormValue);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 min-h-20 py-4">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleOpenPublicSite(activeSite?.publicUrl || "/")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted text-foreground hover:bg-accent transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Site
              </motion.button>

                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    Site Builder
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    MongoDB accounts, site drafts, and one-click publishing
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
                    {canEdit ? "Draft editing enabled" : "Choose a site to start editing"}
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
        {session ? (
          <div className="rounded-3xl border border-border bg-card p-6">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <div className="grid gap-3">
                <p className="text-sm font-medium text-muted-foreground">
                  Active workspace
                </p>
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                  <select
                    value={activeSite?.id ?? ""}
                    onChange={(event) => selectSite(event.target.value)}
                    className="min-w-[260px] rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none theme-accent-field"
                  >
                    <option value="">Select a site</option>
                    {sites.map((site) => (
                      <option key={site.id} value={site.id}>
                        {site.name} ({site.slug})
                      </option>
                    ))}
                  </select>

                  {activeSite ? (
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span className="rounded-full border border-border px-3 py-1">
                        {activeSite.status === "published" ? "Published" : "Draft"}
                      </span>
                      <a
                        href={activeSite.publicUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 theme-accent-text"
                      >
                        Open live URL
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={!canEdit || publishing}
                  className="inline-flex items-center gap-2 rounded-xl px-5 py-3 theme-accent-button disabled:opacity-60"
                >
                  <Rocket className="h-4 w-4" />
                  {publishing ? "Publishing..." : "Publish Site"}
                </button>
              </div>
            </div>

            <form
              onSubmit={handleCreateSite}
              className="mt-6 grid gap-3 rounded-2xl border border-border bg-background/60 p-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto]"
            >
              <input
                type="text"
                value={siteForm.name}
                onChange={(event) =>
                  setSiteForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="New site name"
                className="rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none theme-accent-field"
                required
              />
              <input
                type="text"
                value={siteForm.slug}
                onChange={(event) =>
                  setSiteForm((current) => ({
                    ...current,
                    slug: event.target.value,
                  }))
                }
                placeholder="Optional slug (jane-portfolio)"
                className="rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none theme-accent-field"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-5 py-3 text-foreground hover:bg-accent transition-colors"
              >
                <Plus className="h-4 w-4" />
                Create Site
              </button>
            </form>

            {activeSite ? (
              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Public URL: {activeSite.publicUrl}
                </span>
              </div>
            ) : null}

            {activeSite ? (
              <div className="mt-6 rounded-2xl border border-border bg-background/60 p-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">
                      Domain routing
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Subdomain route: <span className="font-mono">{activeSite.subdomainUrl}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Current live URL: <span className="font-mono">{activeSite.publicUrl}</span>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full border border-border px-3 py-1 text-muted-foreground">
                      Custom domain: {activeSite.customDomainStatus}
                    </span>
                    {!isVercelDomainIntegrationConfigured ? (
                      <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-amber-700 dark:text-amber-300">
                        Vercel API not configured
                      </span>
                    ) : null}
                  </div>
                </div>

                <form
                  onSubmit={handleConnectDomain}
                  className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto_auto]"
                >
                  <input
                    type="text"
                    value={domainFormValue}
                    onChange={(event) => setDomainFormValue(event.target.value)}
                    placeholder="clientdomain.com"
                    className="rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none theme-accent-field"
                  />
                  <button
                    type="submit"
                    disabled={!canEdit || publishing}
                    className="inline-flex items-center justify-center rounded-xl border border-border px-4 py-3 text-foreground transition-colors hover:bg-accent disabled:opacity-60"
                  >
                    Connect Domain
                  </button>
                  <button
                    type="button"
                    onClick={() => void verifyCustomDomain()}
                    disabled={!canEdit || publishing || !activeSite.customDomain}
                    className="inline-flex items-center justify-center rounded-xl border border-border px-4 py-3 text-foreground transition-colors hover:bg-accent disabled:opacity-60"
                  >
                    Verify DNS
                  </button>
                  <button
                    type="button"
                    onClick={() => void disconnectCustomDomain()}
                    disabled={!canEdit || publishing || !activeSite.customDomain}
                    className="inline-flex items-center justify-center rounded-xl border border-border px-4 py-3 text-foreground transition-colors hover:bg-accent disabled:opacity-60"
                  >
                    Remove
                  </button>
                </form>

                {activeSite.customDomainError ? (
                  <p className="mt-3 text-sm text-amber-700 dark:text-amber-300">
                    {activeSite.customDomainError}
                  </p>
                ) : null}

                {activeSite.customDomainVerification.length > 0 ? (
                  <div className="mt-4 grid gap-3">
                    {activeSite.customDomainVerification.map((challenge) => (
                      <div
                        key={`${challenge.type}-${challenge.domain}-${challenge.value}`}
                        className="rounded-xl border border-border bg-card p-4 text-sm"
                      >
                        <p className="font-medium text-foreground">
                          {challenge.type} record
                        </p>
                        <p className="mt-1 text-muted-foreground">
                          Host: <span className="font-mono">{challenge.domain}</span>
                        </p>
                        <p className="mt-1 text-muted-foreground">
                          Value: <span className="font-mono break-all">{challenge.value}</span>
                        </p>
                        {challenge.reason ? (
                          <p className="mt-2 text-xs text-muted-foreground">
                            {challenge.reason}
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}

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

          {showWarnings && session && !meta.isMongoConfigured ? (
            <div className="p-5 rounded-xl bg-card border border-amber-500/30 text-amber-700 dark:text-amber-300">
              MongoDB is not configured yet. Set `MONGODB_URI` and
              `MONGODB_DB_NAME` to persist admin edits remotely.
            </div>
          ) : null}

          {showWarnings && !isConfigured ? (
            <div className="p-5 rounded-xl bg-card border border-amber-500/30 text-amber-700 dark:text-amber-300">
              The account system is not ready yet. Set `JWT_SECRET` alongside
              your MongoDB environment variables before enabling sign up and sign in.
            </div>
          ) : null}

          {showWarnings && isConfigured && !isEmailVerificationConfigured ? (
            <div className="p-5 rounded-xl bg-card border border-amber-500/30 text-amber-700 dark:text-amber-300">
              New account signup now requires email verification. Add
              `RESEND_API_KEY`, `EMAIL_FROM_ADDRESS`, and `PUBLIC_APP_URL` to
              enable registration emails.
            </div>
          ) : null}

          {showWarnings && session && !meta.isStorageConfigured ? (
            <div className="p-5 rounded-xl bg-card border border-amber-500/30 text-amber-700 dark:text-amber-300">
              Supabase Storage uploads are not configured yet. Add
              `SUPABASE_SERVICE_ROLE_KEY` and `SUPABASE_STORAGE_BUCKET` before
              uploading profile or blog images from admin.
            </div>
          ) : null}
        </div>

        {!session ? (
          <div className="rounded-[2rem] border border-border bg-card p-8">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_auto] lg:items-center">
              <div className="space-y-3">
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  Workspace Access
                </p>
                <h2 className="text-3xl font-semibold text-foreground">
                  Sign in from a dedicated page before editing your sites.
                </h2>
                <p className="max-w-2xl text-muted-foreground">
                  Your account pages are now separate from the builder so the admin
                  area no longer starts with inline auth forms. Once you sign in,
                  you can create sites, save drafts, and publish live versions from here.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-xl px-5 py-3 theme-accent-button"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center rounded-xl border border-border px-5 py-3 text-foreground transition-colors hover:bg-accent"
                >
                  Create Account
                </Link>
              </div>
            </div>
          </div>
        ) : null}

        {session ? (
          <div className={!canEdit ? "opacity-80" : ""}>
            {activeTab === "site" && <SiteAdmin canEdit={canEdit} />}
            {activeTab === "projects" && <ProjectsAdmin canEdit={canEdit} />}
            {activeTab === "skills" && <SkillsAdmin canEdit={canEdit} />}
            {activeTab === "blog" && <BlogAdmin canEdit={canEdit} />}
            {activeTab === "recommendations" && (
              <RecommendationsAdmin canEdit={canEdit} />
            )}
            {activeTab === "about" && <AboutAdmin canEdit={canEdit} />}
            {activeTab === "vision" && <VisionAdmin canEdit={canEdit} />}
          </div>
        ) : null}
      </div>
    </div>
  );
}
