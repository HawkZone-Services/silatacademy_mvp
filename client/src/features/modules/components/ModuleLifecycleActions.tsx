import { Button } from "@/shared/ui/button";
import { useModuleActions } from "../hooks/useModuleActions";

type Props = {
  module: any;
  onUpdated?: (mod: any) => void;
};

export function ModuleLifecycleActions({ module, onUpdated }: Props) {
  const { activate, archive, loading, error } = useModuleActions(module._id);

  const confirm = (msg: string) => window.confirm(msg);

  const handleActivate = async () => {
    if (!confirm("Activate this module? It will be visible to students."))
      return;

    const updated = await activate();
    onUpdated?.(updated);
  };

  const handleArchive = async () => {
    if (!confirm("Archive this module? This action is irreversible.")) return;

    const updated = await archive();
    onUpdated?.(updated);
  };

  // 🧠 UI Rules
  if (module.status === "archived") return null;

  return (
    <div className="flex gap-2 items-center">
      {module.status !== "active" && (
        <Button variant="default" disabled={loading} onClick={handleActivate}>
          Activate
        </Button>
      )}

      <Button variant="destructive" disabled={loading} onClick={handleArchive}>
        Archive
      </Button>

      {error && <span className="text-red-500">{error}</span>}
    </div>
  );
}
