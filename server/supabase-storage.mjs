import { randomUUID } from "node:crypto";
import path from "node:path";

import { createClient } from "@supabase/supabase-js";

const STORAGE_REFERENCE_PREFIX = "storage://";
const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24 * 7;
const BUCKET_VISIBILITY_CACHE_MS = 60 * 1000;

let cachedBucketVisibility;

function getSupabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? "";
}

function getSupabaseServiceRoleKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
}

function getSupabaseStorageBucket() {
  return process.env.SUPABASE_STORAGE_BUCKET ?? "";
}

function trimLeadingSlashes(value) {
  return value.replace(/^\/+/, "");
}

function trimSearchAndHash(value) {
  return value.split(/[?#]/, 1)[0] ?? value;
}

function decodeStoragePath(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function isSupabaseStorageConfigured() {
  return Boolean(
    getSupabaseUrl() &&
      getSupabaseServiceRoleKey() &&
      getSupabaseStorageBucket(),
  );
}

function getSupabaseStorageClient() {
  if (!isSupabaseStorageConfigured()) {
    return null;
  }

  return createClient(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function isStorageBucketPublic() {
  const bucket = getSupabaseStorageBucket();

  if (!bucket) {
    return false;
  }

  if (
    cachedBucketVisibility &&
    cachedBucketVisibility.bucket === bucket &&
    cachedBucketVisibility.expiresAt > Date.now()
  ) {
    return cachedBucketVisibility.isPublic;
  }

  const client = getSupabaseStorageClient();

  if (!client) {
    return false;
  }

  const { data, error } = await client.storage.listBuckets();

  if (error) {
    throw new Error(error.message || "Failed to inspect Supabase Storage bucket.");
  }

  const bucketInfo = data?.find(
    (item) => item.name === bucket || item.id === bucket,
  );
  const isPublic = Boolean(bucketInfo?.public);

  cachedBucketVisibility = {
    bucket,
    expiresAt: Date.now() + BUCKET_VISIBILITY_CACHE_MS,
    isPublic,
  };

  return isPublic;
}

function extractObjectPathFromReference(value) {
  const bucket = getSupabaseStorageBucket();
  const prefix = `${STORAGE_REFERENCE_PREFIX}${bucket}/`;

  if (!bucket || !value.startsWith(prefix)) {
    return null;
  }

  return trimLeadingSlashes(value.slice(prefix.length));
}

function extractObjectPathFromSupabaseUrl(value) {
  const bucket = getSupabaseStorageBucket();
  const supabaseUrl = getSupabaseUrl();

  if (!bucket || !supabaseUrl) {
    return null;
  }

  const prefixes = [
    `${supabaseUrl}/storage/v1/object/public/${bucket}/`,
    `${supabaseUrl}/storage/v1/object/sign/${bucket}/`,
    `${supabaseUrl}/storage/v1/object/authenticated/${bucket}/`,
  ];

  for (const prefix of prefixes) {
    if (!value.startsWith(prefix)) {
      continue;
    }

    return decodeStoragePath(
      trimLeadingSlashes(trimSearchAndHash(value.slice(prefix.length))),
    );
  }

  return null;
}

export function extractStorageObjectPath(value) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  return (
    extractObjectPathFromReference(trimmed) ??
    extractObjectPathFromSupabaseUrl(trimmed)
  );
}

export function createStorageReference(objectPath) {
  const bucket = getSupabaseStorageBucket();
  const normalizedPath = trimLeadingSlashes(objectPath ?? "");

  if (!bucket || !normalizedPath) {
    return normalizedPath;
  }

  return `${STORAGE_REFERENCE_PREFIX}${bucket}/${normalizedPath}`;
}

export function normalizeStorageAssetValue(value) {
  const objectPath = extractStorageObjectPath(value);

  if (!objectPath) {
    return value;
  }

  return createStorageReference(objectPath);
}

export async function resolveStorageAssetValue(value) {
  const objectPath = extractStorageObjectPath(value);

  if (!objectPath) {
    return value;
  }

  const client = getSupabaseStorageClient();

  if (!client) {
    return value;
  }

  const bucket = getSupabaseStorageBucket();

  if (await isStorageBucketPublic()) {
    const {
      data: { publicUrl },
    } = client.storage.from(bucket).getPublicUrl(objectPath);

    return publicUrl;
  }

  const { data, error } = await client.storage
    .from(bucket)
    .createSignedUrl(objectPath, SIGNED_URL_TTL_SECONDS);

  if (error || !data?.signedUrl) {
    throw new Error(error?.message || "Failed to create a signed image URL.");
  }

  return data.signedUrl;
}

function mapStringValues(value, transform) {
  if (Array.isArray(value)) {
    return value.map((item) => mapStringValues(item, transform));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        mapStringValues(item, transform),
      ]),
    );
  }

  if (typeof value === "string") {
    return transform(value);
  }

  return value;
}

async function mapStringValuesAsync(value, transform) {
  if (Array.isArray(value)) {
    return Promise.all(value.map((item) => mapStringValuesAsync(item, transform)));
  }

  if (value && typeof value === "object") {
    const entries = await Promise.all(
      Object.entries(value).map(async ([key, item]) => [
        key,
        await mapStringValuesAsync(item, transform),
      ]),
    );

    return Object.fromEntries(entries);
  }

  if (typeof value === "string") {
    return transform(value);
  }

  return value;
}

export function normalizePortfolioStorageContent(content) {
  return mapStringValues(content, normalizeStorageAssetValue);
}

export async function resolvePortfolioStorageContent(content) {
  return mapStringValuesAsync(content, async (value) => {
    try {
      return await resolveStorageAssetValue(value);
    } catch (error) {
      console.warn("Unable to resolve a Supabase storage asset URL.", error);
      return value;
    }
  });
}

const extensionByMimeType = {
  "image/gif": ".gif",
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/svg+xml": ".svg",
  "image/webp": ".webp",
};

function sanitizeBaseName(fileName) {
  const parsedName = path.parse(fileName || "image");
  const sanitized = parsedName.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return sanitized || "image";
}

function resolveExtension(fileName, contentType) {
  const fileExtension = path.extname(fileName || "").toLowerCase();

  if (fileExtension) {
    return fileExtension;
  }

  return extensionByMimeType[contentType] ?? "";
}

export async function uploadImageAsset({
  buffer,
  contentType,
  fileName,
  folder,
}) {
  if (!contentType?.startsWith("image/")) {
    throw new Error("Only image uploads are supported.");
  }

  const client = getSupabaseStorageClient();

  if (!client) {
    throw new Error(
      "Supabase Storage is not configured. Set SUPABASE_SERVICE_ROLE_KEY and SUPABASE_STORAGE_BUCKET.",
    );
  }

  const bucket = getSupabaseStorageBucket();
  const safeBaseName = sanitizeBaseName(fileName);
  const extension = resolveExtension(fileName, contentType);
  const objectPath = `${folder}/${Date.now()}-${randomUUID()}-${safeBaseName}${extension}`;

  const { error } = await client.storage.from(bucket).upload(objectPath, buffer, {
    cacheControl: "3600",
    contentType,
    upsert: false,
  });

  if (error) {
    throw new Error(error.message || "Failed to upload image to Supabase Storage.");
  }

  const {
    data: { publicUrl },
  } = client.storage.from(bucket).getPublicUrl(objectPath);

  return {
    bucket,
    objectPath,
    publicUrl,
    reference: createStorageReference(objectPath),
  };
}
