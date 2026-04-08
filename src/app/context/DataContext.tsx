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
  type ContentMeta,
  type PortfolioContent,
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
    type: "profile" | "blog",
    successMessage?: string,
  ) => Promise<UploadResult>;
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
      const response = await fetch("/api/content");
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
  }, []);

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
    type: "profile" | "blog",
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

  return (
    <DataContext.Provider
      value={{
        content,
        meta,
        loading,
        saving,
        uploading,
        error,
        statusMessage,
        clearStatusMessage: () => setStatusMessage(null),
        refreshContent,
        saveContent,
        uploadAsset,
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
