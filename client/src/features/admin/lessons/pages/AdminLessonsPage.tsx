// src/features/admin/lessons/pages/AdminLessonsPage.tsx

import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { AddLessonDialog } from "../components/AddLessonDialog";
import { LessonsTable } from "../components/LessonsTable";
import { getAdminLessons } from "../api";
import { Lesson } from "../types";

export default function AdminLessonsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-lessons"],
    queryFn: getAdminLessons,
  });

  const lessons: Lesson[] =
    data?.data?.lessons || data?.lessons || data?.data || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle>Lessons</CardTitle>
            <CardDescription>
              Manage all lessons and training material.
            </CardDescription>
          </div>
          <AddLessonDialog />
        </div>
      </CardHeader>

      <CardContent>
        {isLoading && (
          <p className="text-sm text-muted-foreground p-4">
            Loading lessons...
          </p>
        )}

        {isError && (
          <p className="text-sm text-red-600 p-4">
            Failed to load lessons. Please try again.
          </p>
        )}

        {!isLoading && !isError && <LessonsTable lessons={lessons} />}
      </CardContent>
    </Card>
  );
}
