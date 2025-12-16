// src/features/belt-ranking/components/BeltRankingTable.tsx

import { BeltRanking } from "../types/beltRanking.types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Props {
  data: BeltRanking[];
  onEdit: (belt: BeltRanking) => void;
  onDelete: (id: string) => void;
}

export default function BeltRankingTable({ data, onEdit, onDelete }: Props) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted">
          <tr>
            <th className="px-3 py-2 text-left">Order</th>
            <th className="px-3 py-2 text-left">Belt</th>
            <th className="px-3 py-2 text-left">Attendance</th>
            <th className="px-3 py-2 text-left">Lessons</th>
            <th className="px-3 py-2 text-left">Actions</th>
          </tr>
        </thead>

        <tbody>
          {data.map((belt) => (
            <tr key={belt._id} className="border-t align-top">
              <td className="px-3 py-2">{belt.order}</td>

              <td className="px-3 py-2">
                <div className="font-medium">{belt.name}</div>
                <Badge variant="outline" className="mt-1">
                  {belt.level}
                </Badge>
              </td>

              {/* Attendance Rules */}
              <td className="px-3 py-2 text-xs space-y-1">
                <div>
                  Sessions: <strong>{belt.attendance?.requiredSessions}</strong>
                </div>
                <div>
                  Hours: <strong>{belt.attendance?.requiredHours}</strong>
                </div>
                <div>
                  Min Rate: <strong>{belt.attendance?.minRate}%</strong>
                </div>
              </td>

              {/* Lesson Rules */}
              <td className="px-3 py-2 text-xs space-y-1">
                <div>
                  Total: <strong>{belt.lessons?.totalLessons}</strong>
                </div>
                <div>
                  Unlock Every: <strong>{belt.lessons?.unlockEvery}</strong>{" "}
                  sessions
                </div>
              </td>

              <td className="px-3 py-2 space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(belt)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onDelete(belt._id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
