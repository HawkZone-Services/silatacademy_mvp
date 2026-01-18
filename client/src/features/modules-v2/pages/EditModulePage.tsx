import { useState } from "react";
import { ModuleLifecycleActions } from "../components/ModuleLifecycleActions";
import { ModuleStatusBadge } from "../components/ModuleStatusBadge";

export function EditModulePage({ moduleId }: any) {
  const [module, setModule] = useState<any>(null);

  // fetch module logic هنا (زي lessons-v2)

  if (!module) return null;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2>Edit Module</h2>
        <ModuleStatusBadge status={module.status} />
      </div>

      <ModuleLifecycleActions module={module} onUpdated={setModule} />

      <ModuleForm
        mode="edit"
        initialData={module}
        onSubmit={async (state) => {
          const res = await ModulesV2API.update(module._id, state);
          setModule(res.data.module);
        }}
      />
    </div>
  );
}
