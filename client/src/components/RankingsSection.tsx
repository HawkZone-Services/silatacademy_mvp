import { Card } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

const belts = [
  {
    name: "White Belt",
    color: "#FFFFFF",
    level: "Beginner",
    requirements: [
      "Basic stances and postures",
      "Fundamental footwork",
      "Introduction to Jurus 1-2",
      "30+ training hours",
    ],
  },
  {
    name: "Yellow Belt",
    color: "#FCD34D",
    level: "Beginner",
    requirements: [
      "Jurus 1-3 mastery",
      "Basic blocking techniques",
      "Coordination exercises",
      "60+ training hours",
    ],
  },
  {
    name: "Green Belt",
    color: "#16A34A",
    level: "Intermediate",
    requirements: [
      "Jurus 4-5 mastery",
      "Sparring introduction",
      "Breathing control",
      "120+ training hours",
    ],
  },
  {
    name: "Blue Belt",
    color: "#1E40AF",
    level: "Intermediate",
    requirements: [
      "Jurus 6-7 mastery",
      "Advanced combinations",
      "Speed and agility training",
      "200+ training hours",
    ],
  },
  {
    name: "Brown Belt",
    color: "#8B4513",
    level: "Advanced",
    requirements: [
      "Complete Jurus mastery",
      "Weapon introduction",
      "Teaching assistance",
      "350+ training hours",
    ],
  },
  {
    name: "Black Belt",
    color: "#1a1a1a",
    level: "Master",
    requirements: [
      "Full technical mastery",
      "Philosophy and ethics",
      "Competition experience",
      "500+ training hours",
    ],
  },
];

export const RankingsSection = () => {
  return (
    <section id="rankings" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[url('/src/assets/pattern-bg.jpg')] bg-repeat"></div>
      </div>

      <div className="container relative z-10 px-4">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-12 space-y-4 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/50 border border-secondary/20">
            <span className="text-sm font-medium text-secondary">
              Belt System
            </span>
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold">
            Path to <span className="text-secondary">Mastery</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Progress through structured grading levels, each representing
            increased skill, discipline, and understanding of Pencak Silat
          </p>
        </div>

        {/* Belts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
          {belts.map((belt, index) => (
            <Card
              key={belt.name}
              className="gradient-card shadow-card border-border/40 overflow-hidden hover:shadow-gold transition-smooth"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="p-6 space-y-4">
                {/* Belt Header */}
                <div className="flex items-center gap-3">
                  <div
                    className="h-16 w-4 rounded-full shadow-md"
                    style={{
                      backgroundColor: belt.color,
                      border:
                        belt.name === "White Belt" ? "2px solid #444" : "none",
                    }}
                  />
                  <div>
                    <h3 className="font-display text-xl font-bold">
                      {belt.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {belt.level}
                    </p>
                  </div>
                </div>

                {/* Requirements */}
                <div className="space-y-2 pt-2">
                  <p className="text-sm font-semibold text-secondary">
                    Requirements:
                  </p>
                  {belt.requirements.map((req, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">
                        {req}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
