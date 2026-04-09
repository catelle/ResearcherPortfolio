import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import {
  defaultContentMeta,
  getDefaultPortfolioContent,
  getLocalizedText,
  type ContentMeta,
  type PortfolioContent,
  type PortfolioSiteSummary,
  type RecommendationSubmissionInput,
  type SaveResult,
  type UploadResult,
} from "../lib/portfolio-content";

interface ContentResponse {
  content?: PortfolioContent;
  meta?: ContentMeta;
  message?: string;
}

interface SitesResponse {
  sites?: PortfolioSiteSummary[];
  site?: PortfolioSiteSummary;
  message?: string;
  publicUrl?: string | null;
  publishedAt?: string | null;
  config?: Partial<ContentMeta>;
}

interface LoadedSitesResult {
  sites: PortfolioSiteSummary[];
  config: Partial<ContentMeta> | null;
}

interface CreateSiteInput {
  name: string;
  slug: string;
}

interface PublishSiteResult extends SaveResult {
  publicUrl?: string | null;
}

interface SiteDomainResult extends SaveResult {
  site?: PortfolioSiteSummary | null;
}

interface DataContextType {
  content: PortfolioContent;
  meta: ContentMeta;
  sites: PortfolioSiteSummary[];
  activeSite: PortfolioSiteSummary | null;
  loading: boolean;
  saving: boolean;
  uploading: boolean;
  submittingRecommendation: boolean;
  publishing: boolean;
  error: string | null;
  statusMessage: string | null;
  clearStatusMessage: () => void;
  refreshContent: () => Promise<void>;
  selectSite: (siteId: string) => void;
  createSite: (input: CreateSiteInput) => Promise<SaveResult>;
  publishSite: () => Promise<PublishSiteResult>;
  connectCustomDomain: (domain: string) => Promise<SiteDomainResult>;
  verifyCustomDomain: () => Promise<SiteDomainResult>;
  disconnectCustomDomain: () => Promise<SiteDomainResult>;
  saveContent: (
    updater: (current: PortfolioContent) => PortfolioContent,
    successMessage?: string,
  ) => Promise<SaveResult>;
  uploadAsset: (
    file: File,
    type: "profile" | "project" | "blog",
    successMessage?: string,
  ) => Promise<UploadResult>;
  submitRecommendation: (
    input: RecommendationSubmissionInput & {
      photoFile: File | null;
    },
    successMessage?: string,
  ) => Promise<SaveResult>;
}

const ACTIVE_SITE_STORAGE_KEY = "portfolio-active-site-id";
const DataContext = createContext<DataContextType | undefined>(undefined);

function mergePlatformMeta(
  current: ContentMeta,
  config?: Partial<ContentMeta> | null,
): ContentMeta {
  return {
    ...current,
    isMongoConfigured: config?.isMongoConfigured ?? current.isMongoConfigured,
    isAuthConfigured: config?.isAuthConfigured ?? current.isAuthConfigured,
    isStorageConfigured:
      config?.isStorageConfigured ?? current.isStorageConfigured,
    canPersist: config?.canPersist ?? current.canPersist,
  };
}

function readStoredActiveSiteId() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem(ACTIVE_SITE_STORAGE_KEY) ?? "";
}

