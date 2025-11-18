import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Users,
  BookOpen,
  CheckCircle,
  Clock,
  Plus,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { players } from "@/data/players";

const InstructorDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [examForm, setExamForm] = useState({
    title: "",
    description: "",
    timeLimit: "",
    questions: "",
  });

  const stats = [
    {
      title: "Total Students",
      value: "45",
      icon: Users,
      color: "text-primary",
    },
    {
      title: "Active Classes",
      value: "8",
      icon: BookOpen,
      color: "text-secondary",
    },
    {
      title: "Completed Exams",
      value: "23",
      icon: CheckCircle,
      color: "text-green-500",
    },
    {
      title: "Pending Reviews",
      value: "5",
      icon: Clock,
      color: "text-orange-500",
    },
  ];

  const mockSubmissions = [
    {
      id: 1,
      student: "Ahmad Rizki",
      exam: "Belt Promotion - Green",
      score: 85,
      status: "graded",
      date: "2024-01-15",
    },
    {
      id: 2,
      student: "Siti Nurhaliza",
      exam: "Advanced Techniques",
      score: null,
      status: "pending",
      date: "2024-01-14",
    },
    {
      id: 3,
      student: "Budi Santoso",
      exam: "Basic Forms",
      score: 92,
      status: "graded",
      date: "2024-01-13",
    },
    {
      id: 4,
      student: "Dewi Lestari",
      exam: "Sparring Assessment",
      score: null,
      status: "pending",
      date: "2024-01-12",
    },
  ];

  const filteredPlayers = players.filter(
    (player) =>
      player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Exam Created!", {
      description: `${examForm.title} has been created and assigned to students.`,
    });
    setExamForm({ title: "", description: "", timeLimit: "", questions: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-16">
        <div className="container px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">
              Instructor Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage your students, create exams, and track progress
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => (
              <Card
                key={stat.title}
                className="gradient-card shadow-card border-border/40 p-6"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {stat.title}
                    </p>
                    <p className="font-display text-3xl font-bold">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`h-12 w-12 rounded-lg bg-accent flex items-center justify-center border border-secondary/20`}
                  >
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="students" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
              <TabsTrigger value="students">Students</TabsTrigger>
              <TabsTrigger value="exams">Create Exam</TabsTrigger>
              <TabsTrigger value="submissions">Submissions</TabsTrigger>
            </TabsList>

            {/* Students Tab */}
            <TabsContent value="students" className="space-y-4">
              <Card className="gradient-card shadow-card border-border/40 p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search students by name or ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="border border-border/40 rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-accent/20">
                          <TableHead>Name</TableHead>
                          <TableHead>Belt</TableHead>
                          <TableHead>Age</TableHead>
                          <TableHead>Level</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPlayers.slice(0, 10).map((player) => (
                          <TableRow key={player.id}>
                            <TableCell className="font-medium">
                              {player.name}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{player.belt}</Badge>
                            </TableCell>
                            <TableCell>{player.age}</TableCell>
                            <TableCell>{player.belt}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">
                                View Profile
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Create Exam Tab */}
            <TabsContent value="exams">
              <Card className="gradient-card shadow-card border-border/40 p-6">
                <form onSubmit={handleCreateExam} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Exam Title</Label>
                    <Input
                      id="title"
                      value={examForm.title}
                      onChange={(e) =>
                        setExamForm({ ...examForm, title: e.target.value })
                      }
                      placeholder="e.g., Belt Promotion - Blue Belt"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={examForm.description}
                      onChange={(e) =>
                        setExamForm({
                          ...examForm,
                          description: e.target.value,
                        })
                      }
                      placeholder="Describe what this exam will cover..."
                      rows={4}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                      <Input
                        id="timeLimit"
                        type="number"
                        value={examForm.timeLimit}
                        onChange={(e) =>
                          setExamForm({
                            ...examForm,
                            timeLimit: e.target.value,
                          })
                        }
                        placeholder="60"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="questions">Number of Questions</Label>
                      <Input
                        id="questions"
                        type="number"
                        value={examForm.questions}
                        onChange={(e) =>
                          setExamForm({
                            ...examForm,
                            questions: e.target.value,
                          })
                        }
                        placeholder="20"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary-glow"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Exam
                  </Button>
                </form>
              </Card>
            </TabsContent>

            {/* Submissions Tab */}
            <TabsContent value="submissions">
              <Card className="gradient-card shadow-card border-border/40 p-6">
                <div className="border border-border/40 rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-accent/20">
                        <TableHead>Student</TableHead>
                        <TableHead>Exam</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockSubmissions.map((submission) => (
                        <TableRow key={submission.id}>
                          <TableCell className="font-medium">
                            {submission.student}
                          </TableCell>
                          <TableCell>{submission.exam}</TableCell>
                          <TableCell>
                            {new Date(submission.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {submission.score ? `${submission.score}%` : "—"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                submission.status === "graded"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {submission.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              {submission.status === "pending"
                                ? "Grade"
                                : "Review"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default InstructorDashboard;
