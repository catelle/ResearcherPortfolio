import { normalizeDomainName } from "./platform-config.mjs";

function getVercelToken() {
  return process.env.VERCEL_API_TOKEN ?? process.env.VERCEL_TOKEN ?? "";
}

function getVercelProjectIdOrName() {
  return (
    process.env.VERCEL_PROJECT_ID_OR_NAME ??
    process.env.VERCEL_PROJECT_ID ??
    process.env.VERCEL_PROJECT_NAME ??
    ""
  );
}

function getVercelTeamId() {
  return process.env.VERCEL_TEAM_ID ?? "";
}

export function isVercelDomainIntegrationConfigured() {
  return Boolean(getVercelToken() && getVercelProjectIdOrName());
}

function buildVercelProjectUrl(pathname) {
  const projectIdOrName = encodeURIComponent(getVercelProjectIdOrName());
  const url = new URL(`https://api.vercel.com${pathname.replace(":project", projectIdOrName)}`);
  const teamId = getVercelTeamId();

  if (teamId) {
    url.searchParams.set("teamId", teamId);
  }

  return url;
}

async function parseVercelResponse(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function formatVercelError(payload, fallbackMessage) {
  if (!payload || typeof payload !== "object") {
    return fallbackMessage;
  }

  if ("error" in payload && payload.error && typeof payload.error === "object") {
    const errorValue = payload.error;

    if ("message" in errorValue && typeof errorValue.message === "string") {
      return errorValue.message;
    }

    if ("code" in errorValue && typeof errorValue.code === "string") {
      return errorValue.code;
    }
  }

  if ("message" in payload && typeof payload.message === "string") {
    return payload.message;
  }

  return fallbackMessage;
}

function toVerificationList(payload) {
  if (!payload || typeof payload !== "object" || !Array.isArray(payload.verification)) {
    return [];
  }

  return payload.verification
    .map((item) => ({
      type: typeof item?.type === "string" ? item.type : "TXT",
      domain: typeof item?.domain === "string" ? item.domain : "",
      value: typeof item?.value === "string" ? item.value : "",
      reason: typeof item?.reason === "string" ? item.reason : "",
    }))
    .filter((item) => item.domain && item.value);
}

function toDomainState(domain, payload) {
  return {
    domain,
    verified:
      Boolean(
        payload &&
          typeof payload === "object" &&
          "verified" in payload &&
          payload.verified,
      ) === true,
    verification: toVerificationList(payload),
  };
}

async function authorizedRequest(url, init) {
  return fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${getVercelToken()}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
}

export async function attachDomainToVercelProject(inputDomain) {
  if (!isVercelDomainIntegrationConfigured()) {
    throw new Error(
      "Vercel domain automation is not configured. Set VERCEL_API_TOKEN and VERCEL_PROJECT_ID_OR_NAME.",
    );
  }

  const domain = normalizeDomainName(inputDomain);

  if (!domain) {
    throw new Error("Enter a valid custom domain.");
  }

  const response = await authorizedRequest(
    buildVercelProjectUrl("/v10/projects/:project/domains"),
    {
      method: "POST",
      body: JSON.stringify({ name: domain }),
    },
  );
  const payload = await parseVercelResponse(response);

  if (!response.ok) {
    const errorMessage = formatVercelError(
      payload,
      "Unable to attach the custom domain to the Vercel project.",
    );

    if (response.status === 400 && /already exists|already.*project/i.test(errorMessage)) {
      return getVercelProjectDomain(domain);
    }

    throw new Error(errorMessage);
  }

  return toDomainState(domain, payload);
}

export async function verifyVercelProjectDomain(inputDomain) {
  if (!isVercelDomainIntegrationConfigured()) {
    throw new Error(
      "Vercel domain automation is not configured. Set VERCEL_API_TOKEN and VERCEL_PROJECT_ID_OR_NAME.",
    );
  }

  const domain = normalizeDomainName(inputDomain);

  if (!domain) {
    throw new Error("Enter a valid custom domain.");
  }

  const response = await authorizedRequest(
    buildVercelProjectUrl(`/v10/projects/:project/domains/${encodeURIComponent(domain)}/verify`),
    {
      method: "POST",
    },
  );
  const payload = await parseVercelResponse(response);

  if (!response.ok) {
    throw new Error(
      formatVercelError(payload, "Unable to verify the custom domain on Vercel."),
    );
  }

  return toDomainState(domain, payload);
}

export async function getVercelProjectDomain(inputDomain) {
  if (!isVercelDomainIntegrationConfigured()) {
    throw new Error(
      "Vercel domain automation is not configured. Set VERCEL_API_TOKEN and VERCEL_PROJECT_ID_OR_NAME.",
    );
  }

  const domain = normalizeDomainName(inputDomain);

  if (!domain) {
    throw new Error("Enter a valid custom domain.");
  }

  const response = await authorizedRequest(
    buildVercelProjectUrl(`/v9/projects/:project/domains/${encodeURIComponent(domain)}`),
    {
      method: "GET",
    },
  );
  const payload = await parseVercelResponse(response);

  if (!response.ok) {
    throw new Error(
      formatVercelError(payload, "Unable to inspect the custom domain on Vercel."),
    );
  }

  return toDomainState(domain, payload);
}
