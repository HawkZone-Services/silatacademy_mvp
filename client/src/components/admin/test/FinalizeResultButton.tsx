import { Button } from "@/components/ui/button";

export function FinalizeResultButton({ studentId, examId, onDone }: any) {
  return (
    <Button
      variant="secondary"
      onClick={async () => {
        const token = localStorage.getItem("token");
        await fetch(`/api/exams/finalize`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ studentId, examId }),
        });
        onDone();
      }}
    >
      Finalize Score
    </Button>
  );
}
