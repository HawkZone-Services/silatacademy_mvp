import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { coaches } from "@/data/coaches";
import { Award, Mail, Phone, BookOpen, Trophy, User } from "lucide-react";

const Coaches = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-gradient-hero opacity-50"></div>
        <div className="container relative z-10 px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/50 border border-secondary/20">
              <Award className="h-4 w-4 text-secondary" />
              <span className="text-sm font-medium text-secondary">
                Expert Instructors
              </span>
            </div>
            <h1 className="font-display text-5xl sm:text-6xl font-bold">
              Our <span className="text-secondary">Coaches</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Learn from world-class instructors who bring decades of
              experience, championship titles, and a passion for developing the
              next generation of Silat practitioners.
            </p>
          </div>
        </div>
      </section>

      {/* Coaches Grid */}
      <section className="py-16">
        <div className="container px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-slide-up">
            {coaches.map((coach, index) => (
              <Card
                key={coach.id}
                className="gradient-card shadow-card border-border/40 overflow-hidden hover:shadow-gold transition-smooth"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="p-8 space-y-6">
                  {/* Gallery Carousel */}
                  <div className="relative">
                    <Carousel className="w-full">
                      <CarouselContent>
                        {coach.gallery.map((image, i) => (
                          <CarouselItem key={i}>
                            <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-secondary/20">
                              <img
                                src={image}
                                alt={`${coach.name} training moment ${i + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious className="left-2" />
                      <CarouselNext className="right-2" />
                    </Carousel>
                  </div>

                  {/* Coach Header */}
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="h-32 w-32 rounded-lg bg-accent flex items-center justify-center border-2 border-secondary/20 flex-shrink-0">
                      <User className="h-16 w-16 text-secondary/40" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div>
                        <h2 className="font-display text-2xl font-bold">
                          {coach.name}
                        </h2>
                        <p className="text-secondary font-medium">
                          {coach.title}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {coach.experience} years of experience
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {coach.specialization.map((spec, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="border-secondary/40"
                          >
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {coach.bio}
                    </p>
                  </div>

                  {/* Achievements */}
                  <div className="space-y-3 pt-4 border-t border-border/40">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-secondary" />
                      Notable Achievements
                    </h3>
                    <ul className="space-y-2">
                      {coach.achievements.map((achievement, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-gold/60 mt-1.5 flex-shrink-0"></span>
                          {achievement}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Certifications */}
                  <div className="space-y-3 pt-4 border-t border-border/40">
                    <h3 className="font-semibold flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-secondary" />
                      Certifications
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {coach.certifications.map((cert, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-secondary mt-1.5 flex-shrink-0"></span>
                          {cert}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border/40">
                    <Button variant="outline" className="flex-1" size="sm">
                      <Mail className="mr-2 h-4 w-4" />
                      {coach.email}
                    </Button>
                    <Button variant="outline" className="flex-1" size="sm">
                      <Phone className="mr-2 h-4 w-4" />
                      {coach.phone}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-accent/20">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="font-display text-3xl font-bold">
              Train with the <span className="text-secondary">Best</span>
            </h2>
            <p className="text-muted-foreground">
              Our instructors are committed to your growth, bringing expertise,
              patience, and dedication to every session. Start your journey with
              guidance from champions.
            </p>
            <Button size="lg" className="mt-4">
              Schedule a Trial Class
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Coaches;
