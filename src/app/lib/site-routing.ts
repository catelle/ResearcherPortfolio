function shouldUseSlugPathRouting(siteSlug?: string | null) {
  if (!siteSlug) {
    return false;
  }

  if (typeof window === "undefined") {
    return true;
  }

  const prefix = `/@/${siteSlug}`;
  return (
    window.location.pathname === prefix ||
    window.location.pathname.startsWith(`${prefix}/`)
  );
}

export function buildPublicSiteHomePath(siteSlug?: string | null) {
  if (!siteSlug || !shouldUseSlugPathRouting(siteSlug)) {
    return "/";
  }

  return `/@/${siteSlug}`;
}

export function buildPublicSitePath(
  siteSlug: string | null | undefined,
  path = "/",
) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (!siteSlug || !shouldUseSlugPathRouting(siteSlug)) {
    return normalizedPath;
  }

  if (normalizedPath === "/") {
    return `/@/${siteSlug}`;
  }

  return `/@/${siteSlug}${normalizedPath}`;
}

export function buildPublicSiteSectionHref(
  siteSlug: string | null | undefined,
  sectionId: string,
  isHomePage: boolean,
) {
  const anchor = sectionId.startsWith("#") ? sectionId : `#${sectionId}`;

  if (isHomePage) {
    return anchor;
  }

  return `${buildPublicSiteHomePath(siteSlug)}${anchor}`;
}

export function isPublicHomePath(pathname: string, siteSlug?: string | null) {
  const homePath = buildPublicSiteHomePath(siteSlug);
  return pathname === homePath;
}
