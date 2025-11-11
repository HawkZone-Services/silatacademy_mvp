import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  Video,
  Heart,
  FileText,
  Download,
  Play,
  Search,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const trainingManuals = [
  {
    id: 1,
    title: "Fundamental Stances & Footwork",
    category: "Beginner",
    size: "2.4 MB",
    pages: 24,
  },
  {
    id: 2,
    title: "Jurus 1-5 Complete Guide",
    category: "Intermediate",
    size: "5.1 MB",
    pages: 48,
  },
  {
    id: 3,
    title: "Advanced Weapon Techniques",
    category: "Advanced",
    size: "3.8 MB",
    pages: 36,
  },
  {
    id: 4,
    title: "Sparring Strategies & Tactics",
    category: "Intermediate",
    size: "2.9 MB",
    pages: 28,
  },
];

const videoTutorials = [
  {
    id: 1,
    title: "White Belt Fundamentals",
    duration: "15:32",
    level: "Beginner",
    views: "1.2K",
  },
  {
    id: 2,
    title: "Jurus 3 Step-by-Step",
    duration: "22:45",
    level: "Intermediate",
    views: "856",
  },
  {
    id: 3,
    title: "Staff (Tongkat) Basics",
    duration: "18:20",
    level: "Advanced",
    views: "642",
  },
  {
    id: 4,
    title: "Breathing & Meditation",
    duration: "12:15",
    level: "All Levels",
    views: "2.1K",
  },
];

const philosophyArticles = [
  {
    id: "silat-philosophy",
    title: "The Philosophy of Pencak Silat",
    author: "Master Ahmad Rahman",
    date: "2024-01-15",
  },
  {
    id: "training-basics",
    title: "Essential Training Fundamentals",
    author: "Coach Sarah Lee",
    date: "2024-02-20",
  },
  {
    id: "mental-preparation",
    title: "Mental Preparation for Testing",
    author: "Coach Michael Tan",
    date: "2024-03-10",
  },
];

const testingGuidelines = [
  {
    id: 1,
    title: "Belt Testing Requirements Overview",
    category: "General",
    size: "1.2 MB",
  },
  {
    id: 2,
    title: "White to Yellow Belt Criteria",
    category: "Beginner",
    size: "0.8 MB",
  },
  {
    id: 3,
    title: "Intermediate Belt Progression",
    category: "Intermediate",
    size: "1.5 MB",
  },
  {
    id: 4,
    title: "Black Belt Examination Guide",
    category: "Advanced",
    size: "2.1 MB",
  },
];

const Library = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-gradient-hero opacity-50"></div>
        <div className="container relative z-10 px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/50 border border-secondary/20">
              <BookOpen className="h-4 w-4 text-secondary" />
              <span className="text-sm font-medium text-secondary">
                Learning Hub
              </span>
            </div>
            <h1 className="font-display text-5xl sm:text-6xl font-bold">
              Knowledge <span className="text-secondary">Library</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Access training manuals, video tutorials, philosophy articles, and
              testing guidelines to support your Silat journey.
            </p>
          </div>
        </div>
      </section>

      {/* Search Bar */}
      <section className="py-8 border-b border-border/40">
        <div className="container px-4">
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 bg-background text-lg"
            />
          </div>
        </div>
      </section>

      {/* Library Content */}
      <section className="py-16">
        <div className="container px-4">
          <Tabs defaultValue="manuals" className="space-y-8">
            <TabsList className="grid w-full max-w-3xl mx-auto grid-cols-2 lg:grid-cols-4 h-auto bg-accent/30">
              <TabsTrigger
                value="manuals"
                className="flex items-center gap-2 py-3"
              >
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Training Manuals</span>
                <span className="sm:hidden">Manuals</span>
              </TabsTrigger>
              <TabsTrigger
                value="videos"
                className="flex items-center gap-2 py-3"
              >
                <Video className="h-4 w-4" />
                <span className="hidden sm:inline">Video Tutorials</span>
                <span className="sm:hidden">Videos</span>
              </TabsTrigger>
              <TabsTrigger
                value="philosophy"
                className="flex items-center gap-2 py-3"
              >
                <Heart className="h-4 w-4" />
                <span className="hidden sm:inline">Philosophy</span>
                <span className="sm:hidden">Philosophy</span>
              </TabsTrigger>
              <TabsTrigger
                value="testing"
                className="flex items-center gap-2 py-3"
              >
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Testing Guidelines</span>
                <span className="sm:hidden">Testing</span>
              </TabsTrigger>
            </TabsList>

            {/* Training Manuals */}
            <TabsContent value="manuals" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trainingManuals.map((manual) => (
                  <Card
                    key={manual.id}
                    className="gradient-card shadow-card border-border/40 overflow-hidden hover:shadow-gold transition-smooth"
                  >
                    <div className="p-6 space-y-4">
                      <div className="h-32 bg-accent/20 rounded-lg flex items-center justify-center border border-border/40">
                        <FileText className="h-12 w-12 text-secondary/40" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-display text-lg font-bold">
                          {manual.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="px-2 py-1 rounded bg-accent/30 border border-border/40">
                            {manual.category}
                          </span>
                          <span>{manual.pages} pages</span>
                          <span>•</span>
                          <span>{manual.size}</span>
                        </div>
                      </div>
                      <Button className="w-full" variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Video Tutorials */}
            <TabsContent value="videos" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videoTutorials.map((video) => (
                  <Card
                    key={video.id}
                    className="gradient-card shadow-card border-border/40 overflow-hidden hover:shadow-gold transition-smooth"
                  >
                    <div className="p-6 space-y-4">
                      <div className="relative h-40 bg-accent/20 rounded-lg flex items-center justify-center border border-border/40 group cursor-pointer">
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-smooth rounded-lg" />
                        <Play className="h-16 w-16 text-white relative z-10" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-display text-lg font-bold">
                          {video.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="px-2 py-1 rounded bg-accent/30 border border-border/40">
                            {video.level}
                          </span>
                          <span>{video.duration}</span>
                          <span>•</span>
                          <span>{video.views} views</span>
                        </div>
                      </div>
                      <Button className="w-full">
                        <Play className="mr-2 h-4 w-4" />
                        Watch Video
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Philosophy & Culture */}
            <TabsContent value="philosophy" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {philosophyArticles.map((article) => (
                  <Card
                    key={article.id}
                    className="gradient-card shadow-card border-border/40 overflow-hidden hover:shadow-gold transition-smooth"
                  >
                    <div className="p-6 space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-lg bg-accent/20 flex items-center justify-center border border-border/40 flex-shrink-0">
                          <Heart className="h-6 w-6 text-secondary/40" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <h3 className="font-display text-lg font-bold">
                            {article.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            By {article.author} • {article.date}
                          </p>
                        </div>
                      </div>
                      <Link to={`/library/article/${article.id}`}>
                        <Button className="w-full" variant="outline">
                          Read Article
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Testing Guidelines */}
            <TabsContent value="testing" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {testingGuidelines.map((guide) => (
                  <Card
                    key={guide.id}
                    className="gradient-card shadow-card border-border/40 overflow-hidden hover:shadow-gold transition-smooth"
                  >
                    <div className="p-6 space-y-4">
                      <div className="h-32 bg-accent/20 rounded-lg flex items-center justify-center border border-border/40">
                        <BookOpen className="h-12 w-12 text-secondary/40" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-display text-lg font-bold">
                          {guide.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="px-2 py-1 rounded bg-accent/30 border border-border/40">
                            {guide.category}
                          </span>
                          <span>{guide.size}</span>
                        </div>
                      </div>
                      <Button className="w-full" variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Library;
