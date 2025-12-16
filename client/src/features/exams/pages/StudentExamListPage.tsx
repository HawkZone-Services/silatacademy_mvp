import { useQuery } from "@tanstack/react-query";
import { getExams } from "../api/getExams";
import { ExamList } from "../components/ExamList";

export default function StudentExamListPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["student-exams"],
    queryFn: getExams,
  });

  if (isLoading) return <p>Loading exams...</p>;

  return (
    <div className="p-4">
      <ExamList exams={data || []} />
    </div>
  );
}
