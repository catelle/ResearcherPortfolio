import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  connectPortfolioSiteCustomDomain,
  createPortfolioSite,
  describeMongoConnectionError,
  disconnectPortfolioSiteCustomDomain,
  getPortfolioContentRecord,
  getPortfolioSiteById,
  getPortfolioSiteByResolvedHost,
  getPortfolioSiteBySlug,
  getPortfolioSiteForUser,
  isMongoConfigured,
  listPortfolioSitesForUser,
  publishPortfolioSite,
  savePortfolioContent,
  verifyPortfolioSiteCustomDomain,
} from "./content-store.mjs";
import {
  isAuthConfigured,
  isEmailVerificationConfigured,
  loginUser,
  registerUser,
  resendVerificationEmail,
  verifyEmailAddress,
  verifyAccessToken,
} from "./auth-store.mjs";
import {
  isSupabaseStorageConfigured,
  normalizePortfolioStorageContent,
  resolvePortfolioStorageContent,
  resolveStorageAssetValue,
  uploadImageAsset,
} from "./supabase-storage.mjs";
import { normalizeRequestHost } from "./platform-config.mjs";
import { isVercelDomainIntegrationConfigured } from "./vercel-domains.mjs";

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
  response.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, OPTIONS",
  );
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

function getRequestUrl(request) {
  const rawUrl = typeof request.url === "string" && request.url ? request.url : "/";
  const host = getRequestHeader(request, "host") ?? "localhost";

  return new URL(rawUrl, `http://${host}`);
}

function getNormalizedRequestHost(request) {
  return normalizeRequestHost(getRequestHeader(request, "host") ?? "");
}

function getRequestPathname(request) {
  try {
    return getRequestUrl(request).pathname;
  } catch {
    return "/";
  }
}

