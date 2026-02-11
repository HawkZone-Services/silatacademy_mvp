import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

import { AddLessonDialog } from "../AddLessonDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";

import lessonService from "@/features/lessons/api/lessonService";
import { useEffect, useState } from "react";

const LessonsScreen = ({ token }) => {
  const [lessons, setLessons] = useState<any[]>([]);

  const fetchLessons = async () => {
    try {
      const res = await lessonService.getLessons();
      const list = res?.data?.lessons || res?.lessons || res?.data || res || [];

      setLessons(list);
      console.log("Fetched Lessons:", list);
    } catch (err) {
      console.error("Fetch Lessons Error:", err);
      setLessons([]);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, [token]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Lessons</CardTitle>
            <CardDescription>
              Manage all lessons and training material
            </CardDescription>
          </div>
          <AddLessonDialog onLessonAdded={fetchLessons} />
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto border border-border/40 rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lesson</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {lessons.map((lesson) => (
                <TableRow key={lesson._id}>
                  <TableCell>{lesson.title}</TableCell>

                  <TableCell>
                    {lesson.program
                      ? `${lesson.program.title} (Level ${lesson.program.level})`
                      : "—"}
                  </TableCell>

                  <TableCell>{lesson.module?.title || "—"}</TableCell>

                  <TableCell>{lesson.order ?? "—"}</TableCell>

                  <TableCell>
                    {lesson.createdAt
                      ? new Date(lesson.createdAt).toLocaleDateString()
                      : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default LessonsScreen;
