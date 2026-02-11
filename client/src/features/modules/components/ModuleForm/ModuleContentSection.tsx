import { ModuleFormState } from "../../hooks/useModuleForm";

type Props = {
  state: ModuleFormState;
  updateField: (key: keyof ModuleFormState, value: any) => void;
};

export function ModuleContentSection({ state, updateField }: Props) {
  const textareaToArray = (v: string) =>
    v
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

  return (
    <section className="space-y-4 border rounded p-4">
      <h3 className="font-semibold">Module Content</h3>

      {/* Title */}
      <div>
        <label className="block text-sm">Title</label>
        <input
          type="text"
          value={state.title}
          onChange={(e) => updateField("title", e.target.value)}
          className="w-full border rounded p-2"
        />
      </div>

      {/* Objectives */}
      <div>
        <label className="block text-sm">Objectives (one per line)</label>
        <textarea
          rows={4}
          value={state.objectives.join("\n")}
          onChange={(e) =>
            updateField("objectives", textareaToArray(e.target.value))
          }
          className="w-full border rounded p-2"
        />
      </div>

      {/* Anatomy Focus */}
      <div>
        <label className="block text-sm">Anatomy Focus</label>
        <textarea
          rows={3}
          value={state.anatomyFocus.join("\n")}
          onChange={(e) =>
            updateField("anatomyFocus", textareaToArray(e.target.value))
          }
          className="w-full border rounded p-2"
        />
      </div>

      {/* Repetition Goal */}
      <div>
        <label className="block text-sm">Repetition Goal</label>
        <input
          type="text"
          value={state.repetitionGoal || ""}
          onChange={(e) => updateField("repetitionGoal", e.target.value)}
          className="w-full border rounded p-2"
        />
      </div>

      {/* Common Mistakes */}
      <div>
        <label className="block text-sm">Common Mistakes</label>
        <textarea
          rows={3}
          value={state.commonMistakes.join("\n")}
          onChange={(e) =>
            updateField("commonMistakes", textareaToArray(e.target.value))
          }
          className="w-full border rounded p-2"
        />
      </div>
    </section>
  );
}
