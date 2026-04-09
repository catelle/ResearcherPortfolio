import { randomUUID } from "node:crypto";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import {
  createUserRecord,
  findUserByEmail,
  findUserByVerificationTokenHash,
  isMongoConfigured,
  updateUserRecord,
} from "./content-store.mjs";
import {
  createRawToken,
  hashToken,
  isEmailVerificationDeliveryConfigured,
  sendVerificationEmail,
} from "./email-service.mjs";

const AUTH_TOKEN_TTL = "7d";
const EMAIL_VERIFICATION_TTL_MS = 1000 * 60 * 60 * 24;

function getJwtSecret() {
  return process.env.JWT_SECRET ?? "";
}

export function isAuthConfigured() {
  return Boolean(isMongoConfigured() && getJwtSecret());
}

export function isEmailVerificationConfigured() {
  return Boolean(isAuthConfigured() && isEmailVerificationDeliveryConfigured());
}

function sanitizeName(value) {
  return typeof value === "string"
    ? value.trim().replace(/\s+/g, " ").slice(0, 80)
    : "";
}

function sanitizeEmail(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function verificationExpiryDate() {
  return new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS).toISOString();
}

async function assignFreshVerificationToken(user) {
  const rawToken = createRawToken();
  const emailVerificationTokenHash = hashToken(rawToken);
  const emailVerificationExpiresAt = verificationExpiryDate();

  const nextUser = await updateUserRecord(user.id, {
    emailVerificationTokenHash,
    emailVerificationExpiresAt,
    emailVerificationSentAt: new Date().toISOString(),
  });

  return {
    token: rawToken,
    user: nextUser ?? {
      ...user,
      emailVerificationTokenHash,
      emailVerificationExpiresAt,
    },
  };
}

function toPublicUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: typeof user.createdAt === "string" ? user.createdAt : null,
  };
}

function signToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
    },
    getJwtSecret(),
    { expiresIn: AUTH_TOKEN_TTL },
  );
}

export async function registerUser({ name, email, password }) {
  if (!isAuthConfigured()) {
    throw new Error("MongoDB auth is not configured. Set MONGODB_URI, MONGODB_DB_NAME, and JWT_SECRET.");
  }

  if (!isEmailVerificationConfigured()) {
    throw new Error(
      "Email verification is not configured yet. Set RESEND_API_KEY, EMAIL_FROM_ADDRESS, and PUBLIC_APP_URL.",
    );
  }

  const cleanName = sanitizeName(name);
  const cleanEmail = sanitizeEmail(email);
  const cleanPassword = typeof password === "string" ? password.trim() : "";

  if (cleanName.length < 2) {
    throw new Error("Name must be at least 2 characters long.");
  }

  if (!cleanEmail || !cleanEmail.includes("@")) {
    throw new Error("Enter a valid email address.");
  }

  if (cleanPassword.length < 8) {
    throw new Error("Password must be at least 8 characters long.");
  }

  const existing = await findUserByEmail(cleanEmail);

  if (existing) {
    if (existing.emailVerifiedAt) {
      throw new Error("An account with that email already exists.");
    }

    const refreshedVerification = await assignFreshVerificationToken(existing);
    await sendVerificationEmail({
      email: existing.email,
      name: existing.name,
      token: refreshedVerification.token,
    });

    return {
      message:
        "That account already exists but is still awaiting verification. We sent a fresh verification email.",
    };
  }

  const passwordHash = await bcrypt.hash(cleanPassword, 10);
  const user = {
    id: `user-${randomUUID()}`,
    name: cleanName,
    email: cleanEmail,
    passwordHash,
    createdAt: new Date().toISOString(),
    emailVerifiedAt: null,
    emailVerificationTokenHash: "",
    emailVerificationExpiresAt: null,
    emailVerificationSentAt: null,
  };

  await createUserRecord(user);
  const verification = await assignFreshVerificationToken(user);
  await sendVerificationEmail({
    email: cleanEmail,
    name: cleanName,
    token: verification.token,
  });

  return {
    message:
      "Account created successfully. Check your inbox and verify your email before signing in.",
  };
}

export async function loginUser({ email, password }) {
  if (!isAuthConfigured()) {
    throw new Error("MongoDB auth is not configured. Set MONGODB_URI, MONGODB_DB_NAME, and JWT_SECRET.");
  }

  const cleanEmail = sanitizeEmail(email);
  const cleanPassword = typeof password === "string" ? password : "";
  const user = await findUserByEmail(cleanEmail);

  if (!user) {
    throw new Error("No account was found with that email.");
  }

  const isValid = await bcrypt.compare(cleanPassword, user.passwordHash ?? "");

  if (!isValid) {
    throw new Error("Incorrect password.");
  }

  if (!user.emailVerifiedAt) {
    throw new Error(
      "Your email address is not verified yet. Check your inbox, then sign in after verification.",
    );
  }

  return {
    token: signToken(user),
    user: toPublicUser(user),
  };
}

export async function resendVerificationEmail(email) {
  if (!isEmailVerificationConfigured()) {
    throw new Error(
      "Email verification is not configured yet. Set RESEND_API_KEY, EMAIL_FROM_ADDRESS, and PUBLIC_APP_URL.",
    );
  }

  const cleanEmail = sanitizeEmail(email);
  const user = await findUserByEmail(cleanEmail);

  if (!user) {
    throw new Error("No account was found with that email.");
  }

  if (user.emailVerifiedAt) {
    return {
      message: "This email address is already verified. You can sign in now.",
    };
  }

  const verification = await assignFreshVerificationToken(user);
  await sendVerificationEmail({
    email: user.email,
    name: user.name,
    token: verification.token,
  });

  return {
    message: "A fresh verification email has been sent.",
  };
}

export async function verifyEmailAddress(token) {
  if (!isAuthConfigured()) {
    throw new Error("MongoDB auth is not configured. Set MONGODB_URI, MONGODB_DB_NAME, and JWT_SECRET.");
  }

  const cleanToken = typeof token === "string" ? token.trim() : "";

  if (!cleanToken) {
    throw new Error("A verification token is required.");
  }

  const tokenHash = hashToken(cleanToken);
  const user = await findUserByVerificationTokenHash(tokenHash);

  if (!user) {
    throw new Error("This verification link is invalid or has already been used.");
  }

  const expiresAt =
    typeof user.emailVerificationExpiresAt === "string"
      ? Date.parse(user.emailVerificationExpiresAt)
      : Number.NaN;

  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) {
    throw new Error("This verification link has expired. Request a new email and try again.");
  }

  const verifiedUser = await updateUserRecord(user.id, {
    emailVerifiedAt: new Date().toISOString(),
    emailVerificationTokenHash: "",
    emailVerificationExpiresAt: null,
  });

  return {
    message: "Your email address has been verified. You can sign in now.",
    user: toPublicUser(verifiedUser ?? user),
  };
}

export async function verifyAccessToken(token) {
  if (!isAuthConfigured() || !token) {
    return null;
  }

  try {
    const payload = jwt.verify(token, getJwtSecret());
    const userId =
      payload && typeof payload === "object" && typeof payload.sub === "string"
        ? payload.sub
        : null;

    if (!userId) {
      return null;
    }

    const user = await findUserByEmail(
      payload && typeof payload === "object" && typeof payload.email === "string"
        ? payload.email
        : "",
    );

    if (!user || user.id !== userId) {
      return null;
    }

    return toPublicUser(user);
  } catch {
    return null;
  }
}
