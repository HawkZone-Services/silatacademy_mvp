import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { PlayersSection } from "@/components/PlayerSection";
import { AboutSection } from "@/components/AboutSection";
import { RankingsSection } from "@/components/RankingsSection";
import { ProgramsSection } from "@/components/ProgramsSection";
import { CoachesSection } from "@/components/CoachesSection";
import { ContactSection } from "@/components/ContactSection";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <PlayersSection />
      <AboutSection />
      <RankingsSection />
      <ProgramsSection />
      <CoachesSection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Index;
