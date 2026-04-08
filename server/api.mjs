import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  describeMongoConnectionError,
  getPortfolioContentRecord,
  isMongoConfigured,
  savePortfolioContent,
} from "./content-store.mjs";
import { isSupabaseConfigured, verifyAccessToken } from "./supabase-auth.mjs";
import {
  isSupabaseStorageConfigured,
  normalizePortfolioStorageContent,
  resolvePortfolioStorageContent,
  resolveStorageAssetValue,
  uploadImageAsset,
} from "./supabase-storage.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

loadEnvironmentFile(".env");
loadEnvironmentFile(".env.local");

function loadEnvironmentFile(fileName) {
  const filePath = path.join(projectRoot, fileName);

  try {
    const raw = readFileSync(filePath, "utf8");
    const lines = raw.split(/\r?\n/);

    for (const line of lines) {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      const separatorIndex = trimmed.indexOf("=");

      if (separatorIndex === -1) {
        continue;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed
        .slice(separatorIndex + 1)
        .trim()
        .replace(/^['"]|['"]$/g, "");

      process.env[key] = value;
    }
  } catch {
    // Environment files are optional for local development.
  }
}

export function setCorsHeaders(response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
}

function sendJson(response, statusCode, payload) {
  setCorsHeaders(response);
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(payload));
}

function getRequestHeader(request, name) {
  const headerName = name.toLowerCase();

  if (typeof request.headers?.get === "function") {
    return request.headers.get(headerName);
  }

  const value = request.headers?.[headerName] ?? request.headers?.[name];

  if (Array.isArray(value)) {
    return value.join(", ");
  }

  return typeof value === "string" ? value : null;
}

function getRequestPathname(request) {
  const rawUrl = typeof request.url === "string" && request.url ? request.url : "/";
  const host = getRequestHeader(request, "host") ?? "localhost";

  try {
    return new URL(rawUrl, `http://${host}`).pathname;
  } catch {
    return "/";
  }
}

async function readJsonBody(request, maxBytes = 1024 * 1024) {
  if (request.body != null) {
    if (Buffer.isBuffer(request.body)) {
      const raw = request.body.toString("utf8");
      return raw ? JSON.parse(raw) : {};
    }

    if (request.body instanceof Uint8Array) {
      const raw = Buffer.from(request.body).toString("utf8");
      return raw ? JSON.parse(raw) : {};
    }

    if (typeof request.body === "string") {
      return request.body ? JSON.parse(request.body) : {};
    }

    if (
      typeof request.body === "object" &&
      typeof request.body.getReader !== "function"
    ) {
      return request.body;
    }
  }

  if (typeof request.json === "function") {
    return (await request.json()) ?? {};
  }

  if (typeof request[Symbol.asyncIterator] !== "function") {
    return {};
  }

  const chunks = [];
  let totalBytes = 0;

  for await (const chunk of request) {
    const bufferChunk = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    totalBytes += bufferChunk.length;

    if (totalBytes > maxBytes) {
      const error = new Error("Request body is too large.");
      error.statusCode = 413;
      throw error;
    }

    chunks.push(bufferChunk);
  }

  const raw = Buffer.concat(chunks).toString("utf8");

  if (!raw) {
    return {};
  }

  return JSON.parse(raw);
}

async function getRequestUser(request) {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const authorization = getRequestHeader(request, "authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  const token = authorization.slice("Bearer ".length).trim();

  try {
    return await verifyAccessToken(token);
  } catch (error) {
    console.error("Failed to verify Supabase access token.", error);
    return null;
  }
}

function buildContentMeta(record) {
  return {
    source: record.source,
    updatedAt: record.updatedAt,
    updatedBy: record.updatedBy,
    isMongoConfigured: isMongoConfigured(),
    isSupabaseConfigured: isSupabaseConfigured(),
    isStorageConfigured: isSupabaseStorageConfigured(),
    canPersist: isMongoConfigured() && isSupabaseConfigured(),
  };
}

function getContentForAudience(content, includePendingRecommendations) {
  if (includePendingRecommendations) {
    return content;
  }

  return {
    ...content,
    recommendations: {
      ...content.recommendations,
      items: content.recommendations.items.filter(
        (item) => item.status === "approved",
      ),
    },
  };
}

async function getContentForResponse(content) {
  try {
    return await resolvePortfolioStorageContent(content);
  } catch (error) {
    console.error("Failed to resolve storage-backed content.", error);
    return content;
  }
}

async function handleContentGet(request, response) {
  const record = await getPortfolioContentRecord();
  const user = await getRequestUser(request);
  const content = await getContentForResponse(
    getContentForAudience(record.content, Boolean(user)),
  );

  sendJson(response, 200, {
    content,
    meta: buildContentMeta(record),
  });
}

async function handleContentPut(request, response) {
  if (!isSupabaseConfigured()) {
    sendJson(response, 503, {
      message: "Supabase is not configured. Admin authentication is unavailable.",
    });
    return;
  }

  if (!isMongoConfigured()) {
    sendJson(response, 503, {
      message: "MongoDB is not configured. Remote content persistence is unavailable.",
    });
    return;
  }

  const user = await getRequestUser(request);

  if (!user) {
    sendJson(response, 401, {
      message: "Sign in to save changes.",
    });
    return;
  }

  let body;

  try {
    body = await readJsonBody(request);
  } catch (error) {
    const statusCode =
      error instanceof Error && "statusCode" in error && error.statusCode === 413
        ? 413
        : 400;

    sendJson(response, statusCode, {
      message:
        error instanceof Error && "statusCode" in error && error.statusCode === 413
          ? "Request body is too large."
          : "Request body must be valid JSON.",
    });
    return;
  }

  try {
    const normalizedContent = normalizePortfolioStorageContent(body?.content ?? {});
    const record = await savePortfolioContent(
      normalizedContent,
      user.email ?? user.id,
    );
    const content = await getContentForResponse(record.content);

    sendJson(response, 200, {
      message: "Portfolio content saved successfully.",
      content,
      meta: buildContentMeta(record),
    });
  } catch (error) {
    const message =
      error instanceof Error && error.message.includes("MongoDB")
        ? describeMongoConnectionError(error)
        : error instanceof Error
          ? error.message
          : "Failed to save portfolio content.";

    sendJson(response, 500, { message });
  }
}

function readTrimmedString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function validateRecommendationPayload(body) {
  const name = readTrimmedString(body?.name);
  const role = readTrimmedString(body?.role);
  const company = readTrimmedString(body?.company);
  const text = readTrimmedString(body?.text);
  const photoAlt = readTrimmedString(body?.photoAlt) || `Photo of ${name}`;

  if (name.length < 2) {
    return { error: "Name must be at least 2 characters long." };
  }

  if (role.length < 2) {
    return { error: "Role must be at least 2 characters long." };
  }

  if (text.length < 24) {
    return { error: "Feedback should be at least 24 characters long." };
  }

  if (text.length > 1200) {
    return { error: "Feedback must be 1200 characters or fewer." };
  }

  if (!body?.photo || typeof body.photo !== "object") {
    return { error: "A small profile photo is required." };
  }

  const contentType = readTrimmedString(body.photo.contentType);
  const data = typeof body.photo.data === "string" ? body.photo.data.trim() : "";
  const fileName = readTrimmedString(body.photo.fileName);

  if (!contentType.startsWith("image/")) {
    return { error: "Only image uploads are supported for recommendation photos." };
  }

  if (!data) {
    return { error: "Recommendation photo data is missing." };
  }

  return {
    payload: {
      name,
      role,
      company,
      text,
      photoAlt,
      contentType,
      data,
      fileName,
    },
  };
}

async function handleRecommendationPost(request, response) {
  if (!isMongoConfigured()) {
    sendJson(response, 503, {
      message:
        "Recommendation submissions are unavailable until MongoDB is configured.",
    });
    return;
  }

  if (!isSupabaseStorageConfigured()) {
    sendJson(response, 503, {
      message:
        "Recommendation submissions are unavailable until image storage is configured.",
    });
    return;
  }

  let body;

  try {
    body = await readJsonBody(request, 8 * 1024 * 1024);
  } catch (error) {
    const statusCode =
      error instanceof Error && "statusCode" in error && error.statusCode === 413
        ? 413
        : 400;

    sendJson(response, statusCode, {
      message:
        error instanceof Error && "statusCode" in error && error.statusCode === 413
          ? "Recommendation payload is too large."
          : "Request body must be valid JSON.",
    });
    return;
  }

  const validation = validateRecommendationPayload(body);

  if ("error" in validation) {
    sendJson(response, 400, { message: validation.error });
    return;
  }

  const buffer = Buffer.from(validation.payload.data, "base64");

  if (!buffer.length) {
    sendJson(response, 400, {
      message: "Uploaded recommendation photo is empty.",
    });
    return;
  }

  if (buffer.length > 3 * 1024 * 1024) {
    sendJson(response, 400, {
      message: "Recommendation photos must be 3MB or smaller.",
    });
    return;
  }

  try {
    const asset = await uploadImageAsset({
      buffer,
      contentType: validation.payload.contentType,
      fileName: validation.payload.fileName,
      folder: "recommendation-photos",
    });

    const record = await getPortfolioContentRecord();
    const nextRecommendation = {
      id: `recommendation-${randomUUID()}`,
      name: validation.payload.name,
      role: validation.payload.role,
      company: validation.payload.company,
      photoUrl: asset.reference,
      photoAlt: validation.payload.photoAlt,
      text: validation.payload.text,
      createdAt: new Date().toISOString(),
      featured: false,
      status: "pending",
    };

    const nextContent = {
      ...record.content,
      recommendations: {
        ...record.content.recommendations,
        items: [nextRecommendation, ...record.content.recommendations.items],
      },
    };

    const savedRecord = await savePortfolioContent(nextContent, "public-submission");
    const content = await getContentForResponse(
      getContentForAudience(savedRecord.content, false),
    );

    sendJson(response, 201, {
      message:
        "Thanks for sharing your feedback. It has been submitted for review.",
      content,
      meta: buildContentMeta(savedRecord),
    });
  } catch (error) {
    sendJson(response, 500, {
      message:
        error instanceof Error
          ? error.message
          : "Failed to submit recommendation feedback.",
    });
  }
}

async function handleUploadPost(request, response) {
  if (!isSupabaseConfigured()) {
    sendJson(response, 503, {
      message: "Supabase auth is not configured. Admin uploads are unavailable.",
    });
    return;
  }

  if (!isSupabaseStorageConfigured()) {
    sendJson(response, 503, {
      message:
        "Supabase Storage is not configured. Set SUPABASE_SERVICE_ROLE_KEY and SUPABASE_STORAGE_BUCKET before uploading images.",
    });
    return;
  }

  const user = await getRequestUser(request);

  if (!user) {
    sendJson(response, 401, {
      message: "Sign in to upload images.",
    });
    return;
  }

  let body;

  try {
    body = await readJsonBody(request, 8 * 1024 * 1024);
  } catch (error) {
    const statusCode =
      error instanceof Error && "statusCode" in error && error.statusCode === 413
        ? 413
        : 400;

    sendJson(response, statusCode, {
      message:
        error instanceof Error && "statusCode" in error && error.statusCode === 413
          ? "Upload payload is too large."
          : "Request body must be valid JSON.",
    });
    return;
  }

  const folderByType = {
    blog: "blog-images",
    profile: "profile-images",
    project: "project-images",
  };

  const type = body?.type;
  const folder = folderByType[type];

  if (!folder) {
    sendJson(response, 400, {
      message: "Upload type must be either `profile` or `blog`.",
    });
    return;
  }

  if (typeof body?.data !== "string" || !body.data.trim()) {
    sendJson(response, 400, {
      message: "Upload payload must include base64 image data.",
    });
    return;
  }

  if (typeof body?.contentType !== "string" || !body.contentType.startsWith("image/")) {
    sendJson(response, 400, {
      message: "Only image uploads are supported.",
    });
    return;
  }

  const buffer = Buffer.from(body.data, "base64");

  if (!buffer.length) {
    sendJson(response, 400, {
      message: "Uploaded image is empty.",
    });
    return;
  }

  if (buffer.length > 5 * 1024 * 1024) {
    sendJson(response, 400, {
      message: "Images must be 5MB or smaller.",
    });
    return;
  }

  try {
    const asset = await uploadImageAsset({
      buffer,
      contentType: body.contentType,
      fileName: body.fileName,
      folder,
    });
    const url = await resolveStorageAssetValue(asset.reference).catch(() => asset.publicUrl);

    sendJson(response, 200, {
      message: "Image uploaded successfully.",
      url,
      path: asset.objectPath,
      bucket: asset.bucket,
      reference: asset.reference,
    });
  } catch (error) {
    sendJson(response, 500, {
      message:
        error instanceof Error ? error.message : "Failed to upload image.",
    });
  }
}

export async function handleApiRequest(request, response, pathname = null) {
  const resolvedPathname = pathname ?? getRequestPathname(request);

  if (!resolvedPathname.startsWith("/api/")) {
    return false;
  }

  if (request.method === "OPTIONS") {
    setCorsHeaders(response);
    response.writeHead(204);
    response.end();
    return true;
  }

  try {
    if (resolvedPathname === "/api/content" && request.method === "GET") {
      await handleContentGet(request, response);
      return true;
    }

    if (resolvedPathname === "/api/content" && request.method === "PUT") {
      await handleContentPut(request, response);
      return true;
    }

    if (resolvedPathname === "/api/uploads" && request.method === "POST") {
      await handleUploadPost(request, response);
      return true;
    }

    if (resolvedPathname === "/api/recommendations" && request.method === "POST") {
      await handleRecommendationPost(request, response);
      return true;
    }

    sendJson(response, 404, {
      message: "API route not found.",
    });
  } catch (error) {
    console.error("Unhandled API route error.", error);
    sendJson(response, 500, {
      message: "An unexpected server error occurred.",
    });
  }

  return true;
}
