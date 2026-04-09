import { promises as fs } from "node:fs";
import { randomUUID } from "node:crypto";

import {
  buildSitePublicUrl,
  getPlatformRootDomain,
  normalizeDomainName,
  normalizeRequestHost,
  resolveTenantSlugFromHost,
} from "./platform-config.mjs";
import {
  attachDomainToVercelProject,
  getVercelProjectDomain,
  isVercelDomainIntegrationConfigured,
  verifyVercelProjectDomain,
} from "./vercel-domains.mjs";

const defaultContentUrl = new URL(
  "../src/app/lib/default-portfolio-content.json",
  import.meta.url,
);

const LEGACY_PRIMARY_KEY = "primary";
const SITE_CONTENT_KEY_PREFIX = "site:";
const reservedSiteSlugs = new Set([
  "admin",
  "api",
  "assets",
  "auth",
  "blog",
  "projects",
  "recommendations",
  "skills",
  "vision",
  "site",
  "sites",
]);

let mongoClientPromise;

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

async function loadDefaultContent() {
  const raw = await fs.readFile(defaultContentUrl, "utf8");
  return JSON.parse(raw);
}

function normalizeWithTemplate(template, input) {
  if (Array.isArray(template)) {
    if (!Array.isArray(input)) {
      return structuredClone(template);
    }

    if (template.length === 0) {
      return input;
    }

    return input.map((item) => normalizeWithTemplate(template[0], item));
  }

  if (isPlainObject(template)) {
    const output = {};

    for (const [key, value] of Object.entries(template)) {
      output[key] = normalizeWithTemplate(value, input?.[key]);
    }

    return output;
  }

  if (typeof template === "string") {
    if (
      isPlainObject(input) &&
      typeof input.en === "string" &&
      typeof input.fr === "string"
    ) {
      return {
        en: input.en,
        fr: input.fr,
      };
    }

    return typeof input === "string" ? input : template;
  }

  if (typeof template === "number") {
    return typeof input === "number" ? input : template;
  }

  if (typeof template === "boolean") {
    return typeof input === "boolean" ? input : template;
  }

  return input ?? template;
}

function getMongoUri() {
  return process.env.MONGODB_URI ?? "";
}

function getMongoDatabaseName() {
  return process.env.MONGODB_DB_NAME ?? "";
}

function getContentCollectionName() {
  return process.env.MONGODB_CONTENT_COLLECTION ?? "portfolio_content";
}

function getUserCollectionName() {
  return process.env.MONGODB_USER_COLLECTION ?? "portfolio_users";
}

function getSiteCollectionName() {
  return process.env.MONGODB_SITE_COLLECTION ?? "portfolio_sites";
}

export function isMongoConfigured() {
  return Boolean(getMongoUri() && getMongoDatabaseName());
}

export function describeMongoConnectionError(error) {
  const message =
    error instanceof Error ? error.message : "Unknown MongoDB connection error.";

  return [
    "MongoDB connection failed.",
    "Check your Atlas IP allow list, make sure the cluster is running, and verify MONGODB_URI and MONGODB_DB_NAME.",
    `Original error: ${message}`,
  ].join(" ");
}

async function getMongoClient() {
  if (!isMongoConfigured()) {
    throw new Error("MongoDB is not configured.");
  }

  if (!mongoClientPromise) {
    const { MongoClient } = await import("mongodb");
    const client = new MongoClient(getMongoUri(), {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });

    mongoClientPromise = client.connect().catch((error) => {
      mongoClientPromise = undefined;
      throw new Error(describeMongoConnectionError(error));
    });
  }

  return mongoClientPromise;
}

export async function getMongoDatabase() {
  const client = await getMongoClient();
  return client.db(getMongoDatabaseName());
}

async function getMongoCollection(collectionName) {
  const database = await getMongoDatabase();
  return database.collection(collectionName);
}

async function getContentCollection() {
  return getMongoCollection(getContentCollectionName());
}

