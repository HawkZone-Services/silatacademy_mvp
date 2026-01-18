import { LessonFormSchema } from "../schemas/lessonForm.schema";
import { LessonFormState } from "./useLessonForm";
import { ZodError } from "zod";

export type LessonValidationResult = {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: string[];
};

export function useLessonValidation() {
  const validate = (state: LessonFormState): LessonValidationResult => {
    const warnings: string[] = [];

    // Soft warnings (do NOT block submit)
    if (!state.videoUrl) {
      warnings.push("No video added for this lesson.");
    }

    if (!state.medicalContent) {
      warnings.push("No safety / medical notes added.");
    }

    try {
      LessonFormSchema.parse(state);

      return {
        isValid: true,
        errors: {},
        warnings,
      };
    } catch (err) {
      if (err instanceof ZodError) {
        const errors: Record<string, string> = {};
        err.errors.forEach((e) => {
          const path = e.path.join(".");
          errors[path] = e.message;
        });

        return {
          isValid: false,
          errors,
          warnings,
        };
      }

      return {
        isValid: false,
        errors: { form: "Invalid lesson data" },
        warnings,
      };
    }
  };

  return { validate };
}
