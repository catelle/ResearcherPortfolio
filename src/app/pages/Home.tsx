import { SiteLayout } from "../components/SiteLayout";
import { HeroSection } from "../components/HeroSection";
import { AboutSection } from "../components/AboutSection";
import { ProjectsSection } from "../components/ProjectsSection";
import { SkillsSection } from "../components/SkillsSection";
import { BlogSection } from "../components/BlogSection";
import { RecommendationsSection } from "../components/RecommendationsSection";
import { VisionSection } from "../components/VisionSection";
import { ContactSection } from "../components/ContactSection";

export function Home() {
  return (
    <SiteLayout>
      <HeroSection />
      <AboutSection />
      <ProjectsSection />
      <SkillsSection />
      <BlogSection />
      <RecommendationsSection />
      <VisionSection />
      <ContactSection />
    </SiteLayout>
  );
}
