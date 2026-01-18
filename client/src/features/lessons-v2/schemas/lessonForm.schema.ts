import { z } from "zod";

export const QuizQuestionSchema = z.object({
  text: z.string().min(1, "Question text is required"),
  choices: z
    .array(z.string().min(1, "Choice cannot be empty"))
    .min(2, "At least 2 choices are required"),
  correctIndex: z.number().min(0),
});

export const LessonFormSchema = z.object({
  module: z.string().min(1, "Module is required"),
  program: z.string().min(1),

  title: z.string().min(1, "Title is required"),
  order: z.number().min(1, "Order must be greater than 0"),

  videoUrl: z.string().optional(),
  technicalContent: z.string().optional(),
  content: z.string().optional(),
  medicalContent: z.string().optional(),
  psychologyContent: z.string().optional(),

  resources: z.array(z.string()).optional(),

  quiz: z
    .array(QuizQuestionSchema)
    .min(1, "At least one quiz question is required"),
});
