import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, Trophy, BookOpen, Users } from "lucide-react";
import { RegisterTestingDialog } from "@/components/RegisterTestingDialog";
import { EligiblePlayersDialog } from "@/components/EligiblePlayersDialog";

const belts = [
  {
    name: "White Belt",
    color: "#FFFFFF",
    level: "Beginner",
    duration: "3-6 months",
    requirements: [
      "Basic stances and postures",
      "Fundamental footwork",
      "Introduction to Jurus 1-2",
      "30+ training hours",
    ],
    technicalSkills: [
      "Horse stance (Kuda-kuda)",
      "Basic blocks (Tangkisan)",
      "Front stance (Sikap Depan)",
    ],
    testingCriteria:
      "Demonstrate basic stances, perform Jurus 1-2 with guidance, show proper etiquette",
  },
  {
    name: "Yellow Belt",
    color: "#FCD34D",
    level: "Beginner",
    duration: "6-9 months",
    requirements: [
      "Jurus 1-3 mastery",
      "Basic blocking techniques",
      "Coordination exercises",
      "60+ training hours",
    ],
    technicalSkills: [
      "Upper and lower blocks",
      "Basic strikes (Pukulan)",
      "Side stance variations",
    ],
    testingCriteria:
      "Independent performance of Jurus 1-3, demonstrate blocking techniques, coordination drills",
  },
  {
    name: "Green Belt",
    color: "#16A34A",
    level: "Intermediate",
    duration: "9-12 months",
    requirements: [
      "Jurus 4-5 mastery",
      "Sparring introduction",
      "Breathing control",
      "120+ training hours",
    ],
    technicalSkills: [
      "Elbow strikes (Sikuan)",
      "Knee techniques",
      "Basic sweeps (Sapu)",
    ],
    testingCriteria:
      "Jurus 4-5 with precision, controlled sparring demonstration, breathing techniques",
  },
  {
    name: "Blue Belt",
    color: "#1E40AF",
    level: "Intermediate",
    duration: "12-15 months",
    requirements: [
      "Jurus 6-7 mastery",
      "Advanced combinations",
      "Speed and agility training",
      "200+ training hours",
    ],
    technicalSkills: [
      "Combination strikes",
      "Defense-counter sequences",
      "Ground techniques basics",
    ],
    testingCriteria:
      "Complete Jurus 6-7 with speed, demonstrate 5+ combinations, sparring assessment",
  },
  {
    name: "Brown Belt",
    color: "#8B4513",
    level: "Advanced",
    duration: "15-24 months",
    requirements: [
      "Complete Jurus mastery",
      "Weapon introduction",
      "Teaching assistance",
      "350+ training hours",
    ],
    technicalSkills: [
      "Staff (Tongkat) basics",
      "Kerambit introduction",
      "Advanced grappling",
    ],
    testingCriteria:
      "All Jurus demonstration, weapon forms, assist in teaching beginners, written test",
  },
  {
    name: "Black Belt",
    color: "#1a1a1a",
    level: "Master",
    duration: "24+ months",
    requirements: [
      "Full technical mastery",
      "Philosophy and ethics",
      "Competition experience",
      "500+ training hours",
    ],
    technicalSkills: [
      "Complete weapon mastery",
      "Teaching methodology",
      "Philosophy deep dive",
    ],
    testingCriteria:
      "Comprehensive technical exam, philosophy oral exam, competition record, teaching demonstration",
  },
];

const Rankings = () => {
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [eligibleDialogOpen, setEligibleDialogOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-gradient-hero opacity-50"></div>
        <div className="container relative z-10 px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/50 border border-secondary/20">
              <Trophy className="h-4 w-4 text-secondary" />
              <span className="text-sm font-medium text-secondary">
                Belt System
              </span>
            </div>
            <h1 className="font-display text-5xl sm:text-6xl font-bold">
              Path to <span className="text-secondary">Mastery</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our structured ranking system ensures progressive skill
              development, from fundamentals to mastery. Each belt represents
              dedication, discipline, and technical excellence.
            </p>
          </div>
        </div>
      </section>

      {/* Belts Grid */}
      <section className="py-16 relative">
        <div className="container px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
            {belts.map((belt, index) => (
              <Card
                key={belt.name}
                className="gradient-card shadow-card border-border/40 overflow-hidden hover:shadow-gold transition-smooth"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="p-6 space-y-6">
                  {/* Belt Header */}
                  <div className="flex items-center gap-3">
                    <div
                      className="h-20 w-5 rounded-full shadow-md"
                      style={{
                        backgroundColor: belt.color,
                        border:
                          belt.name === "White Belt"
                            ? "2px solid #444"
                            : "none",
                      }}
                    />
                    <div>
                      <h3 className="font-display text-2xl font-bold">
                        {belt.name}
                      </h3>
                      <p className="text-sm text-secondary">{belt.level}</p>
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{belt.duration}</span>
                      </div>
                    </div>
                  </div>

                  {/* Requirements */}
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-secondary flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Requirements:
                    </p>
                    <ul className="space-y-1.5">
                      {belt.requirements.map((req, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-secondary mt-1.5 flex-shrink-0"></span>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Technical Skills */}
                  <div className="space-y-2">
                    <p className="text-sm font-semibold flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Technical Skills:
                    </p>
                    <ul className="space-y-1.5">
                      {belt.technicalSkills.map((skill, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-gold/60 mt-1.5 flex-shrink-0"></span>
                          {skill}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Testing Criteria */}
                  <div className="pt-4 border-t border-border/40">
                    <p className="text-xs font-semibold mb-2">
                      Testing Criteria:
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {belt.testingCriteria}
                    </p>
                  </div>

                  {/* Action Button */}
                  <Button
                    variant="outline"
                    className="w-full border-secondary/40 hover:bg-secondary/10 hover:border-secondary"
                    onClick={() => setEligibleDialogOpen(true)}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    View Eligible Players
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testing Schedule Section */}
      <section className="py-16 bg-accent/20">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-center mb-12">
              Testing <span className="text-secondary">Schedule</span>
            </h2>
            <Card className="gradient-card shadow-card border-border/40">
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">
                      Regular Testing Dates
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-secondary" />
                        Every 3 months for beginner belts
                      </li>
                      <li className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-secondary" />
                        Every 6 months for intermediate/advanced
                      </li>
                      <li className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-secondary" />
                        Annual black belt examinations
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Requirements to Test</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-secondary" />
                        Minimum training hours met
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-secondary" />
                        Instructor recommendation
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-secondary" />
                        Up-to-date membership & fees
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="pt-4 border-t border-border/40">
                  <Button
                    className="w-full sm:w-auto"
                    onClick={() => setRegisterDialogOpen(true)}
                  >
                    <Trophy className="mr-2 h-4 w-4" />
                    Register for Next Testing
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <Footer />

      {/* Dialogs */}
      <RegisterTestingDialog
        open={registerDialogOpen}
        onOpenChange={setRegisterDialogOpen}
      />
      <EligiblePlayersDialog
        open={eligibleDialogOpen}
        onOpenChange={setEligibleDialogOpen}
      />
    </div>
  );
};

export default Rankings;
