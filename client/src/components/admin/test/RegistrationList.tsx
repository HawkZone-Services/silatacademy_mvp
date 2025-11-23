import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RegistrationListProps {
  list?: any[];
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onSelect?: (studentId: string, examId: string) => void;
}

export function RegistrationList({
  list = [],
  onApprove,
  onReject,
  onSelect,
}: RegistrationListProps) {
  const filtered = Array.isArray(list)
    ? list.filter((r) => !r?.finalPassed)
    : [];

  if (!filtered.length) {
    return (
      <div className="text-muted-foreground">
        No registrations or attempts found.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {filtered.map((reg: any) => {
        const studentId =
          reg?.student?._id ||
          reg?.player?._id ||
          reg?.student ||
          reg?.playerId;
        const examId = reg?.exam?._id || reg?.exam || reg?.examId;
        const isFinal = Boolean(reg?.finalPassed);

        const name =
          reg?.student?.name ||
          reg?.player?.name ||
          reg?.studentName ||
          reg?.playerName ||
          `Student ${studentId?.slice?.(-4) || ""}`;

        const examTitle =
          reg?.exam?.title || reg?.examTitle || `Exam ${examId?.slice?.(-4)}`;

        return (
          <Card key={reg._id} className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold">{name}</h3>
                <p className="text-sm text-muted-foreground">{examTitle}</p>

                {typeof reg.autoScore === "number" && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Theory score: {reg.theoryScore ?? reg.autoScore}{" "}
                    {reg.pass !== undefined && (
                      <Badge
                        variant={reg.pass ? "secondary" : "outline"}
                        className="ml-2"
                      >
                        {reg.pass ? "Passed" : "Not passed"}
                      </Badge>
                    )}
                  </p>
                )}

                {isFinal && (
                  <Badge variant="secondary" className="mt-2">
                    Finalized
                  </Badge>
                )}
              </div>

              <div className="flex flex-col items-end gap-2">
                {studentId && examId && onSelect && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isFinal}
                    onClick={() => onSelect(studentId, examId)}
                  >
                    {isFinal ? "Finalized" : "Select for practical scoring"}
                  </Button>
                )}

                {reg.status === "pending" && (
                  <div className="flex items-center gap-2">
                    {onApprove && (
                      <Button size="sm" onClick={() => onApprove(reg._id)}>
                        Approve
                      </Button>
                    )}
                    {onReject && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onReject(reg._id)}
                      >
                        Reject
                      </Button>
                    )}
                  </div>
                )}

                {reg.status && reg.status !== "pending" && (
                  <Badge variant="outline" className="capitalize">
                    {reg.status}
                  </Badge>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
