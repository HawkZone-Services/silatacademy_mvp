export interface StudentExam {
  _id: string;
  title: string;
  description?: string;
  type: "belt" | "module" | "lesson-exam" | "theory" | "practical";
  requiredAttendance: number;

  unlocked: boolean;
  reasons?: string[];

  status?: "not_started" | "in_progress" | "completed";
  score?: number;
}
