import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";

export function RegistrationList({ list = [], onApprove, onReject }) {
  if (!list.length) {
    return <p className="text-muted-foreground">No registrations</p>;
  }

  return (
    <div className="space-y-2">
      {list.map((reg) => (
        <Card key={reg._id} className="p-3 flex justify-between">
          <div>
            <p className="font-semibold">{reg.student?.name}</p>
            <p className="text-xs text-muted-foreground">
              {reg.student?.email}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {reg.status === "pending" && (
              <>
                <Button size="sm" onClick={() => onApprove(reg._id)}>
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onReject(reg._id)}
                >
                  Reject
                </Button>
              </>
            )}

            {reg.status !== "pending" && (
              <Badge variant="outline">{reg.status}</Badge>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
