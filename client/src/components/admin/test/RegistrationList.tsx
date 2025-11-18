import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function RegistrationList({
  list = [],
  onApprove,
  onReject,
  onSelect,
}: any) {
  if (!Array.isArray(list)) return <div>No registrations found.</div>;

  return (
    <div className="space-y-3">
      {list.map((reg: any) => (
        <Card key={reg._id} className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-semibold">{reg.playerInfo?.name}</h4>
              <p className="text-sm text-muted-foreground">
                {reg.playerInfo?.beltLevel}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => {
                  onSelect(reg.player, reg.exam);
                }}
              >
                Score
              </Button>

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
          </div>
        </Card>
      ))}
    </div>
  );
}
