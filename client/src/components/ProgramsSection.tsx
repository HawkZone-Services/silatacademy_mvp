import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Sword, Brain, Download } from "lucide-react";

const programs = [
  {
    icon: GraduationCap,
    level: "Beginner Program",
    duration: "3-6 months",
    description:
      "Foundation building with basic stances, Jurus 1-3, coordination drills, and breathing techniques",
    modules: [
      "Fundamental stances & postures",
      "Basic footwork patterns",
      "Jurus 1-3 step-by-step",
      "Coordination & flexibility",
    ],
  },
  {
    icon: Sword,
    level: "Intermediate Program",
    duration: "6-12 months",
    description:
      "Advanced combinations, sparring introduction, Jurus 4-7, and rhythm mastery",
    modules: [
      "Combination techniques",
      "Controlled sparring sessions",
      "Jurus 4-7 mastery",
      "Speed & agility training",
    ],
  },
  {
    icon: Brain,
    level: "Advanced Program",
    duration: "12+ months",
    description:
      "Complete mastery with weapons training, philosophy, competition prep, and teaching skills",
    modules: [
      "Weapon techniques (staff, kerambit)",
      "Silat philosophy & ethics",
      "Competition preparation",
      "Instructor development",
    ],
  },
];

export const ProgramsSection = () => {
  return (
    <section
      id="programs"
      className="py-24 relative overflow-hidden bg-accent/20"
    >
      <div className="container px-4">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-12 space-y-4 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/50 border border-secondary/20">
            <span className="text-sm font-medium text-secondary">
              Curriculum
            </span>
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold">
            Training <span className="text-secondary">Programs</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Structured learning paths designed to build skills progressively
            from foundation to mastery
          </p>
        </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-up">
          {programs.map((program, index) => (
            <Card
              key={program.level}
              className="gradient-card shadow-card border-border/40 overflow-hidden hover:shadow-gold transition-smooth"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="p-6 space-y-6">
                {/* Icon & Header */}
                <div className="space-y-3">
                  <div className="h-12 w-12 rounded-lg bg-accent flex items-center justify-center border border-secondary/20">
                    <program.icon className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold">
                      {program.level}
                    </h3>
                    <p className="text-sm text-secondary">{program.duration}</p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-muted-foreground leading-relaxed">
                  {program.description}
                </p>

                {/* Modules */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Key Modules:</p>
                  <ul className="space-y-1.5">
                    {program.modules.map((module, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-secondary mt-2 flex-shrink-0"></span>
                        <span className="text-sm text-muted-foreground">
                          {module}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Button */}
                <Button
                  variant="outline"
                  className="w-full border-secondary/40 hover:bg-secondary/10 hover:border-secondary"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Syllabus
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
