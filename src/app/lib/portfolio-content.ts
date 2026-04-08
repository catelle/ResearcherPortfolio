import defaultContent from "./default-portfolio-content.json";

export const projectIconOptions = [
  "Shield",
  "Heart",
  "Smartphone",
  "Brain",
  "TrendingUp",
  "Code",
  "Lightbulb",
  "Zap",
  "Globe",
  "Lock",
  "Users",
  "Target",
] as const;

export const roleIconOptions = ["Shield", "Code", "Lightbulb"] as const;

export const visionIconOptions = ["Target", "Zap", "Users", "Globe2"] as const;

export const socialIconOptions = ["Linkedin", "Twitter", "Github", "Mail"] as const;

export const supportedLocales = ["en", "fr"] as const;

export type ProjectIconName = (typeof projectIconOptions)[number];
export type RoleIconName = (typeof roleIconOptions)[number];
export type VisionIconName = (typeof visionIconOptions)[number];
export type SocialIconName = (typeof socialIconOptions)[number];
export type Locale = (typeof supportedLocales)[number];
export type HeroDescriptionDisplayMode = "text" | "terminal";
export type SiteCursorStyle = "default" | "accent-dot" | "ring" | "heart" | "emoji";
export type SectionBackgroundStyle =
  | "none"
  | "orbit"
  | "particles"
  | "dotted-map";
export type FormCardEffectStyle = "none" | "border-beam" | "shine-border";

export interface LocalizedText {
  en: string;
  fr: string;
}

export type LocalizedTextValue = string | LocalizedText;

export interface SectionOrbitingBackgrounds {
  hero: boolean;
  about: boolean;
  projects: boolean;
  skills: boolean;
  blog: boolean;
  recommendations: boolean;
  vision: boolean;
  contact: boolean;
}

export type PortfolioSectionKey = keyof SectionOrbitingBackgrounds;

export interface SectionBackgroundSettings {
  style: SectionBackgroundStyle;
  particlesColor: string;
  mapCountryCode: string;
  mapLabel: string;
}

export type SectionBackgroundCollection = Record<
  PortfolioSectionKey,
  SectionBackgroundSettings
>;

export interface FormCardEffect {
  style: FormCardEffectStyle;
  color: string;
}

export interface SiteContent {
  brandName: LocalizedTextValue;
  footerPrefix: LocalizedTextValue;
  footerHighlight: LocalizedTextValue;
  themeAccentColor: string;
  cursorStyle: SiteCursorStyle;
  orbitingBackgrounds: SectionOrbitingBackgrounds;
  sectionBackgrounds: SectionBackgroundCollection;
}

export interface HeroContent {
  eyebrow: LocalizedTextValue;
  titlePrefix: LocalizedTextValue;
  titleAccent: LocalizedTextValue;
  role: LocalizedTextValue;
  description: LocalizedTextValue;
  descriptionDisplayMode: HeroDescriptionDisplayMode;
  terminalLines: LocalizedTextValue[];
  showSocialDock: boolean;
  primaryCtaLabel: LocalizedTextValue;
  secondaryCtaLabel: LocalizedTextValue;
  portraitUrl: string;
  portraitAlt: LocalizedTextValue;
}

export interface HighlightCard {
  id: string;
  icon: string;
  title: LocalizedTextValue;
  description: LocalizedTextValue;
}

export interface Project {
  id: string;
  icon: string;
  title: LocalizedTextValue;
  category: LocalizedTextValue;
  summary: LocalizedTextValue;
  problem: LocalizedTextValue;
  solution: LocalizedTextValue;
  techStack: string[];
  impact: LocalizedTextValue;
  color: string;
  image: string;
  imageAlt: LocalizedTextValue;
  year: string;
  client: LocalizedTextValue;
  role: LocalizedTextValue;
  duration: LocalizedTextValue;
  featured: boolean;
  details: LocalizedTextValue;
  outcomes: LocalizedTextValue[];
  demoUrl: string;
  repositoryUrl: string;
}

export interface SkillCategory {
  id: string;
  title: LocalizedTextValue;
  skills: LocalizedTextValue[];
  color: string;
}

export interface BlogPost {
  id: string;
  title: LocalizedTextValue;
  excerpt: LocalizedTextValue;
  category: LocalizedTextValue;
  date: LocalizedTextValue;
  readTime: LocalizedTextValue;
  image: string;
  imageAlt: LocalizedTextValue;
  author: LocalizedTextValue;
  featured: boolean;
  tags: LocalizedTextValue[];
  body: LocalizedTextValue;
  keyTakeaways: LocalizedTextValue[];
  externalUrl: string;
}

