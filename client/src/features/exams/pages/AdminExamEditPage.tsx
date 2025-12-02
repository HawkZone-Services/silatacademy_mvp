import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getExamById } from "../api/getExamById";
import { createExam } from "../api/admin/createExam";
import { updateExam } from "../api/admin/updateExam";
import { publishExam } from "../api/admin/publishExam";
import { finalizeExam } from "../api/admin/finalizeExam";
import { gradePractical } from "../api/admin/gradePractical";
import { AdminExamForm } from "../components/AdminExamForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminExamEditPage() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const isNew = !examId || examId === "new";
  const { data } = useQuery(["exam", examId], () => getExamById(examId!), {
    enabled: !!examId && !isNew,
  });

  const saveMutation = useMutation(
    (payload: any) => (isNew ? createExam(payload) : updateExam(examId!, payload)),
    {
      onSuccess: () => {
        qc.invalidateQueries(["admin-exams"]);
        if (isNew) navigate("/admin/exams");
      },
    }
  );

  const publishMutation = useMutation(() => publishExam(examId!), {
    onSuccess: () => qc.invalidateQueries(["admin-exams"]),
  });

  const finalizeMutation = useMutation(
    (payload: any) => finalizeExam(payload),
    {
      onSuccess: () => {
        qc.invalidateQueries(["admin-exams"]);
        qc.invalidateQueries(["exam", examId]);
      },
    }
  );

  const gradeMutation = useMutation((payload: any) => gradePractical(payload), {
    onSuccess: () => {
      qc.invalidateQueries(["admin-exams"]);
      qc.invalidateQueries(["exam", examId]);
    },
  });

  const [finalizeStudentId, setFinalizeStudentId] = useState("");
  const [gradeStudentId, setGradeStudentId] = useState("");
  const [gradeExamId, setGradeExamId] = useState("");
  const [technique, setTechnique] = useState<number | "">("");
  const [performance, setPerformance] = useState<number | "">("");
  const [discipline, setDiscipline] = useState<number | "">("");

  const exam = data?.data?.exam || data?.data;

  return (
    <div className="container py-8 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{isNew ? "Create Exam" : "Edit Exam"}</h1>
        {!isNew && (
          <Button
            variant="outline"
            disabled={publishMutation.isLoading}
            onClick={() => publishMutation.mutate()}
          >
            {publishMutation.isLoading ? "Publishing..." : "Publish"}
          </Button>
        )}
      </div>

      <AdminExamForm
        initial={exam}
        submitting={saveMutation.isLoading}
        onSubmit={(payload) => saveMutation.mutate(payload)}
      />

      {!isNew && (
        <div className="space-y-4 border rounded-lg p-4">
          <h2 className="text-lg font-semibold">Finalize Exam Result</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            <Input
              placeholder="Student ID"
              value={finalizeStudentId}
              onChange={(e) => setFinalizeStudentId(e.target.value)}
            />
            <Button
              disabled={finalizeMutation.isLoading}
              onClick={() =>
                finalizeMutation.mutate({
                  examId,
                  studentId: finalizeStudentId,
                })
              }
            >
              {finalizeMutation.isLoading ? "Finalizing..." : "Finalize"}
            </Button>
          </div>

          <h2 className="text-lg font-semibold pt-2">Grade Practical</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            <Input
              placeholder="Exam ID"
              value={gradeExamId || examId || ""}
              onChange={(e) => setGradeExamId(e.target.value)}
            />
            <Input
              placeholder="Student ID"
              value={gradeStudentId}
              onChange={(e) => setGradeStudentId(e.target.value)}
            />
            <Input
              placeholder="Technique score"
              type="number"
              value={technique}
              onChange={(e) => setTechnique(e.target.value === "" ? "" : Number(e.target.value))}
            />
            <Input
              placeholder="Performance score"
              type="number"
              value={performance}
              onChange={(e) => setPerformance(e.target.value === "" ? "" : Number(e.target.value))}
            />
            <Input
              placeholder="Discipline score"
              type="number"
              value={discipline}
              onChange={(e) => setDiscipline(e.target.value === "" ? "" : Number(e.target.value))}
            />
            <Button
              disabled={gradeMutation.isLoading}
              onClick={() =>
                gradeMutation.mutate({
                  examId: gradeExamId || examId,
                  studentId: gradeStudentId,
                  scores: {
                    technique: Number(technique) || 0,
                    performance: Number(performance) || 0,
                    discipline: Number(discipline) || 0,
                  },
                })
              }
            >
              {gradeMutation.isLoading ? "Grading..." : "Grade Practical"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
