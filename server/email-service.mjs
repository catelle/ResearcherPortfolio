import { createHash, randomBytes } from "node:crypto";

import { getPublicAppUrl } from "./platform-config.mjs";

function getResendApiKey() {
  return process.env.RESEND_API_KEY ?? "";
}

function getEmailFromAddress() {
  return process.env.EMAIL_FROM_ADDRESS ?? "";
}

export function isEmailVerificationDeliveryConfigured() {
  return Boolean(getResendApiKey() && getEmailFromAddress() && getPublicAppUrl());
}

export function createRawToken() {
  return randomBytes(32).toString("hex");
}

export function hashToken(value) {
  return createHash("sha256").update(String(value)).digest("hex");
}

function buildVerificationEmailHtml({ name, verificationUrl }) {
  return `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827;padding:24px;">
      <p style="font-size:14px;color:#6b7280;margin:0 0 16px;">Portfolio SaaS</p>
      <h1 style="font-size:28px;line-height:1.2;margin:0 0 16px;">Verify your email</h1>
      <p style="margin:0 0 16px;">Hi ${name || "there"},</p>
      <p style="margin:0 0 24px;">
        Confirm your email address to finish activating your site-builder account.
      </p>
      <p style="margin:0 0 24px;">
        <a
          href="${verificationUrl}"
          style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:999px;font-weight:600;"
        >
          Verify email
        </a>
      </p>
      <p style="margin:0 0 12px;color:#6b7280;">
        If the button does not open, use this link:
      </p>
      <p style="margin:0;color:#2563eb;word-break:break-all;">${verificationUrl}</p>
    </div>
  `;
}

export async function sendVerificationEmail({ email, name, token }) {
  if (!isEmailVerificationDeliveryConfigured()) {
    throw new Error(
      "Email verification delivery is not configured. Set RESEND_API_KEY, EMAIL_FROM_ADDRESS, and PUBLIC_APP_URL.",
    );
  }

  const verificationUrl = `${getPublicAppUrl()}/verify-email?token=${encodeURIComponent(token)}`;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getResendApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: getEmailFromAddress(),
      to: [email],
      subject: "Verify your email for your portfolio workspace",
      html: buildVerificationEmailHtml({ name, verificationUrl }),
      text: `Verify your email by opening ${verificationUrl}`,
    }),
  });

  let payload = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message =
      payload &&
      typeof payload === "object" &&
      "message" in payload &&
      typeof payload.message === "string"
        ? payload.message
        : "Unable to send the verification email.";

    throw new Error(message);
  }

  return payload;
}
