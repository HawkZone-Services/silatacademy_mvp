import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getExams } from "../api/getExams";
import { ExamList } from "../components/ExamList";

export default function StudentExamListPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery(["exams"], getExams);

  const exams = data?.data?.exams || data?.data || [];

  if (isLoading) return <div className="p-6">Loading exams...</div>;

  return (
    <div className="container py-8 space-y-4">
      <h1 className="text-2xl font-bold">Available Exams</h1>
      <ExamList
        exams={exams}
        actionLabel="Open"
        onSelect={(exam) => navigate(`/student/exams/${exam._id}`)}
      />
    </div>
  );
}
