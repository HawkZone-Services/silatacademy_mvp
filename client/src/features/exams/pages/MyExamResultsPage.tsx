import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { API_BASE_URL } from "@/shared/api/apiClient";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import examService from "@/services/examService";

export default function MyExamResultsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  /* =========================
     FETCH MY EXAM RESULTS
  ========================= */
  const { data, isLoading } = useQuery({
    queryKey: ["my-exam-results"],
    queryFn: () => examService.getMyAttempts(),
  });

  const attempts = data?.data?.attempts || data?.attempts || [];

  /* =========================
     🔁 POST-FINALIZATION SYNC
  ========================= */
  const onExamFinalized = async (examId?: string) => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["me"] }),
      queryClient.invalidateQueries({ queryKey: ["belt-progress"] }),
      queryClient.invalidateQueries({ queryKey: ["lessons"] }),
      queryClient.invalidateQueries({ queryKey: ["certificates"] }),
      examId &&
        queryClient.invalidateQueries({
          queryKey: ["exam-registration", examId],
        }),
    ]);
  };

  // 🔔 Trigger refresh ONCE when a passed exam is finalized
  useEffect(() => {
    if (!attempts?.length) return;

    const finalized = attempts.find((a: any) => a.finalizedAt && a.finalPassed);

    if (finalized?.exam?._id) {
      onExamFinalized(finalized.exam._id);
    }
  }, [attempts]);

  /* =========================
     LOADING
  ========================= */
  if (isLoading) {
    return (
      <div className="flex justify-center py-20 text-lg">
        Loading your exam results...
      </div>
    );
  }

  /* =========================
     RENDER
  ========================= */
  return (
    <div className="container py-10 space-y-8">
      <h1 className="text-3xl font-bold">My Exam Results</h1>

      {!attempts.length ? (
        <p className="text-muted-foreground">No exam attempts found.</p>
      ) : (
        <div className="space-y-6">
          {attempts.map((a: any) => {
            const exam = a.exam || {};
            const certificate = a.certificate;

            const theoryScore = a.theoryScore ?? "-";
            const finalScore = a.finalTotalScore ?? null;
            const finalized = Boolean(a.finalizedAt);
            const passed = Boolean(a.finalPassed);

            const statusLabel = finalized
              ? passed
                ? "Passed"
                : "Failed"
              : "Waiting Practical";

            const statusColor = finalized
              ? passed
                ? "bg-green-600"
                : "bg-red-600"
              : "bg-yellow-600";

            return (
              <Card key={a._id}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <div>
                      <p className="font-bold">{exam.title}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        Belt: {exam.beltLevel}
                      </p>
                    </div>
                    <Badge className={`${statusColor} text-white`}>
                      {statusLabel}
                    </Badge>
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div>
                      <strong>Theory:</strong>
                      <p>{theoryScore}</p>
                    </div>

                    <div>
                      <strong>Practical:</strong>
                      <p>{a.finalPracticalScores ? "Recorded" : "Pending"}</p>
                    </div>

                    <div>
                      <strong>Total:</strong>
                      <p>{finalScore ?? "-"}</p>
                    </div>

                    <div>
                      <strong>Submitted:</strong>
                      <p>
                        {a.submittedAt
                          ? new Date(a.submittedAt).toLocaleString()
                          : "-"}
                      </p>
                    </div>
                  </div>

                  {/* CERTIFICATE */}
                  {finalized && passed && certificate && (
                    <div className="pt-4 border-t">
                      <p className="font-medium">Certificate Issued</p>
                      <p className="text-sm text-muted-foreground">
                        Issued on{" "}
                        {new Date(certificate.issuedAt).toLocaleDateString()}
                      </p>

                      <Button
                        variant="outline"
                        className="mt-2"
                        onClick={() =>
                          window.open(
                            `${API_BASE_URL}/certificates/pdf/${exam._id}/${a.student}`,
                            "_blank"
                          )
                        }
                      >
                        View Certificate
                      </Button>
                    </div>
                  )}

                  <Button
                    variant="ghost"
                    onClick={() =>
                      navigate(`/student/exams/results?attempt=${a._id}`)
                    }
                  >
                    View Attempt
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
