import { Button } from "@/components/ui/button";

import { Card } from "@/components/ui/card";

export function ExamList({ exams, onRefresh }) {
  return (
    <div className="space-y-3">
      {exams.map((exam: any) => (
        <Card key={exam._id} className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold">{exam.title}</h3>
              <p className="text-sm text-muted-foreground">
                Belt: {exam.beltLevel.toUpperCase()}
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                const token =
                  localStorage.getItem("token") ||
                  sessionStorage.getItem("token");
                await fetch(
                  `https://api-f3rwhuz64a-uc.a.run.app/api/exams/admin/${exam._id}/publish`,
                  {
                    method: "PATCH",
                    headers: { Authorization: `Bearer ${token}` },
                  }
                );

                onRefresh();
              }}
            >
              {exam.status === "published" ? "Published" : "Draft"}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
