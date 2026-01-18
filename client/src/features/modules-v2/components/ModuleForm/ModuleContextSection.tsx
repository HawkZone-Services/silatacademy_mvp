import { ModuleFormState } from "../../hooks/useModuleForm";

type Props = {
  state: ModuleFormState;
  updateField: (key: keyof ModuleFormState, value: any) => void;
  isEditMode: boolean;
  status?: "draft" | "ready" | "active" | "archived";
};

export function ModuleContextSection({
  state,
  updateField,
  isEditMode,
  status,
}: Props) {
  const isLocked = status === "active" || status === "archived";

  return (
    <section className="space-y-4 border rounded p-4">
      <h3 className="font-semibold">Module Context</h3>

      {/* Program */}
      <div>
        <label className="block text-sm">Program</label>
        <input
          type="text"
          value={state.program}
          readOnly
          className="w-full border rounded p-2 bg-muted"
        />
      </div>

      {/* Module Type */}
      <div>
        <label className="block text-sm ">Module Type</label>
        <select
          value={state.moduleType}
          disabled={isLocked}
          onChange={(e) => updateField("moduleType", e.target.value)}
          className="w-full border rounded p-2"
        >
          <option value="A">A — Anatomy / Science</option>
          <option value="B">B — Behavior / Ethics</option>
          <option value="P">P — Physical Practice</option>
          <option value="E">E — Evaluation</option>
        </select>
      </div>

      {/* Belt Level */}
      <div>
        <label className="block text-sm">Belt Level</label>
        <input
          type="text"
          value={state.beltLevel}
          disabled={isLocked}
          onChange={(e) => updateField("beltLevel", e.target.value)}
          className="w-full border rounded p-2"
        />
      </div>

      {/* Order */}
      <div>
        <label className="block text-sm">Order</label>
        <input
          type="number"
          value={state.order}
          onChange={(e) => updateField("order", Number(e.target.value))}
          className="w-full border rounded p-2"
        />
      </div>
    </section>
  );
}
