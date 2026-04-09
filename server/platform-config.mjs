function trimTrailingSlash(value) {
  return value.replace(/\/+$/, "");
}

export function normalizeDomainName(value) {
  if (typeof value !== "string") {
    return "";
  }

  const trimmed = value.trim().toLowerCase();

  if (!trimmed) {
    return "";
  }

  try {
    const url = trimmed.includes("://")
      ? new URL(trimmed)
      : new URL(`https://${trimmed}`);

    return url.hostname.toLowerCase().replace(/\.$/, "");
  } catch {
    return trimmed
      .replace(/^https?:\/\//, "")
      .split("/")[0]
      .split("?")[0]
      .split("#")[0]
      .replace(/:\d+$/, "")
      .replace(/\.$/, "");
  }
}

export function normalizeRequestHost(value) {
  return normalizeDomainName(value);
}

export function isLocalHostname(hostname) {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname.endsWith(".localhost")
  );
}

export function getPublicAppUrl() {
  const explicit =
    process.env.PUBLIC_APP_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "";

  if (explicit) {
    return trimTrailingSlash(explicit.trim());
  }

  const productionHostname =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL ?? "";

  if (productionHostname) {
    const normalizedHost = normalizeDomainName(productionHostname);

    if (normalizedHost) {
      return `https://${normalizedHost}`;
    }
  }

  return "";
}

export function getPublicAppHost() {
  const publicAppUrl = getPublicAppUrl();

  if (!publicAppUrl) {
    return "";
  }

  try {
    return normalizeDomainName(new URL(publicAppUrl).hostname);
  } catch {
    return "";
  }
}

export function getPlatformRootDomain() {
  return normalizeDomainName(
    process.env.PLATFORM_ROOT_DOMAIN ??
      process.env.NEXT_PUBLIC_PLATFORM_ROOT_DOMAIN ??
      "",
  );
}

export function buildSlugPublicPath(slug) {
  return slug ? `/@/${slug}` : "/";
}

export function buildSitePublicUrl({
  slug,
  customDomain = "",
  customDomainStatus = "none",
}) {
  const normalizedCustomDomain = normalizeDomainName(customDomain);

  if (normalizedCustomDomain && customDomainStatus === "verified") {
    return `https://${normalizedCustomDomain}`;
  }

  const platformRootDomain = getPlatformRootDomain();

  if (platformRootDomain && slug) {
    return `https://${slug}.${platformRootDomain}`;
  }

  const publicAppUrl = getPublicAppUrl();

  if (publicAppUrl && slug) {
    return `${trimTrailingSlash(publicAppUrl)}${buildSlugPublicPath(slug)}`;
  }

  return buildSlugPublicPath(slug);
}

export function resolveTenantSlugFromHost(hostname) {
  const normalizedHost = normalizeRequestHost(hostname);
  const platformRootDomain = getPlatformRootDomain();

  if (!normalizedHost || !platformRootDomain) {
    return null;
  }

  if (
    normalizedHost === platformRootDomain ||
    normalizedHost === `www.${platformRootDomain}` ||
    isLocalHostname(normalizedHost) ||
    normalizedHost === getPublicAppHost()
  ) {
    return null;
  }

  if (!normalizedHost.endsWith(`.${platformRootDomain}`)) {
    return null;
  }

  const slug = normalizedHost.slice(0, -(platformRootDomain.length + 1));

  if (!slug || slug.includes(".")) {
    return null;
  }

  return slug;
}
