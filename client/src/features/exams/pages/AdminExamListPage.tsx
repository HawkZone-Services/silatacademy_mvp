import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getExams } from "../api/getExams";
import { ExamList } from "../components/ExamList";
import { Button } from "@/components/ui/button";

export default function AdminExamListPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery(["admin-exams"], getExams);
  const exams = data?.data?.exams || data?.data || [];

  if (isLoading) return <div className="p-6">Loading exams...</div>;

  return (
    <div className="container py-8 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manage Exams</h1>
        <Button onClick={() => navigate("/admin/exams/new")}>Create Exam</Button>
      </div>
      <ExamList
        exams={exams}
        actionLabel="Edit"
        onSelect={(exam) => navigate(`/admin/exams/${exam._id}`)}
      />
    </div>
  );
}
