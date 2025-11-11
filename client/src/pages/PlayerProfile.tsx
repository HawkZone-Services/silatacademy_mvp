import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Printer } from "lucide-react";
import { PlayerHeader } from "@/components/player/PlayerHeader";
import { PlayerStats } from "@/components/player/PlayerStats";
import { PlayerAchievements } from "@/components/player/PlayerAchievements";
import { PlayerHealth } from "@/components/player/PlayerHealth";
import { PlayerTraining } from "@/components/player/PlayerTraining";
import { players } from "@/data/players";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { toast } from "sonner";

const PlayerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const player = players.find((p) => p.id === id);

  if (!player) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="font-display text-4xl font-bold">Player Not Found</h1>
          <p className="text-muted-foreground">
            The athlete profile you're looking for doesn't exist.
          </p>
          <Button
            onClick={() => navigate("/#players")}
            className="bg-primary hover:bg-primary-glow"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Athletes
          </Button>
        </div>
      </div>
    );
  }

  const handleGenerateReport = () => {
    toast.success("Generating player report...", {
      description: `Creating comprehensive health & training report for ${player.name}`,
    });

    // In a real application, this would generate a PDF report
    setTimeout(() => {
      toast.success("Report ready for download!", {
        description: "The player report has been generated successfully",
      });
    }, 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-16">
        <div className="container px-4">
          {/* Page Header */}
          <div className="mb-8 space-y-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/#players")}
              className="hover:bg-accent"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Athletes
            </Button>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">
                  Athlete Profile
                </h1>
                <p className="text-muted-foreground">
                  Comprehensive performance and health monitoring
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={handlePrint}
                  className="border-secondary/40 hover:bg-secondary/10"
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </Button>
                <Button
                  onClick={handleGenerateReport}
                  className="bg-primary hover:bg-primary-glow shadow-glow"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Generate Report
                </Button>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="space-y-6 animate-fade-in">
            {/* Player Header */}
            <PlayerHeader player={player} />

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                <PlayerStats player={player} />
                <PlayerHealth player={player} />
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <PlayerAchievements player={player} />
                <PlayerTraining player={player} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PlayerProfile;
