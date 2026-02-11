type Props = {
  onSave: () => void;
  onCancel?: () => void;
  disabled?: boolean;
  dirty: boolean;
  status?: "draft" | "ready" | "active" | "archived";
};

export function ModuleFormActions({
  onSave,
  onCancel,
  disabled,
  dirty,
  status,
}: Props) {
  const handleCancel = () => {
    if (dirty) {
      const ok = window.confirm("You have unsaved changes. Discard them?");
      if (!ok) return;
    }
    onCancel?.();
  };

  return (
    <div className="flex justify-end gap-2 mt-6">
      {status === "archived" && (
        <span className="text-sm text-red-500 mr-auto">
          Archived module — editing disabled
        </span>
      )}

      <button
        type="button"
        className="border rounded px-4 py-2"
        onClick={handleCancel}
      >
        Cancel
      </button>

      <button
        type="button"
        onClick={onSave}
        disabled={disabled || !dirty || status === "archived"}
        className="bg-black text-white rounded px-4 py-2 disabled:opacity-50"
      >
        Save
      </button>
    </div>
  );
}