function getRequestQueryParam(request, key) {
  try {
    return getRequestUrl(request).searchParams.get(key);
  } catch {
    return null;
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
  if (!isAuthConfigured()) {
    return null;
  }

  const authorization = getRequestHeader(request, "authorization");

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
    isAuthConfigured: isAuthConfigured(),
    isStorageConfigured: isSupabaseStorageConfigured(),
    canPersist: isMongoConfigured() && isAuthConfigured(),
    site: record.site ?? null,
    publishedAt: record.publishedAt ?? null,
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

function readTrimmedString(value) {
  return typeof value === "string" ? value.trim() : "";
}

async function requireOwnedSite(request, response) {
  const user = await getRequestUser(request);

  if (!user) {
    sendJson(response, 401, {
      message: "Sign in to manage your site.",
    });
    return null;
  }

  const siteId = readTrimmedString(getRequestQueryParam(request, "siteId"));

  if (!siteId) {
    sendJson(response, 400, {
      message: "A siteId query parameter is required.",
    });
    return null;
  }

  const site = await getPortfolioSiteForUser(siteId, user.id);

  if (!site) {
    sendJson(response, 404, {
      message: "That site was not found for your account.",
    });
    return null;
  }

  return { user, site };
}

async function handleAuthRegister(request, response) {
  if (!isAuthConfigured()) {
    sendJson(response, 503, {
      message:
        "MongoDB auth is not configured yet. Set MONGODB_URI, MONGODB_DB_NAME, and JWT_SECRET.",
    });
    return;
  }

  let body;

  try {
    body = await readJsonBody(request);
  } catch {
    sendJson(response, 400, {
      message: "Request body must be valid JSON.",
    });
    return;
  }

  try {
    const result = await registerUser(body ?? {});
    sendJson(response, 201, {
      message:
        result.message ||
        "Account created successfully. Check your inbox and verify your email before signing in.",
    });
  } catch (error) {
    sendJson(response, 400, {
      message:
        error instanceof Error ? error.message : "Unable to create the account.",
    });
  }
}

async function handleAuthLogin(request, response) {
  if (!isAuthConfigured()) {
    sendJson(response, 503, {
      message:
        "MongoDB auth is not configured yet. Set MONGODB_URI, MONGODB_DB_NAME, and JWT_SECRET.",
    });
    return;
  }

  let body;

  try {
    body = await readJsonBody(request);
  } catch {
    sendJson(response, 400, {
      message: "Request body must be valid JSON.",
    });
    return;
  }

  try {
    const result = await loginUser(body ?? {});
    sendJson(response, 200, result);
  } catch (error) {
    sendJson(response, 400, {
      message: error instanceof Error ? error.message : "Unable to sign in.",
    });
  }
}

async function handleAuthSession(request, response) {
  const user = await getRequestUser(request);

  if (!user) {
    sendJson(response, 401, {
      message: "Session has expired. Sign in again.",
    });
    return;
  }

  sendJson(response, 200, { user });
}

async function handleAuthStatus(_request, response) {
  sendJson(response, 200, {
    isConfigured: isAuthConfigured(),
    isMongoConfigured: isMongoConfigured(),
    isStorageConfigured: isSupabaseStorageConfigured(),
    isEmailVerificationConfigured: isEmailVerificationConfigured(),
    isVercelDomainIntegrationConfigured: isVercelDomainIntegrationConfigured(),
  });
}

async function handleAuthVerify(request, response) {
  const token = readTrimmedString(getRequestQueryParam(request, "token"));

  try {
    const result = await verifyEmailAddress(token);
    sendJson(response, 200, result);
  } catch (error) {
    sendJson(response, 400, {
      message:
        error instanceof Error ? error.message : "Unable to verify this email address.",
    });
  }
}

async function handleAuthResendVerification(request, response) {
  let body;

  try {
    body = await readJsonBody(request);
  } catch {
    sendJson(response, 400, {
      message: "Request body must be valid JSON.",
    });
    return;
  }

  try {
    const result = await resendVerificationEmail(body?.email);
    sendJson(response, 200, result);
  } catch (error) {
    sendJson(response, 400, {
      message:
        error instanceof Error
          ? error.message
          : "Unable to resend the verification email.",
    });
  }
}

async function handleSitesGet(request, response) {
  const user = await getRequestUser(request);

  if (!user) {
    sendJson(response, 401, {
      message: "Sign in to load your sites.",
    });
    return;
  }

  const sites = await listPortfolioSitesForUser(user.id);
  sendJson(response, 200, {
    sites,
    config: {
      isMongoConfigured: isMongoConfigured(),
      isAuthConfigured: isAuthConfigured(),
      isStorageConfigured: isSupabaseStorageConfigured(),
      canPersist: isMongoConfigured() && isAuthConfigured(),
    },
  });
}

async function handleSitesPost(request, response) {
  const user = await getRequestUser(request);

  if (!user) {
    sendJson(response, 401, {
      message: "Sign in to create a site.",
    });
    return;
  }

  let body;

  try {
    body = await readJsonBody(request);
  } catch {
    sendJson(response, 400, {
      message: "Request body must be valid JSON.",
    });
    return;
  }

  try {
    const site = await createPortfolioSite({
      name: body?.name,
      slug: body?.slug,
      ownerUserId: user.id,
      ownerEmail: user.email,
    });

    sendJson(response, 201, {
      message: "Site created successfully.",
      site,
    });
  } catch (error) {
    sendJson(response, 400, {
      message:
        error instanceof Error ? error.message : "Unable to create the site.",
    });
  }
}

async function handleSitePublishPost(request, response) {
  const owned = await requireOwnedSite(request, response);

  if (!owned) {
    return;
  }

  try {
    const result = await publishPortfolioSite(
      owned.site.id,
      owned.user.email ?? owned.user.id,
    );

    sendJson(response, 200, {
      message: "Site published successfully.",
      site: result.site,
      publicUrl: result.publicUrl,
      publishedAt: result.publishedAt,
    });
  } catch (error) {
    sendJson(response, 400, {
      message:
        error instanceof Error ? error.message : "Unable to publish the site.",
    });
  }
}

async function handleSiteDomainPost(request, response) {
  const owned = await requireOwnedSite(request, response);

  if (!owned) {
    return;
  }

  let body;

  try {
    body = await readJsonBody(request);
  } catch {
    sendJson(response, 400, {
      message: "Request body must be valid JSON.",
    });
    return;
  }

  try {
    const site = await connectPortfolioSiteCustomDomain(
      owned.site.id,
      body?.domain,
      owned.user.email ?? owned.user.id,
    );

    sendJson(response, 200, {
      message: site?.customDomain
        ? site.customDomainStatus === "verified"
          ? "Custom domain connected successfully."
          : "Custom domain saved. Complete the DNS verification and verify again when ready."
        : "Custom domain updated.",
      site,
    });
  } catch (error) {
    sendJson(response, 400, {
      message:
        error instanceof Error
          ? error.message
          : "Unable to connect the custom domain.",
    });
  }
}

async function handleSiteDomainVerifyPost(request, response) {
  const owned = await requireOwnedSite(request, response);

  if (!owned) {
    return;
  }

  try {
    const site = await verifyPortfolioSiteCustomDomain(
      owned.site.id,
      owned.user.email ?? owned.user.id,
    );

    sendJson(response, 200, {
      message:
        site?.customDomainStatus === "verified"
          ? "Custom domain verified successfully."
          : "Domain check complete. Finish the DNS challenge and try verifying again.",
      site,
    });
  } catch (error) {
    sendJson(response, 400, {
      message:
        error instanceof Error ? error.message : "Unable to verify the custom domain.",
    });
  }
}

async function handleSiteDomainDelete(request, response) {
  const owned = await requireOwnedSite(request, response);

  if (!owned) {
    return;
  }

  try {
    const site = await disconnectPortfolioSiteCustomDomain(
      owned.site.id,
      owned.user.email ?? owned.user.id,
    );

    sendJson(response, 200, {
      message:
        "Custom domain removed from this site. If it was already attached in Vercel, remove it there as well.",
      site,
    });
  } catch (error) {
    sendJson(response, 400, {
      message:
        error instanceof Error ? error.message : "Unable to remove the custom domain.",
    });
  }
}

async function handleContentGet(request, response) {
  const user = await getRequestUser(request);
  const siteId = readTrimmedString(getRequestQueryParam(request, "siteId"));
  const siteSlug = readTrimmedString(getRequestQueryParam(request, "siteSlug"));
  const resolvedHost = getNormalizedRequestHost(request);
  const hostSite =
    !siteId && !siteSlug ? await getPortfolioSiteByResolvedHost(resolvedHost) : null;
  const resolvedSiteSlug = siteSlug || hostSite?.slug || "";

  if (siteId && !user) {
    sendJson(response, 401, {
      message: "Sign in to load draft content.",
    });
    return;
  }

  if (siteId && user) {
    const site = await getPortfolioSiteForUser(siteId, user.id);

    if (!site) {
      sendJson(response, 404, {
        message: "That site was not found for your account.",
      });
      return;
    }
  }

  if (!siteId && resolvedSiteSlug) {
    const publicSite = await getPortfolioSiteBySlug(resolvedSiteSlug);

    if (!publicSite) {
      sendJson(response, 404, {
        message: "The requested site could not be found.",
      });
      return;
    }
  }

  const record = await getPortfolioContentRecord({
    siteId: siteId || null,
    siteSlug: siteId ? null : resolvedSiteSlug || null,
    userId: user?.id ?? null,
    mode: siteId ? "admin" : "public",
  });

  if (!siteId && resolvedSiteSlug && record.site && !record.publishedAt) {
    sendJson(response, 404, {
      message: "This site has not been published yet.",
    });
    return;
  }

  const content = await getContentForResponse(
    getContentForAudience(record.content, Boolean(user && siteId)),
  );

  sendJson(response, 200, {
    content,
    meta: buildContentMeta(record),
  });
}

async function handleContentPut(request, response) {
  if (!isAuthConfigured()) {
    sendJson(response, 503, {
      message:
        "MongoDB auth is not configured yet. Set MONGODB_URI, MONGODB_DB_NAME, and JWT_SECRET.",
    });
    return;
  }

  const owned = await requireOwnedSite(request, response);

  if (!owned) {
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
    await savePortfolioContent(
      normalizePortfolioStorageContent(body?.content ?? {}),
      owned.user.email ?? owned.user.id,
      owned.site.id,
    );

    const record = await getPortfolioContentRecord({
      siteId: owned.site.id,
      userId: owned.user.id,
      mode: "admin",
    });
    const content = await getContentForResponse(record.content);

    sendJson(response, 200, {
      message: "Draft saved successfully.",
      content,
      meta: buildContentMeta(record),
    });
  } catch (error) {
    const message =
      error instanceof Error && error.message.includes("MongoDB")
        ? describeMongoConnectionError(error)
        : error instanceof Error
          ? error.message
          : "Failed to save site content.";

    sendJson(response, 500, { message });
  }
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

  const siteSlug = readTrimmedString(getRequestQueryParam(request, "siteSlug"));
  const siteId = readTrimmedString(getRequestQueryParam(request, "siteId"));
  const site = siteSlug
    ? await getPortfolioSiteBySlug(siteSlug)
    : siteId
      ? await getPortfolioSiteById(siteId)
      : null;

  if (!site) {
    sendJson(response, 404, {
      message: "Recommendation submissions require a valid published site.",
      });
    return;
  }

  if (site.status !== "published") {
    sendJson(response, 400, {
      message: "Recommendations can only be submitted for published sites.",
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
      folder: `sites/${site.id}/recommendation-photos`,
    });

    const record = await getPortfolioContentRecord({
      siteId: site.id,
      mode: "admin",
    });
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

    await savePortfolioContent(nextContent, "public-submission", site.id);
    const nextRecord = await getPortfolioContentRecord({
      siteId: site.id,
      mode: "admin",
    });
    const content = await getContentForResponse(
      getContentForAudience(nextRecord.content, false),
    );

    sendJson(response, 201, {
      message:
        "Thanks for sharing your feedback. It has been submitted for review.",
      content,
      meta: buildContentMeta(nextRecord),
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
  const owned = await requireOwnedSite(request, response);

  if (!owned) {
    return;
  }

  if (!isSupabaseStorageConfigured()) {
    sendJson(response, 503, {
      message:
        "Supabase Storage is not configured. Set SUPABASE_SERVICE_ROLE_KEY and SUPABASE_STORAGE_BUCKET before uploading images.",
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
      message: "Upload type must be either `profile`, `project`, or `blog`.",
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
      folder: `sites/${owned.site.id}/${folder}`,
    });
    const url = await resolveStorageAssetValue(asset.reference).catch(
      () => asset.publicUrl,
    );

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
    if (resolvedPathname === "/api/auth/register" && request.method === "POST") {
      await handleAuthRegister(request, response);
      return true;
    }

    if (resolvedPathname === "/api/auth/login" && request.method === "POST") {
      await handleAuthLogin(request, response);
      return true;
    }

    if (resolvedPathname === "/api/auth/session" && request.method === "GET") {
      await handleAuthSession(request, response);
      return true;
    }

    if (resolvedPathname === "/api/auth/status" && request.method === "GET") {
      await handleAuthStatus(request, response);
      return true;
    }

    if (resolvedPathname === "/api/auth/verify" && request.method === "GET") {
      await handleAuthVerify(request, response);
      return true;
    }

    if (
      resolvedPathname === "/api/auth/resend-verification" &&
      request.method === "POST"
    ) {
      await handleAuthResendVerification(request, response);
      return true;
    }

    if (resolvedPathname === "/api/sites" && request.method === "GET") {
      await handleSitesGet(request, response);
      return true;
    }

    if (resolvedPathname === "/api/sites" && request.method === "POST") {
      await handleSitesPost(request, response);
      return true;
    }

    if (resolvedPathname === "/api/sites/publish" && request.method === "POST") {
      await handleSitePublishPost(request, response);
      return true;
    }

    if (resolvedPathname === "/api/sites/domain" && request.method === "POST") {
      await handleSiteDomainPost(request, response);
      return true;
    }

    if (
      resolvedPathname === "/api/sites/domain/verify" &&
      request.method === "POST"
    ) {
      await handleSiteDomainVerifyPost(request, response);
      return true;
    }

    if (resolvedPathname === "/api/sites/domain" && request.method === "DELETE") {
      await handleSiteDomainDelete(request, response);
      return true;
    }

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