async function getUserCollection() {
  return getMongoCollection(getUserCollectionName());
}

async function getSiteCollection() {
  return getMongoCollection(getSiteCollectionName());
}

function slugifySiteSegment(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function sanitizeSiteName(value) {
  const name = typeof value === "string" ? value.trim() : "";
  return name.replace(/\s+/g, " ").slice(0, 80);
}

function sanitizeCustomDomain(value) {
  const normalized = normalizeDomainName(value);

  if (!normalized) {
    return "";
  }

  if (normalized === getPlatformRootDomain()) {
    throw new Error("Use a different domain from your platform root domain.");
  }

  return normalized;
}

function toVerificationChallenge(item) {
  return {
    type: typeof item?.type === "string" ? item.type : "TXT",
    domain: typeof item?.domain === "string" ? item.domain : "",
    value: typeof item?.value === "string" ? item.value : "",
    reason: typeof item?.reason === "string" ? item.reason : "",
  };
}

function toSiteSummary(document) {
  if (!document) {
    return null;
  }

  const customDomain =
    typeof document.customDomain === "string" ? document.customDomain : "";
  const customDomainStatus =
    typeof document.customDomainStatus === "string"
      ? document.customDomainStatus
      : customDomain
        ? "pending"
        : "none";
  const domainVerification = Array.isArray(document.customDomainVerification)
    ? document.customDomainVerification.map(toVerificationChallenge)
    : [];

  return {
    id: document.id,
    name: document.name,
    slug: document.slug,
    status: document.status === "published" ? "published" : "draft",
    publicUrl: buildSitePublicUrl({
      slug: document.slug,
      customDomain,
      customDomainStatus,
    }),
    createdAt: typeof document.createdAt === "string" ? document.createdAt : null,
    updatedAt: typeof document.updatedAt === "string" ? document.updatedAt : null,
    publishedAt:
      typeof document.publishedAt === "string" ? document.publishedAt : null,
    customDomain,
    customDomainStatus:
      customDomainStatus === "verified"
        ? "verified"
        : customDomainStatus === "error"
          ? "error"
          : customDomainStatus === "pending"
            ? "pending"
            : "none",
    customDomainVerification: domainVerification,
    customDomainError:
      typeof document.customDomainError === "string"
        ? document.customDomainError
        : "",
    subdomainUrl: buildSitePublicUrl({
      slug: document.slug,
      customDomain: "",
      customDomainStatus: "none",
    }),
  };
}

function createInitialSiteContent(defaultContent, siteName) {
  const nextContent = structuredClone(defaultContent);

  if (siteName) {
    nextContent.site.brandName = {
      en: siteName,
      fr: siteName,
    };

    nextContent.hero.titleAccent = {
      en: siteName,
      fr: siteName,
    };
  }

  return nextContent;
}

async function reserveUniqueSiteSlug(baseValue, excludeSiteId = null) {
  const siteCollection = await getSiteCollection();
  const baseSlug = slugifySiteSegment(baseValue) || "site";
  let nextSlug = baseSlug;
  let counter = 1;

  while (reservedSiteSlugs.has(nextSlug)) {
    nextSlug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  while (true) {
    const existing = await siteCollection.findOne({ slug: nextSlug });

    if (!existing || (excludeSiteId && existing.id === excludeSiteId)) {
      return nextSlug;
    }

    nextSlug = `${baseSlug}-${counter}`;
    counter += 1;
  }
}

async function getLegacyPrimaryDocument() {
  const collection = await getContentCollection();
  return collection.findOne({ key: LEGACY_PRIMARY_KEY });
}

export async function listPortfolioSitesForUser(userId) {
  if (!isMongoConfigured() || !userId) {
    return [];
  }

  try {
    const siteCollection = await getSiteCollection();
    const documents = await siteCollection
      .find({ ownerUserId: userId })
      .sort({ updatedAt: -1, createdAt: -1 })
      .toArray();

    return documents.map(toSiteSummary).filter(Boolean);
  } catch (error) {
    console.error("Unable to load portfolio sites for user.", error);
    return [];
  }
}

export async function getPortfolioSiteForUser(siteId, userId) {
  if (!isMongoConfigured() || !siteId || !userId) {
    return null;
  }

  try {
    const siteCollection = await getSiteCollection();
    const document = await siteCollection.findOne({
      id: siteId,
      ownerUserId: userId,
    });

    return toSiteSummary(document);
  } catch (error) {
    console.error("Unable to resolve portfolio site ownership.", error);
    return null;
  }
}

export async function getPortfolioSiteBySlug(siteSlug) {
  if (!isMongoConfigured() || !siteSlug) {
    return null;
  }

  try {
    const siteCollection = await getSiteCollection();
    const document = await siteCollection.findOne({
      slug: siteSlug.toLowerCase().trim(),
    });

    return toSiteSummary(document);
  } catch (error) {
    console.error("Unable to resolve portfolio site by slug.", error);
    return null;
  }
}

export async function getPortfolioSiteByCustomDomain(domain) {
  const normalizedDomain = normalizeDomainName(domain);

  if (!isMongoConfigured() || !normalizedDomain) {
    return null;
  }

  try {
    const siteCollection = await getSiteCollection();
    const document = await siteCollection.findOne({
      customDomain: normalizedDomain,
    });

    return toSiteSummary(document);
  } catch (error) {
    console.error("Unable to resolve portfolio site by custom domain.", error);
    return null;
  }
}

export async function getPortfolioSiteByResolvedHost(host) {
  const normalizedHost = normalizeRequestHost(host);

  if (!normalizedHost || !isMongoConfigured()) {
    return null;
  }

  const byDomain = await getPortfolioSiteByCustomDomain(normalizedHost);

  if (byDomain) {
    return byDomain;
  }

  const tenantSlug = resolveTenantSlugFromHost(normalizedHost);

  if (!tenantSlug) {
    return null;
  }

  return getPortfolioSiteBySlug(tenantSlug);
}

export async function getPortfolioSiteById(siteId) {
  if (!isMongoConfigured() || !siteId) {
    return null;
  }

  try {
    const siteCollection = await getSiteCollection();
    const document = await siteCollection.findOne({ id: siteId });
    return toSiteSummary(document);
  } catch (error) {
    console.error("Unable to resolve portfolio site by id.", error);
    return null;
  }
}

export async function createPortfolioSite({
  name,
  slug,
  ownerUserId,
  ownerEmail,
}) {
  if (!isMongoConfigured()) {
    throw new Error("MongoDB is not configured.");
  }

  if (!ownerUserId) {
    throw new Error("A valid account is required to create a site.");
  }

  const siteName = sanitizeSiteName(name);

  if (siteName.length < 2) {
    throw new Error("Site name must be at least 2 characters long.");
  }

  const siteSlug = await reserveUniqueSiteSlug(slug || siteName);
  const defaultContent = await loadDefaultContent();
  const siteId = `site-${randomUUID()}`;
  const now = new Date().toISOString();

  const siteCollection = await getSiteCollection();
  const contentCollection = await getContentCollection();

  const siteDocument = {
    id: siteId,
    name: siteName,
    slug: siteSlug,
    ownerUserId,
    ownerEmail: ownerEmail ?? "",
    status: "draft",
    createdAt: now,
    updatedAt: now,
    publishedAt: null,
    customDomain: "",
    customDomainStatus: "none",
    customDomainVerification: [],
    customDomainError: "",
  };

  const initialContent = createInitialSiteContent(defaultContent, siteName);

  await siteCollection.insertOne(siteDocument);
  await contentCollection.insertOne({
    key: `${SITE_CONTENT_KEY_PREFIX}${siteId}`,
    siteId,
    draftContent: initialContent,
    publishedContent: null,
    updatedAt: now,
    updatedBy: ownerEmail ?? ownerUserId,
    publishedAt: null,
    publishedBy: null,
  });

  return toSiteSummary(siteDocument);
}

async function readSiteContext({ siteId, siteSlug, userId = null }) {
  if (siteId && userId) {
    return getPortfolioSiteForUser(siteId, userId);
  }

  if (siteId) {
    return getPortfolioSiteById(siteId);
  }

  if (siteSlug) {
    return getPortfolioSiteBySlug(siteSlug);
  }

  return null;
}

function createSiteAwareContentRecord({
  content,
  source,
  updatedAt,
  updatedBy,
  site,
  publishedAt = null,
}) {
  return {
    content,
    source,
    updatedAt,
    updatedBy,
    site,
    publishedAt,
  };
}

export async function getPortfolioContentRecord(options = {}) {
  const defaultContent = await loadDefaultContent();
  const { siteId = null, siteSlug = null, userId = null, mode = "public" } = options;

  if (!isMongoConfigured()) {
    return createSiteAwareContentRecord({
      content: defaultContent,
      source: "default",
      updatedAt: null,
      updatedBy: null,
      site: null,
    });
  }

  try {
    if (!siteId && !siteSlug) {
      const legacyDocument = await getLegacyPrimaryDocument();

      if (!legacyDocument?.content) {
        return createSiteAwareContentRecord({
          content: defaultContent,
          source: "default",
          updatedAt: null,
          updatedBy: null,
          site: null,
        });
      }

      return createSiteAwareContentRecord({
        content: normalizeWithTemplate(defaultContent, legacyDocument.content),
        source: "mongo",
        updatedAt:
          typeof legacyDocument.updatedAt === "string"
            ? legacyDocument.updatedAt
            : null,
        updatedBy:
          typeof legacyDocument.updatedBy === "string"
            ? legacyDocument.updatedBy
            : null,
        site: null,
      });
    }

    const site = await readSiteContext({ siteId, siteSlug, userId });

    if (!site) {
      throw new Error("Site not found.");
    }

    const contentCollection = await getContentCollection();
    const document = await contentCollection.findOne({
      key: `${SITE_CONTENT_KEY_PREFIX}${site.id}`,
    });

    const sourceContent =
      mode === "admin"
        ? document?.draftContent ?? document?.publishedContent
        : document?.publishedContent;

    if (!sourceContent) {
      return createSiteAwareContentRecord({
        content: createInitialSiteContent(defaultContent, site.name),
        source: "default",
        updatedAt:
          typeof document?.updatedAt === "string" ? document.updatedAt : null,
        updatedBy:
          typeof document?.updatedBy === "string" ? document.updatedBy : null,
        site,
        publishedAt:
          typeof document?.publishedAt === "string" ? document.publishedAt : null,
      });
    }

    return createSiteAwareContentRecord({
      content: normalizeWithTemplate(defaultContent, sourceContent),
      source: "mongo",
      updatedAt: typeof document?.updatedAt === "string" ? document.updatedAt : null,
      updatedBy: typeof document?.updatedBy === "string" ? document.updatedBy : null,
      site,
      publishedAt:
        typeof document?.publishedAt === "string" ? document.publishedAt : null,
    });
  } catch (error) {
    console.error("Falling back to default portfolio content.", error);

    return createSiteAwareContentRecord({
      content: defaultContent,
      source: "default",
      updatedAt: null,
      updatedBy: null,
      site: null,
    });
  }
}

export async function savePortfolioContent(input, updatedBy, siteId) {
  if (!isMongoConfigured()) {
    throw new Error("MongoDB is not configured.");
  }

  if (!siteId) {
    throw new Error("A site must be selected before saving content.");
  }

  const defaultContent = await loadDefaultContent();
  const content = normalizeWithTemplate(defaultContent, input);
  const updatedAt = new Date().toISOString();

  const contentCollection = await getContentCollection();
  await contentCollection.updateOne(
    { key: `${SITE_CONTENT_KEY_PREFIX}${siteId}` },
    {
      $set: {
        key: `${SITE_CONTENT_KEY_PREFIX}${siteId}`,
        siteId,
        draftContent: content,
        updatedAt,
        updatedBy,
      },
      $setOnInsert: {
        publishedContent: null,
        publishedAt: null,
        publishedBy: null,
      },
    },
    { upsert: true },
  );

  const siteCollection = await getSiteCollection();
  await siteCollection.updateOne(
    { id: siteId },
    {
      $set: {
        updatedAt,
      },
    },
  );

  const site = await getPortfolioSiteById(siteId);

  return {
    content,
    source: "mongo",
    updatedAt,
    updatedBy,
    site,
    publishedAt: null,
  };
}

async function syncSiteDomainState({
  siteId,
  customDomain,
  domainState,
  updatedBy,
}) {
  const siteCollection = await getSiteCollection();
  const updatedAt = new Date().toISOString();

  await siteCollection.updateOne(
    { id: siteId },
    {
      $set: {
        customDomain,
        customDomainStatus: domainState.verified ? "verified" : "pending",
        customDomainVerification: domainState.verification,
        customDomainError: "",
        updatedAt,
        updatedBy: updatedBy ?? "",
      },
    },
  );

  return getPortfolioSiteById(siteId);
}

export async function connectPortfolioSiteCustomDomain(siteId, domain, updatedBy) {
  if (!isMongoConfigured()) {
    throw new Error("MongoDB is not configured.");
  }

  if (!siteId) {
    throw new Error("A site must be selected before connecting a domain.");
  }

  const customDomain = sanitizeCustomDomain(domain);

  if (!customDomain) {
    throw new Error("Enter a valid custom domain.");
  }

  const siteCollection = await getSiteCollection();
  const existing = await siteCollection.findOne({
    customDomain,
    id: { $ne: siteId },
  });

  if (existing) {
    throw new Error("That custom domain is already connected to another site.");
  }

  if (!isVercelDomainIntegrationConfigured()) {
    const updatedAt = new Date().toISOString();

    await siteCollection.updateOne(
      { id: siteId },
      {
        $set: {
          customDomain,
          customDomainStatus: "pending",
          customDomainVerification: [],
          customDomainError:
            "Vercel domain automation is not configured yet. Add the domain manually in Vercel and point its DNS records before verifying again.",
          updatedAt,
          updatedBy: updatedBy ?? "",
        },
      },
    );

    return getPortfolioSiteById(siteId);
  }

  try {
    const attachedDomain = await attachDomainToVercelProject(customDomain);
    return syncSiteDomainState({
      siteId,
      customDomain,
      domainState: attachedDomain,
      updatedBy,
    });
  } catch (error) {
    const updatedAt = new Date().toISOString();

    await siteCollection.updateOne(
      { id: siteId },
      {
        $set: {
          customDomain,
          customDomainStatus: "error",
          customDomainVerification: [],
          customDomainError:
            error instanceof Error
              ? error.message
              : "Unable to connect the custom domain.",
          updatedAt,
          updatedBy: updatedBy ?? "",
        },
      },
    );

    return getPortfolioSiteById(siteId);
  }
}

export async function verifyPortfolioSiteCustomDomain(siteId, updatedBy) {
  if (!isMongoConfigured()) {
    throw new Error("MongoDB is not configured.");
  }

  if (!siteId) {
    throw new Error("A site must be selected before verifying a domain.");
  }

  const site = await getPortfolioSiteById(siteId);

  if (!site?.customDomain) {
    throw new Error("Set a custom domain before verifying it.");
  }

  if (!isVercelDomainIntegrationConfigured()) {
    throw new Error(
      "Vercel domain automation is not configured. Add VERCEL_API_TOKEN and VERCEL_PROJECT_ID_OR_NAME to verify domains from admin.",
    );
  }

  try {
    const domainState = await verifyVercelProjectDomain(site.customDomain).catch(
      async (error) => {
        if (error instanceof Error && /not found/i.test(error.message)) {
          return getVercelProjectDomain(site.customDomain);
        }

        throw error;
      },
    );

    return syncSiteDomainState({
      siteId,
      customDomain: site.customDomain,
      domainState,
      updatedBy,
    });
  } catch (error) {
    const siteCollection = await getSiteCollection();
    const updatedAt = new Date().toISOString();

    await siteCollection.updateOne(
      { id: siteId },
      {
        $set: {
          customDomainStatus: "error",
          customDomainError:
            error instanceof Error
              ? error.message
              : "Unable to verify the custom domain.",
          updatedAt,
          updatedBy: updatedBy ?? "",
        },
      },
    );

    return getPortfolioSiteById(siteId);
  }
}

export async function disconnectPortfolioSiteCustomDomain(siteId, updatedBy) {
  if (!isMongoConfigured()) {
    throw new Error("MongoDB is not configured.");
  }

  if (!siteId) {
    throw new Error("A site must be selected before removing a domain.");
  }

  const siteCollection = await getSiteCollection();
  const updatedAt = new Date().toISOString();

  await siteCollection.updateOne(
    { id: siteId },
    {
      $set: {
        customDomain: "",
        customDomainStatus: "none",
        customDomainVerification: [],
        customDomainError: "",
        updatedAt,
        updatedBy: updatedBy ?? "",
      },
    },
  );

  return getPortfolioSiteById(siteId);
}

export async function publishPortfolioSite(siteId, publishedBy) {
  if (!isMongoConfigured()) {
    throw new Error("MongoDB is not configured.");
  }

  if (!siteId) {
    throw new Error("A site must be selected before publishing.");
  }

  const contentCollection = await getContentCollection();
  const document = await contentCollection.findOne({
    key: `${SITE_CONTENT_KEY_PREFIX}${siteId}`,
  });

  if (!document?.draftContent) {
    throw new Error("There is no saved draft content to publish yet.");
  }

  const publishedAt = new Date().toISOString();

  await contentCollection.updateOne(
    { key: `${SITE_CONTENT_KEY_PREFIX}${siteId}` },
    {
      $set: {
        publishedContent: document.draftContent,
        publishedAt,
        publishedBy,
      },
    },
  );

  const siteCollection = await getSiteCollection();
  await siteCollection.updateOne(
    { id: siteId },
    {
      $set: {
        status: "published",
        updatedAt: publishedAt,
        publishedAt,
      },
    },
  );

  const site = await getPortfolioSiteById(siteId);

  return {
    site,
    publishedAt,
    publicUrl: site?.publicUrl ?? null,
  };
}

export async function findUserByEmail(email) {
  if (!isMongoConfigured() || !email) {
    return null;
  }

  const userCollection = await getUserCollection();
  return userCollection.findOne({ email: email.toLowerCase().trim() });
}

export async function createUserRecord(user) {
  if (!isMongoConfigured()) {
    throw new Error("MongoDB is not configured.");
  }

  const userCollection = await getUserCollection();
  await userCollection.insertOne(user);
  return user;
}

export async function findUserByVerificationTokenHash(tokenHash) {
  if (!isMongoConfigured() || !tokenHash) {
    return null;
  }

  const userCollection = await getUserCollection();
  return userCollection.findOne({ emailVerificationTokenHash: tokenHash });
}

export async function updateUserRecord(userId, updates) {
  if (!isMongoConfigured() || !userId) {
    throw new Error("MongoDB is not configured.");
  }

  const userCollection = await getUserCollection();
  await userCollection.updateOne({ id: userId }, { $set: updates });
  return userCollection.findOne({ id: userId });
}
