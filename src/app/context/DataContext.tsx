import {
  createContext,
  useContext,
  useEffect,
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
  type RecommendationSubmissionInput,
  type SaveResult,
  type UploadResult,
} from "../lib/portfolio-content";

interface ContentResponse {
  content?: PortfolioContent;
  meta?: ContentMeta;
  message?: string;
}

interface DataContextType {
  content: PortfolioContent;
  meta: ContentMeta;
  loading: boolean;
  saving: boolean;
  uploading: boolean;
  submittingRecommendation: boolean;
  error: string | null;
  statusMessage: string | null;
  clearStatusMessage: () => void;
  refreshContent: () => Promise<void>;
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

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const [content, setContent] = useState<PortfolioContent>(() =>
    getDefaultPortfolioContent(),
  );
  const [meta, setMeta] = useState<ContentMeta>(defaultContentMeta);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submittingRecommendation, setSubmittingRecommendation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

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

  const refreshContent = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/content", {
        headers: session?.access_token
          ? {
              Authorization: `Bearer ${session.access_token}`,
            }
          : undefined,
      });
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
      setMeta(defaultContentMeta);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshContent();
  }, [session?.access_token]);

  const saveContent = async (
    updater: (current: PortfolioContent) => PortfolioContent,
    successMessage = "Changes saved successfully.",
  ): Promise<SaveResult> => {
    if (!meta.isSupabaseConfigured) {
      return {
        success: false,
        message:
          "Supabase is not configured. Set the Supabase env vars before saving from admin.",
      };
    }

    if (!meta.isMongoConfigured) {
      return {
        success: false,
        message:
          "MongoDB is not configured. Set MONGODB_URI and MONGODB_DB_NAME before saving.",
      };
    }

    if (!session?.access_token) {
      return {
        success: false,
        message: "Sign in from the admin page before saving changes.",
      };
    }

    const nextContent = updater(content);
    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/content", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: nextContent }),
      });

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
    if (!meta.isSupabaseConfigured) {
      return {
        success: false,
        message:
          "Supabase is not configured. Set the Supabase env vars before uploading images.",
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
        message: "Sign in from the admin page before uploading images.",
      };
    }

    setUploading(true);
    setError(null);

    try {
      const data = await readFileAsBase64(file);
      const response = await fetch("/api/uploads", {
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
      });

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

    setSubmittingRecommendation(true);
    setError(null);

    try {
      const data = await readFileAsBase64(input.photoFile);
      const response = await fetch("/api/recommendations", {
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
      });

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

  return (
    <DataContext.Provider
      value={{
        content,
        meta,
        loading,
        saving,
        uploading,
        submittingRecommendation,
        error,
        statusMessage,
        clearStatusMessage: () => setStatusMessage(null),
        refreshContent,
        saveContent,
        uploadAsset,
        submitRecommendation,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);

  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }

  return context;
}
