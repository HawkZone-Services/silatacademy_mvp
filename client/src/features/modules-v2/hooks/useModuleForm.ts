import { useRef, useState } from "react";

export type ModuleFormState = {
  program: string;
  title: string;
  moduleType: "A" | "B" | "P" | "E";
  beltLevel: string;
  order: number;

  objectives: string[];
  anatomyFocus: string[];
  repetitionGoal?: string;
  commonMistakes: string[];
};

type Args = {
  mode: "create" | "edit";
  initialData?: any;
};

export function useModuleForm({ mode, initialData }: Args) {
  const initialState: ModuleFormState =
    mode === "edit" && initialData
      ? {
          program: initialData.program?._id,
          title: initialData.title,
          moduleType: initialData.moduleType,
          beltLevel: initialData.beltLevel,
          order: initialData.order ?? 0,
          objectives: initialData.objectives || [],
          anatomyFocus: initialData.anatomyFocus || [],
          repetitionGoal: initialData.repetitionGoal,
          commonMistakes: initialData.commonMistakes || [],
        }
      : {
          program: "",
          title: "",
          moduleType: "A",
          beltLevel: "",
          order: 0,
          objectives: [],
          anatomyFocus: [],
          repetitionGoal: "",
          commonMistakes: [],
        };

  const initialRef = useRef(initialState);
  const [state, setState] = useState(initialState);

  const updateField = (key: keyof ModuleFormState, value: any) =>
    setState((p) => ({ ...p, [key]: value }));

  const isDirty = JSON.stringify(state) !== JSON.stringify(initialRef.current);

  return { state, updateField, isDirty, isEditMode: mode === "edit" };
}
