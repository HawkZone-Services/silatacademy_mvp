import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

import programService from "@/services/programService";

const programIcons: Record<string, any> = {
  beginner: GraduationCap,
  intermediate: Sword,
  advanced: Brain,
};

const Programs = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🟢 Load programs dynamically
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await programService.getPrograms();
        console.log("Programs response:", response);

        if (!response?.success) {
          console.error("Failed to load programs");
          setPrograms([]);
        } else {
          setPrograms(response.programs || []);
        }
      } catch (err) {
        console.error("Error loading programs:", err);
        setPrograms([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg">
        Loading programs...
      </div>
    );
  }

  // ترتيب البرامج بحسب مستوياتك:
  const tabsOrder = [
    "Beginner Program",
    "Intermediate Program",
    "Advanced Program",
  ];
  const getTabKey = (i: number) =>
    i === 0 ? "beginner" : i === 1 ? "intermediate" : "advanced";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative py-24 overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-gradient-hero opacity-50" />
        <div className="container relative z-10 px-4 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/50 border border-secondary/20">
            <GraduationCap className="h-4 w-4 text-secondary" />
            <span className="text-sm text-secondary font-medium">
              Curriculum
            </span>
          </div>

          <h1 className="font-display text-5xl sm:text-6xl font-bold">
            Training <span className="text-secondary">Programs</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Structured learning paths designed to build skills progressively
            from foundation to mastery.
          </p>
        </div>
      </section>

      {/* Tabs */}
      <section className="py-16">
        <div className="container px-4">
          <Tabs defaultValue="beginner" className="max-w-6xl mx-auto">
            <TabsList className="grid w-full grid-cols-3 mb-12">
              <TabsTrigger value="beginner">Beginner</TabsTrigger>
              <TabsTrigger value="intermediate">Intermediate</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            {programs.map((program: any, index: number) => {
              const tabKey = getTabKey(index);
              const Icon = programIcons[tabKey] || GraduationCap;

              return (
                <TabsContent
                  key={program._id}
                  value={tabKey}
                  className="animate-fade-in"
                >
                  <Card className="gradient-card shadow-card border-border/40">
                    <div className="p-8 space-y-8">
                      {/* Header */}
                      <div className="flex flex-col sm:flex-row gap-6 items-start">
                        <div className="h-16 w-16 rounded-lg bg-accent flex items-center justify-center border border-secondary/20">
                          <Icon className="h-8 w-8 text-secondary" />
                        </div>

                        <div className="flex-1 space-y-3">
                          <h2 className="font-display text-3xl font-bold">
                            {program.title}
                          </h2>

                          <p className="text-muted-foreground">
                            {program.description}
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="w-4 h-4 text-secondary" />
                              <span>{program.duration}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Users className="w-4 h-4 text-secondary" />
                              <span>{program.targetAudience}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Target className="w-4 h-4 text-secondary" />
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
                          {program.modules?.map((module: any, i: number) => (
                            <Card
                              key={i}
                              className="bg-accent/30 border-border/20"
                            >
                              <div className="p-5 space-y-3">
                                <h4 className="font-semibold text-sm text-secondary">
                                  {module.title}
                                </h4>

                                <ul className="space-y-2">
                                  {module.topics?.map(
                                    (topic: string, j: number) => (
                                      <li
                                        key={j}
                                        className="flex items-start gap-2 text-sm text-muted-foreground"
                                      >
                                        <span className="h-1.5 w-1.5 rounded-full bg-gold/60 mt-1.5"></span>
                                        {topic}
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>

                      {/* Outcomes */}
                      <div className="space-y-4 pt-6 border-t border-border/40">
                        <h3 className="font-display text-xl font-semibold flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-secondary" />
                          Learning Outcomes
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {program.learningOutcomes?.map(
                            (outcome: string, i: number) => (
                              <div
                                key={i}
                                className="flex items-center gap-2 text-sm"
                              >
                                <CheckCircle className="h-4 w-4 text-secondary" />
                                <span>{outcome}</span>
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      {/* Buttons */}
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
              );
            })}
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Programs;
