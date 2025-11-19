import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, FileText, Award } from "lucide-react";

interface ExamCardProps {
  exam: {
    id: string;
    title: string;
    description?: string;
    beltLevel: string;
    duration: number;
    passingScore: number;
    totalQuestions: number;
    type: string;
    status: "none" | "pending" | "approved" | "rejected";
  };
  onRegister: (examId: string) => void;
  onStart: (examId: string) => void;
}

export const ExamCard = ({ exam, onRegister, onStart }: ExamCardProps) => {
  const renderButton = () => {
    // 🟦 NOT REGISTERED
    if (exam.status === "none") {
      return (
        <Button className="w-full mt-4" onClick={() => onRegister(exam.id)}>
          Register for Exam
        </Button>
      );
    }

    // 🟨 PENDING APPROVAL
    if (exam.status === "pending") {
      return (
        <Button className="w-full mt-4" disabled variant="secondary">
          Waiting for instructor approval...
        </Button>
      );
    }

    // 🟥 REJECTED
    if (exam.status === "rejected") {
      return (
        <Button className="w-full mt-4" disabled variant="destructive">
          Registration rejected
        </Button>
      );
    }

    // 🟩 APPROVED → START EXAM
    if (exam.status === "approved") {
      return (
        <Button className="w-full mt-4" onClick={() => onStart(exam.id)}>
          Start Exam
        </Button>
      );
    }
  };

  return (
    <Card className="gradient-card shadow-card border-border/40 hover:shadow-gold transition-smooth">
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>

          <Badge
            variant="outline"
            className="border-secondary/40 text-secondary capitalize"
          >
            {exam.beltLevel} Belt
          </Badge>
        </div>

        <CardTitle className="text-xl">{exam.title}</CardTitle>
        <CardDescription>{exam.description || ""}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Exam Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4 text-secondary" />
              <span>Duration</span>
            </div>
            <p className="font-semibold">{exam.duration} minutes</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Award className="h-4 w-4 text-secondary" />
              <span>Passing Score</span>
            </div>
            <p className="font-semibold">{exam.passingScore}%</p>
          </div>
        </div>

        {/* Extra Info */}
        <div className="pt-4 border-t border-border/40">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Questions</span>
            <span className="font-medium">{exam.totalQuestions}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Type</span>
            <Badge variant="outline" className="capitalize">
              {exam.type}
            </Badge>
          </div>
        </div>

        {/* Dynamic Button */}
        {renderButton()}
      </CardContent>
    </Card>
  );
};
