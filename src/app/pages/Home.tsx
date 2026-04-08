import { Navigation } from "../components/Navigation";
import { HeroSection } from "../components/HeroSection";
import { AboutSection } from "../components/AboutSection";
import { ProjectsSection } from "../components/ProjectsSection";
import { SkillsSection } from "../components/SkillsSection";
import { BlogSection } from "../components/BlogSection";
import { VisionSection } from "../components/VisionSection";
import { ContactSection } from "../components/ContactSection";
import { Footer } from "../components/Footer";

export function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <style>{`
        html {
          scroll-behavior: smooth;
        }
      `}</style>
      
      <Navigation />
      
      <main>
        <HeroSection />
        <AboutSection />
        <ProjectsSection />
        <SkillsSection />
        <BlogSection />
        <VisionSection />
        <ContactSection />
      </main>
      
      <Footer />
    </div>
  );
}
