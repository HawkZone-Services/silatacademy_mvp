import { useModuleForm } from "../../hooks/useModuleForm";
import { ModuleContextSection } from "./ModuleContextSection";
import { ModuleContentSection } from "./ModuleContentSection";
import { ModuleFormActions } from "./ModuleFormActions";
import { Card } from "@/shared/ui/card";

export function ModuleForm({ mode, initialData, onSubmit, onCancel }: any) {
  const { state, updateField, isDirty, isEditMode } = useModuleForm({
    mode,
    initialData,
  });

  return (
    <div>
      <Card className="space-y-6 p-6">
        <ModuleContextSection
          state={state}
          updateField={updateField}
          isEditMode={isEditMode}
          status={initialData?.status}
        />

        <ModuleContentSection state={state} updateField={updateField} />

        <ModuleFormActions
          onSave={() => onSubmit(state)}
          onCancel={onCancel}
          dirty={isDirty}
          status={initialData?.status}
        />
      </Card>
      {/* debug */}
      <pre>{JSON.stringify(state, null, 2)}</pre>
    </div>
  );
}
