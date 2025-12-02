import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type ExamCardProps = {
  exam: any;
  onAction?: (exam: any) => void;
  actionLabel?: string;
  disabled?: boolean;
  reason?: string | null;
};

export function ExamCard({ exam, onAction, actionLabel = "View", disabled, reason }: ExamCardProps) {
  return (
    <Card className="border-border/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {exam.title}
          {exam.beltLevel && (
            <Badge variant="outline" className="capitalize text-xs">
              {exam.beltLevel}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm text-muted-foreground">
          {exam.questions?.length || 0} questions • {exam.timeLimit || 0} minutes
        </div>
        {(exam.reasonIfNotEligible || exam.lockedReason || reason) && (
          <div className="text-xs text-red-600">
            {exam.reasonIfNotEligible || exam.lockedReason || reason}
          </div>
        )}
        {onAction && (
          <Button size="sm" disabled={disabled} onClick={() => onAction(exam)}>
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
