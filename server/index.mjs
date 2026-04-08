import { createServer } from "node:http";
import { promises as fs, readFileSync } from "node:fs";
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
const distDir = path.join(projectRoot, "dist");

loadEnvironmentFile(".env");
loadEnvironmentFile(".env.local");

const port = Number(process.env.PORT || 3001);

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

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

function setCorsHeaders(response) {
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

async function readJsonBody(request, maxBytes = 1024 * 1024) {
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
  const authorization = request.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  const token = authorization.slice("Bearer ".length).trim();
  return verifyAccessToken(token);
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

async function getContentForResponse(content) {
  try {
    return await resolvePortfolioStorageContent(content);
  } catch (error) {
    console.error("Failed to resolve storage-backed content.", error);
    return content;
  }
}

async function handleContentGet(response) {
  const record = await getPortfolioContentRecord();
  const content = await getContentForResponse(record.content);

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

async function serveStaticAsset(response, pathname) {
  const safePath = pathname === "/" ? "/index.html" : pathname;
  const assetPath = path.join(distDir, safePath);

  try {
    const stat = await fs.stat(assetPath);

    if (stat.isDirectory()) {
      throw new Error("Directories are not served directly.");
    }

    const file = await fs.readFile(assetPath);
    const extension = path.extname(assetPath);
    response.writeHead(200, {
      "Content-Type": mimeTypes[extension] ?? "application/octet-stream",
    });
    response.end(file);
    return true;
  } catch {
    return false;
  }
}

async function serveSpaFallback(response) {
  try {
    const indexHtml = await fs.readFile(path.join(distDir, "index.html"));
    response.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8",
    });
    response.end(indexHtml);
  } catch {
    response.writeHead(404, {
      "Content-Type": "text/plain; charset=utf-8",
    });
    response.end("Backend is running, but the frontend build is missing.");
  }
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host}`);
  const pathname = url.pathname;

  if (request.method === "OPTIONS") {
    setCorsHeaders(response);
    response.writeHead(204);
    response.end();
    return;
  }

  if (pathname === "/api/content" && request.method === "GET") {
    await handleContentGet(response);
    return;
  }

  if (pathname === "/api/content" && request.method === "PUT") {
    await handleContentPut(request, response);
    return;
  }

  if (pathname === "/api/uploads" && request.method === "POST") {
    await handleUploadPost(request, response);
    return;
  }

  if (pathname.startsWith("/api/")) {
    sendJson(response, 404, {
      message: "API route not found.",
    });
    return;
  }

  if (await serveStaticAsset(response, pathname)) {
    return;
  }

  await serveSpaFallback(response);
});

server.listen(port, () => {
  console.log(`Portfolio backend running on http://localhost:${port}`);
});
