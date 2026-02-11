import { Card } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";

export function SubmissionsList({ list = [], onSelect }) {
  if (!list.length) {
    return <p className="text-muted-foreground">No submissions</p>;
  }

  return (
    <div className="space-y-2">
      {list.map((sub) => {
        const theoryPassed = Boolean(sub.theoryPassed);

        return (
          <Card key={sub._id} className="p-3 flex justify-between">
            <div>
              <p className="font-semibold">{sub.student?.name}</p>
              <p className="text-xs">Score: {sub.theoryScore}</p>

              <Badge variant={theoryPassed ? "secondary" : "destructive"}>
                {theoryPassed ? "Passed" : "Failed"}
              </Badge>
            </div>

            <Button
              size="sm"
              disabled={!theoryPassed}
              onClick={() => theoryPassed && onSelect(sub.student._id)}
            >
              {theoryPassed ? "Evaluate Practical" : "Blocked"}
            </Button>
          </Card>
        );
      })}
    </div>
  );
}