function writeStoredActiveSiteId(value: string) {
  if (typeof window === "undefined") {
    return;
  }

  if (!value) {
    window.localStorage.removeItem(ACTIVE_SITE_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(ACTIVE_SITE_STORAGE_KEY, value);
}

export function DataProvider({
  children,
  mode = "public",
  siteSlug = null,
}: {
  children: ReactNode;
  mode?: "public" | "admin";
  siteSlug?: string | null;
}) {
  const { session } = useAuth();
  const [content, setContent] = useState<PortfolioContent>(() =>
    getDefaultPortfolioContent(),
  );
  const [meta, setMeta] = useState<ContentMeta>(defaultContentMeta);
  const [sites, setSites] = useState<PortfolioSiteSummary[]>([]);
  const [activeSiteId, setActiveSiteId] = useState(() => readStoredActiveSiteId());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submittingRecommendation, setSubmittingRecommendation] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const activeSite =
    mode === "admin"
      ? sites.find((item) => item.id === activeSiteId) ?? null
      : meta.site;

  const readFileAsBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        if (typeof reader.result !== "string") {
          reject(new Error("Failed to read the selected file."));
          return;
        }

        const [, base64 = ""] = reader.result.split(",", 2);
        resolve(base64);
      };

      reader.onerror = () => {
        reject(new Error("Failed to read the selected file."));
      };

      reader.readAsDataURL(file);
    });

  useEffect(() => {
    if (!statusMessage) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setStatusMessage(null);
    }, 4000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [statusMessage]);

  useEffect(() => {
    if (mode !== "admin") {
      return;
    }

    if (!activeSiteId && sites.length > 0) {
      const storedId = readStoredActiveSiteId();
      const fallbackId =
        sites.find((item) => item.id === storedId)?.id ?? sites[0]?.id ?? "";

      if (fallbackId) {
        setActiveSiteId(fallbackId);
        writeStoredActiveSiteId(fallbackId);
      }
    }
  }, [mode, activeSiteId, sites]);

  const loadPlatformMeta = async () => {
    const response = await fetch("/api/content");
    const payload = (await response.json()) as ContentResponse;

    if (!response.ok) {
      throw new Error(payload.message || "Unable to inspect backend configuration.");
    }

    return payload.meta ?? defaultContentMeta;
  };

  const loadSites = async (): Promise<LoadedSitesResult> => {
    if (mode !== "admin" || !session?.access_token) {
      return {
        sites: [],
        config: null,
      };
    }

    const response = await fetch("/api/sites", {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });
    const payload = (await response.json()) as SitesResponse;

    if (!response.ok) {
      throw new Error(payload.message || "Unable to load your sites.");
    }

    const nextSites = payload.sites ?? [];
    setSites(nextSites);
    setMeta((current) => mergePlatformMeta(current, payload.config));

    const storedId = readStoredActiveSiteId();
    const nextActiveSiteId =
      nextSites.find((item) => item.id === activeSiteId)?.id ||
      nextSites.find((item) => item.id === storedId)?.id ||
      nextSites[0]?.id ||
      "";

    setActiveSiteId(nextActiveSiteId);
    writeStoredActiveSiteId(nextActiveSiteId);

    return {
      sites: nextSites,
      config: payload.config ?? null,
    };
  };

  const refreshContent = async () => {
    setLoading(true);

    try {
      if (mode === "admin") {
        if (!session?.access_token) {
          const platformMeta = await loadPlatformMeta();

          setSites([]);
          setActiveSiteId("");
          writeStoredActiveSiteId("");
          setContent(getDefaultPortfolioContent());
          setMeta(platformMeta);
          setError(null);
          setLoading(false);
          return;
        }

        const { sites: loadedSites, config } = await loadSites();
        const targetSiteId =
          loadedSites.find((item) => item.id === activeSiteId)?.id ??
          readStoredActiveSiteId() ??
          loadedSites[0]?.id ??
          "";

        if (!targetSiteId) {
          setContent(getDefaultPortfolioContent());
          setMeta(mergePlatformMeta(defaultContentMeta, config));
          setError(null);
          return;
        }

        const response = await fetch(`/api/content?siteId=${encodeURIComponent(targetSiteId)}`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        const payload = (await response.json()) as ContentResponse;

        if (!response.ok) {
          throw new Error(payload.message || "Unable to load site content.");
        }

        setContent(payload.content ?? getDefaultPortfolioContent());
        setMeta(mergePlatformMeta(payload.meta ?? defaultContentMeta, config));
        setError(null);
        return;
      }

      const query = siteSlug
        ? `?siteSlug=${encodeURIComponent(siteSlug)}`
        : "";
      const response = await fetch(`/api/content${query}`);
      const payload = (await response.json()) as ContentResponse;

      if (!response.ok) {
        throw new Error(payload.message || "Unable to load portfolio content.");
      }

      setContent(payload.content ?? getDefaultPortfolioContent());
      setMeta(payload.meta ?? defaultContentMeta);
      setError(null);
    } catch (nextError) {
      const message =
        nextError instanceof Error
          ? nextError.message
          : "Unable to reach the portfolio backend. Start `npm run dev:server` to enable remote content.";

      setContent(getDefaultPortfolioContent());
      setMeta((current) =>
        mode === "admin"
          ? mergePlatformMeta(defaultContentMeta, current)
          : defaultContentMeta,
      );
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshContent();
  }, [mode, siteSlug, session?.access_token, activeSiteId]);

  const createSite = async (input: CreateSiteInput): Promise<SaveResult> => {
    if (!session?.access_token) {
      return {
        success: false,
        message: "Sign in before creating a site.",
      };
    }

    try {
      const response = await fetch("/api/sites", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });
      const payload = (await response.json()) as SitesResponse;

      if (!response.ok || !payload.site) {
        throw new Error(payload.message || "Unable to create the site.");
      }

      const nextSites = [payload.site, ...sites];
      setSites(nextSites);
      setActiveSiteId(payload.site.id);
      writeStoredActiveSiteId(payload.site.id);
      setStatusMessage(payload.message || "Site created successfully.");
      setError(null);

      return {
        success: true,
        message: payload.message || "Site created successfully.",
      };
    } catch (nextError) {
      const message =
        nextError instanceof Error ? nextError.message : "Unable to create the site.";

      setError(message);

      return {
        success: false,
        message,
      };
    }
  };

  const publishSite = async (): Promise<PublishSiteResult> => {
    if (!session?.access_token || !activeSiteId) {
      return {
        success: false,
        message: "Select a site before publishing.",
      };
    }

    setPublishing(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/sites/publish?siteId=${encodeURIComponent(activeSiteId)}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );
      const payload = (await response.json()) as SitesResponse;

      if (!response.ok) {
        throw new Error(payload.message || "Unable to publish the site.");
      }

      const nextSite = payload.site ?? null;

      if (nextSite) {
        setSites((current) =>
          current.map((item) => (item.id === nextSite.id ? nextSite : item)),
        );
        setMeta((current) => ({
          ...current,
          site: nextSite,
          publishedAt: payload.publishedAt ?? current.publishedAt,
        }));
      }

      setStatusMessage(payload.message || "Site published successfully.");

      return {
        success: true,
        message: payload.message || "Site published successfully.",
        publicUrl: payload.publicUrl ?? null,
      };
    } catch (nextError) {
      const message =
        nextError instanceof Error ? nextError.message : "Unable to publish the site.";

      setError(message);

      return {
        success: false,
        message,
      };
    } finally {
      setPublishing(false);
    }
  };

  const updateSiteInState = (nextSite: PortfolioSiteSummary | null) => {
    if (!nextSite) {
      return;
    }

    setSites((current) =>
      current.map((item) => (item.id === nextSite.id ? nextSite : item)),
    );
    setMeta((current) => ({
      ...current,
      site: nextSite,
    }));
  };

  const connectCustomDomain = async (
    domain: string,
  ): Promise<SiteDomainResult> => {
    if (!session?.access_token || !activeSiteId) {
      return {
        success: false,
        message: "Select a site before connecting a custom domain.",
      };
    }

    setPublishing(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/sites/domain?siteId=${encodeURIComponent(activeSiteId)}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ domain }),
        },
      );
      const payload = (await response.json()) as SitesResponse;

      if (!response.ok) {
        throw new Error(payload.message || "Unable to connect the custom domain.");
      }

      updateSiteInState(payload.site ?? null);
      setStatusMessage(payload.message || "Custom domain updated.");

      return {
        success: true,
        message: payload.message || "Custom domain updated.",
        site: payload.site ?? null,
      };
    } catch (nextError) {
      const message =
        nextError instanceof Error
          ? nextError.message
          : "Unable to connect the custom domain.";

      setError(message);

      return {
        success: false,
        message,
      };
    } finally {
      setPublishing(false);
    }
  };

  const verifyCustomDomain = async (): Promise<SiteDomainResult> => {
    if (!session?.access_token || !activeSiteId) {
      return {
        success: false,
        message: "Select a site before verifying a custom domain.",
      };
    }

    setPublishing(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/sites/domain/verify?siteId=${encodeURIComponent(activeSiteId)}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );
      const payload = (await response.json()) as SitesResponse;

      if (!response.ok) {
        throw new Error(payload.message || "Unable to verify the custom domain.");
      }

      updateSiteInState(payload.site ?? null);
      setStatusMessage(payload.message || "Custom domain verification updated.");

      return {
        success: true,
        message: payload.message || "Custom domain verification updated.",
        site: payload.site ?? null,
      };
    } catch (nextError) {
      const message =
        nextError instanceof Error
          ? nextError.message
          : "Unable to verify the custom domain.";

      setError(message);

      return {
        success: false,
        message,
      };
    } finally {
      setPublishing(false);
    }
  };

  const disconnectCustomDomain = async (): Promise<SiteDomainResult> => {
    if (!session?.access_token || !activeSiteId) {
      return {
        success: false,
        message: "Select a site before removing a custom domain.",
      };
    }

    setPublishing(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/sites/domain?siteId=${encodeURIComponent(activeSiteId)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );
      const payload = (await response.json()) as SitesResponse;

      if (!response.ok) {
        throw new Error(payload.message || "Unable to remove the custom domain.");
      }

      updateSiteInState(payload.site ?? null);
      setStatusMessage(payload.message || "Custom domain removed.");

      return {
        success: true,
        message: payload.message || "Custom domain removed.",
        site: payload.site ?? null,
      };
    } catch (nextError) {
      const message =
        nextError instanceof Error
          ? nextError.message
          : "Unable to remove the custom domain.";

      setError(message);

      return {
        success: false,
        message,
      };
    } finally {
      setPublishing(false);
    }
  };

  const saveContent = async (
    updater: (current: PortfolioContent) => PortfolioContent,
    successMessage = "Changes saved successfully.",
  ): Promise<SaveResult> => {
    if (!session?.access_token) {
      return {
        success: false,
        message: "Sign in before saving changes.",
      };
    }

    if (!activeSiteId) {
      return {
        success: false,
        message: "Create or select a site before saving changes.",
      };
    }

    const nextContent = updater(content);
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/content?siteId=${encodeURIComponent(activeSiteId)}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: nextContent }),
        },
      );

      const payload = (await response.json()) as ContentResponse;

      if (!response.ok) {
        throw new Error(payload.message || "Failed to save portfolio content.");
      }

      setContent(payload.content ?? nextContent);
      setMeta(payload.meta ?? meta);
      setStatusMessage(payload.message || successMessage);

      return {
        success: true,
        message: payload.message || successMessage,
      };
    } catch (nextError) {
      const message =
        nextError instanceof Error
          ? nextError.message
          : "Failed to save portfolio content.";

      setError(message);

      return {
        success: false,
        message,
      };
    } finally {
      setSaving(false);
    }
  };

  const uploadAsset = async (
    file: File,
    type: "profile" | "project" | "blog",
    successMessage = "Image uploaded successfully.",
  ): Promise<UploadResult> => {
    if (!meta.isAuthConfigured) {
      return {
        success: false,
        message:
          "Mongo auth is not configured. Set MONGODB_URI, MONGODB_DB_NAME, and JWT_SECRET before uploading images.",
      };
    }

    if (!meta.isStorageConfigured) {
      return {
        success: false,
        message:
          "Supabase Storage is not configured. Set SUPABASE_SERVICE_ROLE_KEY and SUPABASE_STORAGE_BUCKET before uploading images.",
      };
    }

    if (!session?.access_token) {
      return {
        success: false,
        message: "Sign in before uploading images.",
      };
    }

    if (!activeSiteId) {
      return {
        success: false,
        message: "Select a site before uploading images.",
      };
    }

    setUploading(true);
    setError(null);

    try {
      const data = await readFileAsBase64(file);
      const response = await fetch(
        `/api/uploads?siteId=${encodeURIComponent(activeSiteId)}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contentType: file.type,
            data,
            fileName: file.name,
            type,
          }),
        },
      );

      const payload = (await response.json()) as {
        message?: string;
        path?: string;
        url?: string;
      };

      if (!response.ok) {
        throw new Error(payload.message || "Failed to upload image.");
      }

      setStatusMessage(payload.message || successMessage);

      return {
        success: true,
        message: payload.message || successMessage,
        path: payload.path,
        url: payload.url,
      };
    } catch (nextError) {
      const message =
        nextError instanceof Error ? nextError.message : "Failed to upload image.";

      setError(message);

      return {
        success: false,
        message,
      };
    } finally {
      setUploading(false);
    }
  };

  const submitRecommendation = async (
    input: RecommendationSubmissionInput & {
      photoFile: File | null;
    },
    successMessage = getLocalizedText(content.recommendations.successMessage, "en") ||
      "Thanks for sharing your feedback. It has been submitted for review.",
  ): Promise<SaveResult> => {
    if (!meta.isMongoConfigured) {
      return {
        success: false,
        message:
          "Recommendation submissions are unavailable until MongoDB is configured.",
      };
    }

    if (!meta.isStorageConfigured) {
      return {
        success: false,
        message:
          "Recommendation submissions are unavailable until image storage is configured.",
      };
    }

    if (!input.photoFile) {
      return {
        success: false,
        message: "Add a small profile photo before submitting feedback.",
      };
    }

    const targetSiteSlug = siteSlug || meta.site?.slug;

    if (!targetSiteSlug) {
      return {
        success: false,
        message: "Recommendation submissions are unavailable until the site is published.",
      };
    }

    setSubmittingRecommendation(true);
    setError(null);

    try {
      const data = await readFileAsBase64(input.photoFile);
      const response = await fetch(
        `/api/recommendations?siteSlug=${encodeURIComponent(targetSiteSlug)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: input.name,
            role: input.role,
            company: input.company,
            text: input.text,
            photoAlt: input.photoAlt,
            photo: {
              contentType: input.photoFile.type,
              data,
              fileName: input.photoFile.name,
            },
          }),
        },
      );

      let payload: ContentResponse = {};

      try {
        payload = (await response.json()) as ContentResponse;
      } catch {
        payload = {};
      }

      if (!response.ok) {
        throw new Error(
          payload.message || "Failed to submit recommendation feedback.",
        );
      }

      if (payload.content) {
        setContent(payload.content);
      }

      if (payload.meta) {
        setMeta(payload.meta);
      }

      setStatusMessage(payload.message || successMessage);

      return {
        success: true,
        message: payload.message || successMessage,
      };
    } catch (nextError) {
      const message =
        nextError instanceof TypeError
          ? "Unable to reach the recommendation endpoint. Make sure the backend is running and restarted so the latest `/api/recommendations` route is available."
          : nextError instanceof Error
            ? nextError.message
            : "Failed to submit recommendation feedback.";

      setError(message);

      return {
        success: false,
        message,
      };
    } finally {
      setSubmittingRecommendation(false);
    }
  };

  const value = useMemo(
    () => ({
      content,
      meta,
      sites,
      activeSite,
      loading,
      saving,
      uploading,
      submittingRecommendation,
      publishing,
      error,
      statusMessage,
      clearStatusMessage: () => setStatusMessage(null),
      refreshContent,
      selectSite: (siteId: string) => {
        setActiveSiteId(siteId);
        writeStoredActiveSiteId(siteId);
      },
      createSite,
      publishSite,
      connectCustomDomain,
      verifyCustomDomain,
      disconnectCustomDomain,
      saveContent,
      uploadAsset,
      submitRecommendation,
    }),
    [
      content,
      meta,
      sites,
      activeSite,
      loading,
      saving,
      uploading,
      submittingRecommendation,
      publishing,
      connectCustomDomain,
      createSite,
      disconnectCustomDomain,
      error,
      publishSite,
      refreshContent,
      saveContent,
      statusMessage,
      submitRecommendation,
      verifyCustomDomain,
      uploadAsset,
    ],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);

  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }

  return context;
}
