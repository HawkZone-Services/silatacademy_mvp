import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { coaches } from "@/data/coaches";
import { User, Award, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const CoachesSection = () => {
  return (
    <section id="coaches" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[url('/src/assets/pattern-bg.jpg')] bg-repeat"></div>
      </div>

      <div className="container relative z-10 px-4">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-12 space-y-4 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/50 border border-secondary/20">
            <Award className="h-4 w-4 text-secondary" />
            <span className="text-sm font-medium text-secondary">
              Expert Instructors
            </span>
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold">
            World-Class <span className="text-secondary">Coaches</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Learn from champions who bring decades of experience, international
            recognition, and a passion for developing the next generation of
            Silat practitioners
          </p>
        </div>

        {/* Coaches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up">
          {coaches.map((coach, index) => (
            <Card
              key={coach.id}
              className="gradient-card shadow-card border-border/40 overflow-hidden hover:shadow-gold transition-smooth group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="p-6 space-y-4">
                {/* Coach Avatar */}
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="h-24 w-24 rounded-full bg-accent flex items-center justify-center border-2 border-secondary/20 group-hover:border-secondary/40 transition-smooth">
                    <User className="h-12 w-12 text-secondary/40" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold">
                      {coach.name}
                    </h3>
                    <p className="text-xs text-secondary font-medium">
                      {coach.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {coach.experience}+ years experience
                    </p>
                  </div>
                </div>

                {/* Specializations */}
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {coach.specialization.slice(0, 2).map((spec, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className="border-secondary/40 text-xs"
                    >
                      {spec}
                    </Badge>
                  ))}
                </div>

                {/* Top Achievement */}
                <div className="pt-3 border-t border-border/40">
                  <p className="text-xs text-muted-foreground text-center line-clamp-2">
                    {coach.achievements[0]}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link to="/coaches">
            <Button
              size="lg"
              variant="outline"
              className="border-secondary/40 hover:bg-secondary/10 hover:border-secondary"
            >
              View All Coaches
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
