import { promises as fs } from "node:fs";

const defaultContentUrl = new URL(
  "../src/app/lib/default-portfolio-content.json",
  import.meta.url,
);

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

async function getMongoCollection() {
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

  const collectionName =
    process.env.MONGODB_CONTENT_COLLECTION ?? "portfolio_content";
  const client = await mongoClientPromise;

  return client.db(getMongoDatabaseName()).collection(collectionName);
}

export async function getPortfolioContentRecord() {
  const defaultContent = await loadDefaultContent();

  if (!isMongoConfigured()) {
    return {
      content: defaultContent,
      source: "default",
      updatedAt: null,
      updatedBy: null,
    };
  }

  try {
    const collection = await getMongoCollection();
    const document = await collection.findOne({ key: "primary" });

    if (!document?.content) {
      return {
        content: defaultContent,
        source: "default",
        updatedAt: null,
        updatedBy: null,
      };
    }

    return {
      content: normalizeWithTemplate(defaultContent, document.content),
      source: "mongo",
      updatedAt: typeof document.updatedAt === "string" ? document.updatedAt : null,
      updatedBy: typeof document.updatedBy === "string" ? document.updatedBy : null,
    };
  } catch (error) {
    console.error("Falling back to default portfolio content.", error);

    return {
      content: defaultContent,
      source: "default",
      updatedAt: null,
      updatedBy: null,
    };
  }
}

export async function savePortfolioContent(input, updatedBy) {
  if (!isMongoConfigured()) {
    throw new Error("MongoDB is not configured.");
  }

  const defaultContent = await loadDefaultContent();
  const content = normalizeWithTemplate(defaultContent, input);
  const updatedAt = new Date().toISOString();

  const collection = await getMongoCollection();
  await collection.updateOne(
    { key: "primary" },
    {
      $set: {
        key: "primary",
        content,
        updatedAt,
        updatedBy,
      },
    },
    { upsert: true },
  );

  return {
    content,
    source: "mongo",
    updatedAt,
    updatedBy,
  };
}
