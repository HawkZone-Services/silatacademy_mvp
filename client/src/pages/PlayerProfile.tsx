import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Printer } from "lucide-react";
import { PlayerHeader } from "@/components/player/PlayerHeader";
import { PlayerStats } from "@/components/player/PlayerStats";
import { PlayerAchievements } from "@/components/player/PlayerAchievements";
import { PlayerHealth } from "@/components/player/PlayerHealth";
import { PlayerTraining } from "@/components/player/PlayerTraining";
import { PlayerAttendance } from "@/components/player/PlayerAttendance";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { toast } from "sonner";

const API_BASE = "https://api-f3rwhuz64a-uc.a.run.app/api/admin";

const normalizePlayer = (p: any) => {
  return {
    id: p._id,
    name: p.name || p.full_name || "Unknown",
    email: p.email || "",
    phone: p.phone || "",
    nationalId: p.nationalId || "",

    belt: p.belt || "White Belt",
    beltColor: p.beltColor || "#ffffff",

    age: p.age || 0,
    height: p.height || "N/A",
    weight: p.weight || "N/A",
    coach: p.coach || "Unknown",

    trainingStartDate: p.trainingStartDate || new Date().toISOString(),
    trainingYears: p.trainingYears || 0,
    currentFocus: p.currentFocus || "No focus assigned",

    stats: p.stats || {
      power: 0,
      flexibility: 0,
      endurance: 0,
      speed: 0,
    },

    achievements: Array.isArray(p.achievements) ? p.achievements : [],

    health: {
      status: p.health?.status || "excellent",
      lastCheckup: p.health?.lastCheckup || new Date().toISOString(),
      injuries: p.health?.injuries || [],
      nutritionPlan: p.health?.nutritionPlan || "Not assigned",
      restSchedule: p.health?.restSchedule || "Not assigned",
      medicalNotes: p.health?.medicalNotes || "",
    },

    trainingLogs: Array.isArray(p.trainingLogs) ? p.trainingLogs : [],
  };
};

const PlayerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [player, setPlayer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  // Fetch the player from the API
  const fetchPlayer = async () => {
    try {
      const res = await fetch(`${API_BASE}/players/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 404) {
        setPlayer(null);
        setLoading(false);
        return;
      }

      const data = await res.json();
      setPlayer(normalizePlayer(data));
    } catch (error) {
      console.error("Player fetch error:", error);
      setPlayer(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchPlayer();
  }, [id]);

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading player data...</p>
      </div>
    );
  }

  // Player not found
  if (!player) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="font-display text-4xl font-bold">Player Not Found</h1>
          <p className="text-muted-foreground">
            The athlete profile you're looking for doesn't exist.
          </p>
          <Button
            onClick={() => navigate("/admin-dashboard")}
            className="bg-primary hover:bg-primary-glow"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const handleGenerateReport = () => {
    toast.success("Generating player report...", {
      description: `Creating comprehensive health & training report for ${player.name}`,
    });

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
          {/* PAGE HEADER */}
          <div className="mb-8 space-y-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/admin-dashboard")}
              className="hover:bg-accent"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
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

          {/* CONTENT */}
          <div className="space-y-6 animate-fade-in">
            {/* HEADER */}
            <PlayerHeader player={player} />

            {/* TWO COLUMN LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left */}
              <div className="space-y-6">
                <PlayerStats player={player} />
                <PlayerHealth player={player} />
              </div>

              {/* Right */}
              <div className="space-y-6">
                <PlayerAchievements player={player} />
                <PlayerTraining player={player} />
              </div>
            </div>

            {/* Attendance */}
            <PlayerAttendance playerId={player.id} />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PlayerProfile;
