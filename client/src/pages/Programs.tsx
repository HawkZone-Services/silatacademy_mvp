import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CertificateGenerator } from "@/components/CertificateGenerator";
import {
  GraduationCap,
  Sword,
  Brain,
  Download,
  Clock,
  Users,
  Target,
  CheckCircle,
} from "lucide-react";

const programs = [
  {
    icon: GraduationCap,
    level: "Beginner Program",
    duration: "3-6 months",
    description:
      "Foundation building with basic stances, Jurus 1-3, coordination drills, and breathing techniques",
    targetAudience: "Ages 8+, No prior experience required",
    classSchedule: "Mon/Wed/Fri: 5:00 PM - 6:30 PM",
    modules: [
      {
        title: "Month 1-2: Foundations",
        topics: [
          "Fundamental stances & postures",
          "Basic footwork patterns",
          "Respect, discipline, and etiquette",
          "Body awareness and coordination",
        ],
      },
      {
        title: "Month 3-4: Jurus Introduction",
        topics: [
          "Jurus 1: Basic movement patterns",
          "Jurus 2: Directional changes",
          "Basic blocking techniques",
          "Breathing and rhythm basics",
        ],
      },
      {
        title: "Month 5-6: Integration",
        topics: [
          "Jurus 3: Combining techniques",
          "Partner coordination drills",
          "Flexibility training",
          "Preparation for yellow belt test",
        ],
      },
    ],
    learningOutcomes: [
      "Proper stance and posture",
      "Basic self-defense awareness",
      "Improved coordination and flexibility",
      "Understanding of Silat principles",
    ],
  },
  {
    icon: Sword,
    level: "Intermediate Program",
    duration: "6-12 months",
    description:
      "Advanced combinations, sparring introduction, Jurus 4-7, and rhythm mastery",
    targetAudience: "Yellow/Green belt holders",
    classSchedule: "Mon/Wed/Fri: 6:45 PM - 8:15 PM",
    modules: [
      {
        title: "Months 1-3: Technique Expansion",
        topics: [
          "Jurus 4-5: Advanced patterns",
          "Combination techniques",
          "Elbow and knee strikes",
          "Defensive movements",
        ],
      },
      {
        title: "Months 4-6: Combat Introduction",
        topics: [
          "Controlled sparring basics",
          "Attack-defense sequences",
          "Timing and distance management",
          "Speed and agility drills",
        ],
      },
      {
        title: "Months 7-12: Mastery Development",
        topics: [
          "Jurus 6-7: Complex movements",
          "Free-form sparring practice",
          "Breathing control under pressure",
          "Competition preparation (optional)",
        ],
      },
    ],
    learningOutcomes: [
      "Complete Jurus 4-7 proficiency",
      "Effective sparring techniques",
      "Enhanced speed and power",
      "Strategic thinking in combat",
    ],
  },
  {
    icon: Brain,
    level: "Advanced Program",
    duration: "12+ months",
    description:
      "Complete mastery with weapons training, philosophy, competition prep, and teaching skills",
    targetAudience: "Blue/Brown belt holders",
    classSchedule: "Tue/Thu: 7:00 PM - 9:00 PM, Sat: 9:00 AM - 12:00 PM",
    modules: [
      {
        title: "Phase 1: Weapons Mastery",
        topics: [
          "Staff (Tongkat) techniques",
          "Kerambit forms and application",
          "Improvised weapon awareness",
          "Weapon vs. empty hand",
        ],
      },
      {
        title: "Phase 2: Philosophy & Ethics",
        topics: [
          "Silat philosophy deep dive",
          "Cultural and historical context",
          "Ethics of martial arts",
          "Spiritual aspects of training",
        ],
      },
      {
        title: "Phase 3: Competition & Teaching",
        topics: [
          "Competition strategy and prep",
          "Tournament experience",
          "Teaching methodology",
          "Instructor development training",
        ],
      },
    ],
    learningOutcomes: [
      "Weapon proficiency",
      "Deep philosophical understanding",
      "Competition readiness",
      "Teaching capabilities",
    ],
  },
];

