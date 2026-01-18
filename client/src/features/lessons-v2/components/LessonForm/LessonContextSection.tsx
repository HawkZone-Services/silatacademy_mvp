import { useModules } from "../../hooks/useModules";
import { LessonFormState } from "../../hooks/useLessonForm";

type Props = {
  state: LessonFormState;
  updateField: <K extends keyof LessonFormState>(
    key: K,
    value: LessonFormState[K]
  ) => void;
  isEditMode: boolean;
};

export function LessonContextSection({
  state,
  updateField,
  isEditMode,
}: Props) {
  const { modules, loading } = useModules();

  const handleModuleChange = (moduleId: string) => {
    const selected = modules.find((m) => m._id === moduleId);
    if (!selected) return;

    updateField("module", selected._id);
    updateField("program", selected.program._id);
  };

  return (
    <section>
      <h3>Lesson Context</h3>

      {/* Module Selection */}
      <label>
        Module
        <select
          value={state.module}
          onChange={(e) => handleModuleChange(e.target.value)}
          disabled={isEditMode || loading}
        >
          <option value="">Select module</option>
          {modules.map((m) => (
            <option key={m._id} value={m._id}>
              [{m.beltLevel.toUpperCase()} – {m.moduleType}] {m.title}
            </option>
          ))}
        </select>
      </label>

      {/* Program (auto-filled, read-only) */}
      <label>
        Program
        <input
          type="text"
          value={state.program}
          readOnly
          placeholder="Auto-filled from module"
        />
      </label>
    </section>
  );
}