export interface Recommendation {
  id: string;
  name: string;
  role: string;
  company: string;
  photoUrl: string;
  photoAlt: string;
  text: string;
  createdAt: string;
  featured: boolean;
  status: "approved" | "pending";
}

export type RecommendationDisplayMode = "cards" | "marquee";

export interface SocialLink {
  id: string;
  icon: string;
  label: LocalizedTextValue;
  href: string;
  color: string;
}

export interface AboutContent {
  heading: LocalizedTextValue;
  introduction: LocalizedTextValue;
  description: LocalizedTextValue;
  roles: HighlightCard[];
}

export interface ProjectsContent {
  heading: LocalizedTextValue;
  intro: LocalizedTextValue;
  previewCount: number;
  viewAllLabel: LocalizedTextValue;
  items: Project[];
}

export interface SkillsContent {
  heading: LocalizedTextValue;
  intro: LocalizedTextValue;
  showSkillCloud: boolean;
  previewCategoryCount: number;
  previewSkillsPerCategory: number;
  viewAllLabel: LocalizedTextValue;
  categories: SkillCategory[];
}

export interface BlogContent {
  heading: LocalizedTextValue;
  intro: LocalizedTextValue;
  previewCount: number;
  viewAllLabel: LocalizedTextValue;
  posts: BlogPost[];
}

export interface RecommendationsContent {
  heading: LocalizedTextValue;
  intro: LocalizedTextValue;
  displayMode: RecommendationDisplayMode;
  previewCount: number;
  viewAllLabel: LocalizedTextValue;
  formHeading: LocalizedTextValue;
  formIntro: LocalizedTextValue;
  submitLabel: LocalizedTextValue;
  photoHint: LocalizedTextValue;
  successMessage: LocalizedTextValue;
  namePlaceholder: LocalizedTextValue;
  rolePlaceholder: LocalizedTextValue;
  companyPlaceholder: LocalizedTextValue;
  textPlaceholder: LocalizedTextValue;
  photoLabel: LocalizedTextValue;
  submittingLabel: LocalizedTextValue;
  formCardEffect: FormCardEffect;
  items: Recommendation[];
}

export interface VisionContent {
  heading: LocalizedTextValue;
  mainStatement: LocalizedTextValue;
  subStatement: LocalizedTextValue;
  pillars: HighlightCard[];
}

export interface ContactContent {
  heading: LocalizedTextValue;
  intro: LocalizedTextValue;
  nameLabel: LocalizedTextValue;
  namePlaceholder: LocalizedTextValue;
  emailLabel: LocalizedTextValue;
  emailPlaceholder: LocalizedTextValue;
  messageLabel: LocalizedTextValue;
  messagePlaceholder: LocalizedTextValue;
  submitLabel: LocalizedTextValue;
  ctaTitle: LocalizedTextValue;
  opportunities: LocalizedTextValue[];
  socialHeading: LocalizedTextValue;
  socialLinks: SocialLink[];
  formCardEffect: FormCardEffect;
}

export interface PortfolioContent {
  site: SiteContent;
  hero: HeroContent;
  about: AboutContent;
  projects: ProjectsContent;
  skills: SkillsContent;
  blog: BlogContent;
  vision: VisionContent;
  recommendations: RecommendationsContent;
  contact: ContactContent;
}

export interface ContentMeta {
  source: "mongo" | "default";
  updatedAt: string | null;
  updatedBy: string | null;
  isMongoConfigured: boolean;
  isSupabaseConfigured: boolean;
  isStorageConfigured: boolean;
  canPersist: boolean;
}

export interface SaveResult {
  success: boolean;
  message: string;
}

export interface UploadResult extends SaveResult {
  path?: string;
  url?: string;
}

export interface RecommendationSubmissionInput {
  name: string;
  role: string;
  company: string;
  text: string;
  photoAlt?: string;
}

export const defaultContentMeta: ContentMeta = {
  source: "default",
  updatedAt: null,
  updatedBy: null,
  isMongoConfigured: false,
  isSupabaseConfigured: false,
  isStorageConfigured: false,
  canPersist: false,
};

export function getDefaultPortfolioContent(): PortfolioContent {
  return structuredClone(defaultContent) as PortfolioContent;
}

function isLocalizedText(value: unknown): value is LocalizedText {
  return Boolean(
    value &&
      typeof value === "object" &&
      "en" in value &&
      "fr" in value &&
      typeof value.en === "string" &&
      typeof value.fr === "string",
  );
}

