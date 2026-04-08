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

export interface SiteContent {
  brandName: string;
  footerPrefix: string;
  footerHighlight: string;
  themeAccentColor: string;
}

export interface HeroContent {
  eyebrow: string;
  titlePrefix: string;
  titleAccent: string;
  role: string;
  description: string;
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
  problem: string;
  solution: string;
  techStack: string[];
  impact: string;
  color: string;
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
}

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
  items: Project[];
}

export interface SkillsContent {
  heading: string;
  intro: string;
  categories: SkillCategory[];
}

export interface BlogContent {
  heading: string;
  intro: string;
  posts: BlogPost[];
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
}

export interface PortfolioContent {
  site: SiteContent;
  hero: HeroContent;
  about: AboutContent;
  projects: ProjectsContent;
  skills: SkillsContent;
  blog: BlogContent;
  vision: VisionContent;
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