const Programs = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-gradient-hero opacity-50"></div>
        <div className="container relative z-10 px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/50 border border-secondary/20">
              <GraduationCap className="h-4 w-4 text-secondary" />
              <span className="text-sm font-medium text-secondary">
                Curriculum
              </span>
            </div>
            <h1 className="font-display text-5xl sm:text-6xl font-bold">
              Training <span className="text-secondary">Programs</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Structured learning paths designed to build skills progressively
              from foundation to mastery. Each program is carefully crafted to
              develop technique, mind, and spirit.
            </p>
          </div>
        </div>
      </section>

      {/* Programs Tabs */}
      <section className="py-16">
        <div className="container px-4">
          <Tabs defaultValue="beginner" className="max-w-6xl mx-auto">
            <TabsList className="grid w-full grid-cols-3 mb-12">
              <TabsTrigger value="beginner">Beginner</TabsTrigger>
              <TabsTrigger value="intermediate">Intermediate</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            {programs.map((program, idx) => (
              <TabsContent
                key={idx}
                value={
                  idx === 0
                    ? "beginner"
                    : idx === 1
                    ? "intermediate"
                    : "advanced"
                }
                className="animate-fade-in"
              >
                <Card className="gradient-card shadow-card border-border/40">
                  <div className="p-8 space-y-8">
                    {/* Program Header */}
                    <div className="flex flex-col sm:flex-row gap-6 items-start">
                      <div className="h-16 w-16 rounded-lg bg-accent flex items-center justify-center border border-secondary/20 flex-shrink-0">
                        <program.icon className="h-8 w-8 text-secondary" />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div>
                          <h2 className="font-display text-3xl font-bold mb-2">
                            {program.level}
                          </h2>
                          <p className="text-muted-foreground">
                            {program.description}
                          </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-secondary" />
                            <span>{program.duration}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4 text-secondary" />
                            <span>{program.targetAudience}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Target className="h-4 w-4 text-secondary" />
                            <span>{program.classSchedule}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Modules */}
                    <div className="space-y-6 pt-6 border-t border-border/40">
                      <h3 className="font-display text-xl font-semibold">
                        Curriculum Modules
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {program.modules.map((module, i) => (
                          <Card
                            key={i}
                            className="bg-accent/30 border-border/20"
                          >
                            <div className="p-5 space-y-3">
                              <h4 className="font-semibold text-sm text-secondary">
                                {module.title}
                              </h4>
                              <ul className="space-y-2">
                                {module.topics.map((topic, j) => (
                                  <li
                                    key={j}
                                    className="flex items-start gap-2 text-sm text-muted-foreground"
                                  >
                                    <span className="h-1.5 w-1.5 rounded-full bg-gold/60 mt-1.5 flex-shrink-0"></span>
                                    {topic}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>

                    {/* Learning Outcomes */}
                    <div className="space-y-4 pt-6 border-t border-border/40">
                      <h3 className="font-display text-xl font-semibold flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-secondary" />
                        Learning Outcomes
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {program.learningOutcomes.map((outcome, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 text-sm"
                          >
                            <CheckCircle className="h-4 w-4 text-secondary flex-shrink-0" />
                            <span>{outcome}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border/40">
                      <Button className="flex-1">Enroll in Program</Button>
                      <Button
                        variant="outline"
                        className="flex-1 border-secondary/40 hover:bg-secondary/10"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download Syllabus
                      </Button>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Certificate Generator Section */}
      <section className="py-16 bg-accent/20">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <h2 className="font-display text-3xl font-bold">
                Athletic <span className="text-secondary">Performance</span>
              </h2>
              <p className="text-muted-foreground">
                Celebrate your achievements with an official digital certificate
              </p>
            </div>
            <CertificateGenerator />
          </div>
        </div>
      </section>

      {/* Additional Info Section */}
      <section className="py-16">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="gradient-card shadow-card border-border/40">
              <div className="p-6 space-y-4">
                <h3 className="font-display text-xl font-bold">
                  Private Training
                </h3>
                <p className="text-sm text-muted-foreground">
                  One-on-one sessions with our master instructors for
                  personalized attention and accelerated progress.
                </p>
                <Button variant="outline" className="w-full">
                  Learn More
                </Button>
              </div>
            </Card>
            <Card className="gradient-card shadow-card border-border/40">
              <div className="p-6 space-y-4">
                <h3 className="font-display text-xl font-bold">
                  Online Classes
                </h3>
                <p className="text-sm text-muted-foreground">
                  Access video lessons, live streaming sessions, and digital
                  resources for remote learning.
                </p>
                <Button variant="outline" className="w-full">
                  Access Library
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Programs;
