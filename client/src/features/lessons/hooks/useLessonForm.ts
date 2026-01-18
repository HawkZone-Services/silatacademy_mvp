export type LessonFormState = {
  module: string;
  program: string;

  title: string;
  summary?: string;
  order: number;
  durationMinutes?: number;

  videoUrl?: string;

  technicalContent?: string;
  content?: string;
  medicalContent?: string;
  psychologyContent?: string;

  resources: string[];
  quiz: QuizQuestion[];
};

export function useLessonForm(mode: "create" | "edit", initialData?: Lesson) {
  const initialState: LessonFormState =
    mode === "edit" && initialData
      ? {
          module: initialData.module._id,
          program: initialData.program._id,
          title: initialData.title,
          summary: initialData.summary,
          order: initialData.order,
          durationMinutes: initialData.durationMinutes,
          videoUrl: initialData.videoUrl,
          technicalContent: initialData.technicalContent,
          content: initialData.content,
          medicalContent: initialData.medicalContent,
          psychologyContent: initialData.psychologyContent,
          resources: initialData.resources || [],
          quiz: initialData.quiz || [],
        }
      : {
          module: "",
          program: "",
          title: "",
          summary: "",
          order: 1,
          resources: [],
          quiz: [],
        };

  const [state, setState] = useState(initialState);

  return { state, setState };
}

async function submit() {
  if (!isValid(state)) return;

  if (mode === "create") {
    await LessonsAPI.createLesson(state);
  } else {
    await LessonsAPI.updateLesson(lessonId, state);
  }
}
