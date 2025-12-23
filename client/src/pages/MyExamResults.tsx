import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getMyAttempts } from "@/features/exams/api/getMyAttempts";

export default function MyExamResults() {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res: any = await getMyAttempts();
        const list =
          res?.data?.attempts || res?.data?.data?.attempts || res?.data || [];
        setAttempts(Array.isArray(list) ? list : []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>My Exam Results</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          {attempts.map((a) => {
            const exam = a.exam;
            const theoryPassed = a.theoryPassed;
            const finalized = Boolean(
              a.finalizedAt || a.finalTotalScore !== null
            );

            return (
              <div
                key={a._id}
                className="border rounded-lg p-3 flex items-center justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{exam?.title || "Exam"}</p>
                    <Badge variant="outline" className="capitalize">
                      {exam?.beltLevel || "-"}
                    </Badge>

                    {typeof theoryPassed === "boolean" && (
                      <Badge className="capitalize" variant="outline">
                        Theory: {theoryPassed ? "Passed" : "Failed"}
                      </Badge>
                    )}

                    {finalized && <Badge variant="outline">Finalized</Badge>}
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Theory Score: {a.theoryScore ?? "-"} /{" "}
                    {a.maxTheoryScore ?? "-"} — Pass Mark:{" "}
                    {a.theoryPassMark ?? "-"}
                  </p>

                  {!finalized && (
                    <p className="text-xs text-muted-foreground">
                      Status: Awaiting practical / finalization by admin
                    </p>
                  )}
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    navigate(`/student/exams/results?attempt=${a._id}`)
                  }
                >
                  View
                </Button>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
