import { useEffect, useState } from "react";
import { ModulesV2API } from "../api/modules.api";
import { StudentModuleCard } from "../components/StudentModuleCard";

export function StudentModulesPage() {
  const [modules, setModules] = useState<any[]>([]);

  useEffect(() => {
    ModulesV2API.list().then((res) => {
      setModules(res.data.modules || []);
    });
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {modules.map((m) => (
        <StudentModuleCard key={m._id} module={m} />
      ))}
    </div>
  );
}
