// src/features/admin/lessons/components/LessonsTable.tsx

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Lesson } from "../types";
import { EditLessonDialog } from "./EditLessonDialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteLessonAdmin } from "../api";
import { useToast } from "@/shared/hooks/use-toast";
import { useNavigate } from "react-router-dom";

type LessonsTableProps = {
  lessons: Lesson[];
};

export function LessonsTable({ lessons }: LessonsTableProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteLessonAdmin(id),
    onSuccess: () => {
      toast({
        title: "Lesson deleted",
        description: "The lesson has been deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-lessons"] });
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.error?.message ||
        err?.message ||
        "Failed to delete lesson";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });

  if (!lessons.length) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        No lessons created yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-border/40 rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Lesson</TableHead>
            <TableHead>Program</TableHead>
            <TableHead>Module</TableHead>
            <TableHead>Order</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {lessons.map((lesson) => (
            <TableRow key={lesson._id}>
              <TableCell className="font-medium">{lesson.title}</TableCell>

              <TableCell>
                {lesson.program && typeof lesson.program !== "string" ? (
                  <div className="flex flex-col">
                    <span>{lesson.program.title}</span>
                    {lesson.program.level && (
                      <span className="text-xs text-muted-foreground">
                        Level {lesson.program.level}
                      </span>
                    )}
                  </div>
                ) : (
                  "—"
                )}
              </TableCell>

              <TableCell>
                {lesson.module && typeof lesson.module !== "string"
                  ? lesson.module.title
                  : "—"}
              </TableCell>

              <TableCell>{lesson.order ?? "—"}</TableCell>

              <TableCell>
                <Badge
                  variant={lesson.isActive ? "default" : "outline"}
                  className={
                    lesson.isActive ? "bg-green-600 text-white" : "opacity-70"
                  }
                >
                  {lesson.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>

              <TableCell>
                {lesson.createdAt
                  ? new Date(lesson.createdAt).toLocaleDateString()
                  : "—"}
              </TableCell>

              <TableCell className="text-right space-x-2">
                <EditLessonDialog lesson={lesson} />
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={deleteMutation.isLoading}
                  onClick={() => deleteMutation.mutate(lesson._id)}
                >
                  Delete
                </Button>
              </TableCell>
              {/* ✅ زر فتح Quiz Builder */}
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/admin/lessons/${lesson._id}/quiz`)}
                >
                  Edit Quiz
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