export function getLocalizedText(
  value: LocalizedTextValue | undefined | null,
  locale: Locale,
): string {
  if (typeof value === "string") {
    return value;
  }

  if (!isLocalizedText(value)) {
    return "";
  }

  const primary = value[locale]?.trim();
  const fallback = value.en?.trim() || value.fr?.trim();

  return primary || fallback || "";
}

export function getLocalizedTextList(
  values: LocalizedTextValue[] | undefined | null,
  locale: Locale,
): string[] {
  return (values ?? [])
    .map((value) => getLocalizedText(value, locale))
    .map((value) => value.trim())
    .filter(Boolean);
}

export function toLocalizedDraft(
  value: LocalizedTextValue | undefined | null,
): LocalizedText {
  if (typeof value === "string") {
    return { en: value, fr: value };
  }

  if (isLocalizedText(value)) {
    return {
      en: value.en,
      fr: value.fr || value.en,
    };
  }

  return { en: "", fr: "" };
}

export function toLocalizedListDraft(
  values: LocalizedTextValue[] | undefined | null,
): LocalizedText {
  return {
    en: getLocalizedTextList(values, "en").join("\n"),
    fr: getLocalizedTextList(values, "fr").join("\n"),
  };
}

export function buildLocalizedTextValue(value: LocalizedText): LocalizedTextValue {
  const en = value.en.trim();
  const fr = value.fr.trim() || en;

  if (!en && !fr) {
    return "";
  }

  return {
    en: en || fr,
    fr: fr || en,
  };
}

function splitLocalizedListInput(value: string) {
  return value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function buildLocalizedListValue(value: LocalizedText): LocalizedTextValue[] {
  const enItems = splitLocalizedListInput(value.en);
  const frItems = splitLocalizedListInput(value.fr);
  const length = Math.max(enItems.length, frItems.length);

  return Array.from({ length }, (_, index) =>
    buildLocalizedTextValue({
      en: enItems[index] ?? frItems[index] ?? "",
      fr: frItems[index] ?? enItems[index] ?? "",
    }),
  ).filter((item) => getLocalizedText(item, "en") || getLocalizedText(item, "fr"));
}

export function createContentItemId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}`;
}

export function slugifyContentSegment(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function getProjectSlug(project: Project) {
  const titleSegment = slugifyContentSegment(getLocalizedText(project.title, "en"));
  return titleSegment ? `${titleSegment}-${project.id}` : project.id;
}

export function getProjectHref(project: Project) {
  return `/projects/${getProjectSlug(project)}`;
}

export function getBlogPostSlug(post: BlogPost) {
  const titleSegment = slugifyContentSegment(getLocalizedText(post.title, "en"));
  return titleSegment ? `${titleSegment}-${post.id}` : post.id;
}

export function getBlogPostHref(post: BlogPost) {
  return `/blog/${getBlogPostSlug(post)}`;
}

export function findProjectBySlug(items: Project[], slug: string | undefined) {
  if (!slug) {
    return null;
  }

  return items.find((item) => getProjectSlug(item) === slug) ?? null;
}

export function findBlogPostBySlug(posts: BlogPost[], slug: string | undefined) {
  if (!slug) {
    return null;
  }

  return posts.find((post) => getBlogPostSlug(post) === slug) ?? null;
}

export function getApprovedRecommendations(items: Recommendation[]) {
  return items.filter((item) => item.status === "approved");
}

export function getFeaturedPreviewItems<T extends { featured: boolean }>(
  items: T[],
  limit: number,
) {
  const featuredItems = items.filter((item) => item.featured);
  const nonFeaturedItems = items.filter((item) => !item.featured);

  return [...featuredItems, ...nonFeaturedItems].slice(0, limit);
}

export function resolveSectionBackgroundSettings(
  site: SiteContent,
  sectionKey: PortfolioSectionKey,
): SectionBackgroundSettings {
  const configured = site.sectionBackgrounds?.[sectionKey];

  if (configured?.style && configured.style !== "none") {
    return configured;
  }

  if (site.orbitingBackgrounds?.[sectionKey]) {
    return {
      style: "orbit",
      particlesColor: configured?.particlesColor ?? site.themeAccentColor,
      mapCountryCode: configured?.mapCountryCode ?? "CM",
      mapLabel: configured?.mapLabel ?? "",
    };
  }

  return (
    configured ?? {
      style: "none",
      particlesColor: site.themeAccentColor,
      mapCountryCode: "CM",
      mapLabel: "",
    }
  );
}
