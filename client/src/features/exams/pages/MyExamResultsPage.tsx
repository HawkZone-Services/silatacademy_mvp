import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "@/shared/api/apiClient";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import examService from "@/services/examService";

export default function MyExamResultsPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery(["my-exam-results"], () =>
    examService.getMyAttempts()
  );
  const attempts = data?.data?.attempts || data?.attempts || data?.data || [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-20 text-lg">
        Loading your exam results...
      </div>
    );
  }

  return (
    <div className="container py-10 space-y-8">
      <h1 className="text-3xl font-bold flex items-center gap-2">My Exam Results</h1>

      {!attempts.length ? (
        <p className="text-muted-foreground">No exam attempts found.</p>
      ) : (
        <div className="space-y-6">
          {attempts.map((a: any) => {
            const exam = a.exam || {};
            const certificate = a.certificate;
            const theoryScore = a.theoryScore ?? 0;
            const finalScore = a.finalTotalScore ?? null;
            const passed = a.finalPassed ?? false;
            const statusLabel = passed
              ? "Passed"
              : a.submittedAt && !passed
              ? "Failed"
              : "Pending";
            const statusColor = passed
              ? "bg-green-600"
              : a.submittedAt && !passed
              ? "bg-red-600"
              : "bg-yellow-600";
            const issuedAt =
              certificate?.issuedAt &&
              new Date(certificate.issuedAt).toLocaleDateString();

            return (
              <Card
                key={a._id}
                className="border-border/40 shadow-sm hover:shadow transition"
              >
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <div>
                      <p className="text-lg font-bold">{exam.title}</p>
                      <p className="text-muted-foreground text-sm capitalize">
                        Belt Level: {exam.beltLevel}
                      </p>
                    </div>

                    <Badge className={`${statusColor} text-white`}>{statusLabel}</Badge>
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div>
                      <strong>Theory Score:</strong>
                      <p>{theoryScore}</p>
                    </div>

                    <div>
                      <strong>Practical Score:</strong>
                      <p>{a.finalPracticalScores ? "Recorded" : "Pending"}</p>
                    </div>

                    <div>
                      <strong>Total Score:</strong>
                      <p>{finalScore ?? "-"}</p>
                    </div>

                    <div>
                      <strong>Submitted:</strong>
                      <p>
                        {a.submittedAt
                          ? new Date(a.submittedAt).toLocaleString()
                          : "Not submitted"}
                      </p>
                    </div>
                  </div>

                  {passed && certificate && (
                    <div className="pt-4 border-t">
                      <p className="font-medium">Certificate Issued</p>
                      <p className="text-sm text-muted-foreground">
                        Issued on: {issuedAt}
                      </p>

                      <Button
                        className="mt-2"
                        variant="outline"
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
                    className="flex items-center gap-2"
                    onClick={() => navigate(`/student/exams/${exam._id}`)}
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
