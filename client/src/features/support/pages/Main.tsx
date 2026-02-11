import { Navbar } from "@/shared/ui/Navbar";
import { Hero } from "@/features/support/components/Hero";
import { PlayersSection } from "@/features/players/components/PlayerSection";
import { AboutSection } from "@/features/support/components/AboutSection";
import { RankingsSection } from "@/features/belt-ranking/components/RankingsSection";
import { ProgramsSection } from "@/features/programs/components/ProgramsSection";
import { CoachesSection } from "@/features/coaches/components/CoachesSection";
import { ContactSection } from "@/features/support/components/ContactSection";
import { Footer } from "@/shared/ui/Footer";

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
