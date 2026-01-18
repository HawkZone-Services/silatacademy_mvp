//1️⃣ Lesson (Student-facing)

export type LessonContract = {
  _id: string;

  title: string;
  summary?: string;

  order: number;

  module: {
    _id: string;
    title: string;
    moduleType: "A" | "B" | "P" | "E";
    beltLevel: string;
  };

  program: {
    _id: string;
    title: string;
  };

  // content availability
  hasVideo: boolean;
  hasPDF: boolean;
  hasDrill: boolean;
  hasSafety: boolean;
  hasQuiz: boolean;

  // student-specific
  progress: LessonProgressContract | null;

  // access control
  locked: boolean;
  lockReason?: string;
};
//2️⃣ LessonProgress (Student Progress)
export type LessonProgressContract = {
  lessonState:
    | "not_started"
    | "video_done"
    | "pdf_done"
    | "drill_done"
    | "safety_done"
    | "quiz_passed"
    | "completed";

  videoCompleted: boolean;
  pdfCompleted: boolean;
  drillCompleted: boolean;
  safetyCompleted: boolean;

  quickCheckPassed: boolean;
  quickCheckScore?: number;

  assignmentRequired: boolean;
  assignmentStatus?: "pending" | "approved" | "rejected";

  completed: boolean;
};
//3️⃣ Lesson Form Payload (Create / Edit)
export type LessonFormPayload = {
  module: string; // moduleId
  program: string; // inferred – readonly in UI

  title: string;
  summary?: string;
  order: number;
  durationMinutes?: number;

  videoUrl?: string;

  technicalContent?: string; // PDF / theory
  content?: string; // drill guide
  medicalContent?: string; // safety
  psychologyContent?: string; // optional

  resources?: string[];

  quiz: QuizQuestionContract[];
};
//4️⃣ Quiz Contract (Quick Check)
export type QuizQuestionContract = {
  text: string;
  choices: string[];
  correctIndex: number;
};
