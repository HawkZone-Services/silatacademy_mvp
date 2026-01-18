import { z } from "zod";

export const ModuleFormSchema = z.object({
  program: z.string().min(1),
  title: z.string().min(1),
  moduleType: z.enum(["A", "B", "P", "E"]),
  beltLevel: z.string().min(1),
  order: z.number().min(0),

  objectives: z.array(z.string()).optional(),
  anatomyFocus: z.array(z.string()).optional(),
  repetitionGoal: z.string().optional(),
  commonMistakes: z.array(z.string()).optional(),
});
