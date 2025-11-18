import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Download } from "lucide-react";
import { ExamResult } from "@/data/exams";
import { useToast } from "@/hooks/use-toast";

interface ExamResultCardProps {
  result: ExamResult;
  examTitle: string;
}

export const ExamResultCard = ({ result, examTitle }: ExamResultCardProps) => {
  const { toast } = useToast();
  const scorePercentage = (result.score / result.totalQuestions) * 100;

  const handleDownloadCertificate = () => {
    toast({
      title: "Certificate Downloaded",
      description: "Your certificate has been downloaded successfully.",
    });
  };

  return (
    <Card className="gradient-card shadow-card border-border/40">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{examTitle}</CardTitle>
          <Badge
            variant="outline"
            className={
              result.passed
                ? "border-green-500/40 text-green-400"
                : "border-red-500/40 text-red-400"
            }
          >
            {result.passed ? (
              <CheckCircle className="h-3 w-3 mr-1" />
            ) : (
              <XCircle className="h-3 w-3 mr-1" />
            )}
            {result.passed ? "Passed" : "Failed"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Score</p>
            <p className="text-2xl font-bold text-primary">
              {scorePercentage}%
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Correct Answers</p>
            <p className="text-2xl font-bold">
              {result.score}/{result.totalQuestions}
            </p>
          </div>
        </div>

        {result.theoryScore !== undefined && (
          <div className="pt-4 border-t border-border/40">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Theory Score</span>
              <span className="font-medium">{result.theoryScore}%</span>
            </div>
          </div>
        )}

        {result.practicalScore !== undefined && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Practical Score</span>
            <span className="font-medium">{result.practicalScore}%</span>
          </div>
        )}

        <div className="pt-2">
          <p className="text-sm text-muted-foreground">
            Completed:{" "}
            {new Date(result.completedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        {result.passed && (
          <Button
            className="w-full mt-4"
            variant="outline"
            onClick={handleDownloadCertificate}
          >
            <Download className="h-4 w-4 mr-2" />
            Download Certificate
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
