import { Shield, Target, Users, Award } from "lucide-react";
import trainingHallImage from "@/assets/training-hall.jpg";

const values = [
  {
    icon: Shield,
    title: "Discipline",
    description:
      "Building mental fortitude and physical resilience through traditional Silat training",
  },
  {
    icon: Target,
    title: "Precision",
    description: "Mastering every movement with accuracy and controlled power",
  },
  {
    icon: Users,
    title: "Community",
    description:
      "Creating a supportive environment where warriors grow together",
  },
  {
    icon: Award,
    title: "Excellence",
    description:
      "Striving for continuous improvement in technique and character",
  },
];

export const AboutSection = () => {
  return (
    <section id="about" className="py-24 relative overflow-hidden">
      <div className="container px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image Side */}
          <div className="relative animate-fade-in">
            <div className="relative rounded-2xl overflow-hidden shadow-card">
              <img
                src={trainingHallImage}
                alt="Pencak Silat training hall"
                className="w-full h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent"></div>

              {/* Floating Stats */}
              <div className="absolute bottom-8 left-8 right-8 grid grid-cols-2 gap-4">
                <div className="bg-card/90 backdrop-blur-sm rounded-lg p-4 border border-border/40">
                  <div className="font-display text-3xl font-bold text-secondary">
                    20+
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Years of Excellence
                  </div>
                </div>
                <div className="bg-card/90 backdrop-blur-sm rounded-lg p-4 border border-border/40">
                  <div className="font-display text-3xl font-bold text-secondary">
                    500+
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Trained Athletes
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Side */}
          <div className="space-y-8 animate-slide-up">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/50 border border-secondary/20">
                <span className="text-sm font-medium text-secondary">
                  Our Heritage
                </span>
              </div>
              <h2 className="font-display text-4xl sm:text-5xl font-bold leading-tight">
                Rooted in Tradition,{" "}
                <span className="text-secondary">Built for Champions</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Our academy honors the ancient Southeast Asian martial art of
                Pencak Silat while integrating modern sports science and
                performance monitoring. We train athletes of all levels through
                structured curriculums, certified instructors, and data-driven
                development programs.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                From beginners to national champions, every student receives
                personalized attention, comprehensive health monitoring, and a
                path to mastery grounded in physical excellence, mental
                discipline, and ethical development.
              </p>
            </div>

            {/* Values Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              {values.map((value) => (
                <div
                  key={value.title}
                  className="p-4 rounded-lg bg-accent/30 border border-border/40 hover:border-secondary/40 transition-smooth group"
                >
                  <value.icon className="h-8 w-8 text-secondary mb-3 group-hover:scale-110 transition-smooth" />
                  <h3 className="font-display font-bold mb-1">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
