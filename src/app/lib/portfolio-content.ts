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

export type ProjectIconName = (typeof projectIconOptions)[number];
export type RoleIconName = (typeof roleIconOptions)[number];
export type VisionIconName = (typeof visionIconOptions)[number];
export type SocialIconName = (typeof socialIconOptions)[number];
export type HeroDescriptionDisplayMode = "text" | "terminal";
export type SiteCursorStyle = "default" | "accent-dot" | "ring" | "heart" | "emoji";
export type SectionBackgroundStyle =
  | "none"
  | "orbit"
  | "particles"
  | "dotted-map";
export type FormCardEffectStyle = "none" | "border-beam" | "shine-border";

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
  brandName: string;
  footerPrefix: string;
  footerHighlight: string;
  themeAccentColor: string;
  cursorStyle: SiteCursorStyle;
  orbitingBackgrounds: SectionOrbitingBackgrounds;
  sectionBackgrounds: SectionBackgroundCollection;
}

export interface HeroContent {
  eyebrow: string;
  titlePrefix: string;
  titleAccent: string;
  role: string;
  description: string;
  descriptionDisplayMode: HeroDescriptionDisplayMode;
  terminalLines: string[];
  showSocialDock: boolean;
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
  portraitUrl: string;
  portraitAlt: string;
}

export interface HighlightCard {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface Project {
  id: string;
  icon: string;
  title: string;
  category: string;
  summary: string;
  problem: string;
  solution: string;
  techStack: string[];
  impact: string;
  color: string;
  image: string;
  imageAlt: string;
  year: string;
  client: string;
  role: string;
  duration: string;
  featured: boolean;
  details: string;
  outcomes: string[];
  demoUrl: string;
  repositoryUrl: string;
}

export interface SkillCategory {
  id: string;
  title: string;
  skills: string[];
  color: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
  imageAlt: string;
  author: string;
  featured: boolean;
  tags: string[];
  body: string;
  keyTakeaways: string[];
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
  label: string;
  href: string;
  color: string;
}

export interface AboutContent {
  heading: string;
  introduction: string;
  description: string;
  roles: HighlightCard[];
}

export interface ProjectsContent {
  heading: string;
  intro: string;
  previewCount: number;
  viewAllLabel: string;
  items: Project[];
}

export interface SkillsContent {
  heading: string;
  intro: string;
  showSkillCloud: boolean;
  previewCategoryCount: number;
  previewSkillsPerCategory: number;
  viewAllLabel: string;
  categories: SkillCategory[];
}

export interface BlogContent {
  heading: string;
  intro: string;
  previewCount: number;
  viewAllLabel: string;
  posts: BlogPost[];
}

export interface RecommendationsContent {
  heading: string;
  intro: string;
  displayMode: RecommendationDisplayMode;
  previewCount: number;
  viewAllLabel: string;
  formHeading: string;
  formIntro: string;
  submitLabel: string;
  photoHint: string;
  successMessage: string;
  formCardEffect: FormCardEffect;
  items: Recommendation[];
}

export interface VisionContent {
  heading: string;
  mainStatement: string;
  subStatement: string;
  pillars: HighlightCard[];
}

export interface ContactContent {
  heading: string;
  intro: string;
  nameLabel: string;
  namePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  messageLabel: string;
  messagePlaceholder: string;
  submitLabel: string;
  ctaTitle: string;
  opportunities: string[];
  socialHeading: string;
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
  const titleSegment = slugifyContentSegment(project.title);
  return titleSegment ? `${titleSegment}-${project.id}` : project.id;
}

export function getProjectHref(project: Project) {
  return `/projects/${getProjectSlug(project)}`;
}

export function getBlogPostSlug(post: BlogPost) {
  const titleSegment = slugifyContentSegment(post.title);
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
