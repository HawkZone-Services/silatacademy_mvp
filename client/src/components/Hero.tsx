import { Button } from "@/components/ui/button";
import { PlayCircle, Users } from "lucide-react";
import heroImage from "@/assets/hero-silat.jpg";

export const Hero = () => {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Pencak Silat martial arts training"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background"></div>
      </div>

      {/* Content */}
      <div className="container relative z-10 px-4 py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/50 border border-secondary/20 backdrop-blur-sm">
            <div className="h-2 w-2 rounded-full bg-secondary animate-glow-pulse"></div>
            <span className="text-sm font-medium text-secondary">
              Traditional Heritage Meets Modern Excellence
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
            <span className="text-foreground">Discipline. Heritage.</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-gold">
              Power.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Empowering athletes through traditional Silat wisdom and modern
            sports science
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary-glow shadow-glow text-base font-semibold px-8 py-6 h-auto"
            >
              <Users className="mr-2 h-5 w-5" />
              Join the Academy
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-secondary text-secondary hover:bg-secondary/10 text-base font-semibold px-8 py-6 h-auto"
            >
              <PlayCircle className="mr-2 h-5 w-5" />
              Watch Online Classes
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-12 border-t border-border/40">
            <div className="space-y-1">
              <div className="font-display text-3xl sm:text-4xl font-bold text-secondary">
                500+
              </div>
              <div className="text-sm text-muted-foreground">
                Active Athletes
              </div>
            </div>
            <div className="space-y-1">
              <div className="font-display text-3xl sm:text-4xl font-bold text-secondary">
                15+
              </div>
              <div className="text-sm text-muted-foreground">
                Expert Coaches
              </div>
            </div>
            <div className="space-y-1">
              <div className="font-display text-3xl sm:text-4xl font-bold text-secondary">
                20
              </div>
              <div className="text-sm text-muted-foreground">
                Years Heritage
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10"></div>
    </section>
  );
};
